import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Group, Member, Product } from '../types';
import {
  addMember as apiAddMember,
  addProduct as apiAddProduct,
  deleteProduct as apiDeleteProduct,
  getGroup as apiGetGroup,
  updateProduct as apiUpdateProduct,
} from '../services/tripBuddyApi';
import { ApiError, apiRequest, pingServer, subscribeServerReachability } from '../services/networkClient';
import { addOfflineOperation, flushOfflineQueue, getOfflineQueue } from '../services/offlineQueue';
import { connectRealtime, subscribeRealtimeGroup, unsubscribeRealtimeGroup } from '../services/realtimeClient';
import { API_BASE_URL } from '../services/config';
import { useAuth } from './AuthContext';

export type UserGroupMembership = {
  groupId: string;
  memberId: string;
  memberName: string;
  joinedAt: string;
};

export type UserGroupOption = {
  group: Group;
  member: Member | null;
  membership: UserGroupMembership;
};

interface GroupContextType {
  currentGroup: Group | null;
  currentMember: Member | null;
  isHydrated: boolean;
  isOffline: boolean;
  isSyncingPending: boolean;
  pendingSyncCount: number;
  setCurrentGroup: (group: Group | null) => void;
  setCurrentMember: (member: Member | null) => void;
  clearCurrentSelection: () => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  claimProduct: (productId: string, memberId: string) => void;
  updateGroupDetails: (details: Partial<Group>) => void;
  getAllGroups: () => Group[];
  getUserGroups: () => UserGroupOption[];
  selectUserGroup: (groupId: string) => boolean;
  selectGroupWithMember: (group: Group, member: Member) => void;
  voteProduct: (productId: string, memberId: string, voteType: 'up' | 'down') => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  deleteProduct: (productId: string) => void;
  syncPendingOperations: () => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

function createTemporaryId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function withLocalStorage<T>(runner: () => T): T | null {
  try {
    return runner();
  } catch (_error) {
    return null;
  }
}

function userStorageKey(userId: string, suffix: string): string {
  return `authUser:${userId}:${suffix}`;
}

function readStoredJson<T>(key: string, fallback: T): T {
  const value = withLocalStorage<T>(() => JSON.parse(localStorage.getItem(key) || 'null'));
  return value ?? fallback;
}

export function GroupProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentGroup, setCurrentGroupState] = useState<Group | null>(null);
  const [currentMember, setCurrentMemberState] = useState<Member | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncingPending, setIsSyncingPending] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const isSyncingRef = React.useRef(false);
  const userId = user?.id ?? null;

  const persistGroup = React.useCallback((group: Group | null) => {
    if (!group) {
      localStorage.removeItem('currentGroup');
      return;
    }

    localStorage.setItem('currentGroup', JSON.stringify(group));
    const groups = withLocalStorage<Group[]>(() => JSON.parse(localStorage.getItem('groups') || '[]')) || [];
    const index = groups.findIndex((item) => item.id === group.id);
    if (index >= 0) {
      groups[index] = group;
    } else {
      groups.push(group);
    }
    localStorage.setItem('groups', JSON.stringify(groups));
  }, []);

  const setAndPersistGroup = React.useCallback((group: Group | null) => {
    setCurrentGroupState(group);
    persistGroup(group);
    if (userId) {
      if (group) {
        localStorage.setItem(userStorageKey(userId, 'currentGroup'), JSON.stringify(group));
      } else {
        localStorage.removeItem(userStorageKey(userId, 'currentGroup'));
      }
    }
  }, [persistGroup, userId]);

  const clearCurrentSelection = React.useCallback(() => {
    setCurrentGroupState(null);
    setCurrentMemberState(null);
    localStorage.removeItem('currentGroup');
    localStorage.removeItem('currentMember');

    if (userId) {
      localStorage.removeItem(userStorageKey(userId, 'currentGroup'));
      localStorage.removeItem(userStorageKey(userId, 'currentMember'));
    }
  }, [userId]);

  const refreshCurrentGroupFromServer = React.useCallback(async (groupId: string) => {
    try {
      const remoteGroup = await apiGetGroup(groupId);
      setAndPersistGroup(remoteGroup);
      setIsOffline(false);
    } catch (error) {
      if (error instanceof ApiError && error.offline) {
        setIsOffline(true);
        return;
      }

      if (error instanceof ApiError && error.status === 404) {
        clearCurrentSelection();
      }
    }
  }, [clearCurrentSelection, setAndPersistGroup]);

  const upsertIncomingProduct = React.useCallback((group: Group, incoming: Product): Group => {
    const sameIdIndex = group.products.findIndex((item) => item.id === incoming.id);
    if (sameIdIndex >= 0) {
      const updatedProducts = [...group.products];
      updatedProducts[sameIdIndex] = incoming;
      return {
        ...group,
        products: updatedProducts,
      };
    }

    const duplicateBySignature = group.products.find((item) =>
      item.productName === incoming.productName &&
      item.supermarket === incoming.supermarket &&
      item.price === incoming.price &&
      (item.quantity ?? 1) === (incoming.quantity ?? 1) &&
      item.addedBy === incoming.addedBy &&
      item.addedByName === incoming.addedByName
    );

    if (duplicateBySignature) {
      return {
        ...group,
        products: group.products.map((item) => (item.id === duplicateBySignature.id ? incoming : item)),
      };
    }

    return {
      ...group,
      products: [incoming, ...group.products],
    };
  }, []);

  const syncPendingOperations = React.useCallback(async () => {
    if (isSyncingRef.current) {
      return;
    }

    isSyncingRef.current = true;
    setIsSyncingPending(true);

    try {
      const online = await pingServer();
      if (!online) {
        setIsOffline(true);
        setPendingSyncCount(getOfflineQueue().length);
        return;
      }

      const result = await flushOfflineQueue(async (operation) => {
        await apiRequest(`${API_BASE_URL}${operation.path}`, {
          method: operation.method,
          body: operation.body ? JSON.stringify(operation.body) : undefined,
        });
      }, (_operation, error) => {
        if (error instanceof ApiError) {
          if (error.offline) return true;
          if (error.status >= 500) return true;
          return false;
        }

        return true;
      });

      setPendingSyncCount(getOfflineQueue().length);
      setIsOffline(false);

      if (result.processed > 0 && currentGroup) {
        await refreshCurrentGroupFromServer(currentGroup.id);
      }
    } finally {
      isSyncingRef.current = false;
      setIsSyncingPending(false);
      setPendingSyncCount(getOfflineQueue().length);
    }
  }, [currentGroup, refreshCurrentGroupFromServer]);

  useEffect(() => {
    if (!userId) {
      setCurrentGroupState(null);
      setCurrentMemberState(null);
      localStorage.removeItem('currentGroup');
      localStorage.removeItem('currentMember');
      setIsHydrated(true);
      return;
    }

    const savedGroup = readStoredJson<Group | null>(userStorageKey(userId, 'currentGroup'), null);
    const savedMember = readStoredJson<Member | null>(userStorageKey(userId, 'currentMember'), null);

    setCurrentGroupState(savedGroup);
    setCurrentMemberState(savedMember);

    if (savedGroup) {
      localStorage.setItem('currentGroup', JSON.stringify(savedGroup));
    } else {
      localStorage.removeItem('currentGroup');
    }

    if (savedMember) {
      localStorage.setItem('currentMember', JSON.stringify(savedMember));
    } else {
      localStorage.removeItem('currentMember');
    }

    if (savedGroup) {
      void refreshCurrentGroupFromServer(savedGroup.id);
    }

    setPendingSyncCount(getOfflineQueue().length);
    setIsOffline(!navigator.onLine);
    setIsHydrated(true);
  }, [refreshCurrentGroupFromServer, userId]);

  useEffect(() => {
    const onOnline = () => {
      void syncPendingOperations();
    };

    const onOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [syncPendingOperations]);

  useEffect(() => {
    const unsubscribe = subscribeServerReachability((reachable) => {
      setIsOffline(!reachable);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentGroup || !userId) return;

    const disconnect = connectRealtime((event) => {
      if (!currentGroup) return;
      const payloadGroupId = event?.payload?.groupId;
      if (!payloadGroupId || payloadGroupId !== currentGroup.id) return;

      if (event.type === 'product_created') {
        const incoming = event.payload.product as Product;
        setAndPersistGroup(upsertIncomingProduct(currentGroup, incoming));
      }

      if (event.type === 'product_updated') {
        const incoming = event.payload.product as Product;
        setAndPersistGroup({
          ...currentGroup,
          products: currentGroup.products.map((item) => (item.id === incoming.id ? incoming : item)),
        });
      }

      if (event.type === 'product_deleted') {
        const productId = event.payload.productId as string;
        setAndPersistGroup({
          ...currentGroup,
          products: currentGroup.products.filter((item) => item.id !== productId),
        });
      }

      if (event.type === 'generator_product_created') {
        const incoming = event.payload.product as Product;
        setAndPersistGroup(upsertIncomingProduct(currentGroup, incoming));
      }
    });

    subscribeRealtimeGroup(currentGroup.id, userId);

    return () => {
      unsubscribeRealtimeGroup(currentGroup.id);
      disconnect();
    };
  }, [currentGroup, setAndPersistGroup, upsertIncomingProduct, userId]);

  // Save to localStorage whenever state changes
  const setCurrentGroup = (group: Group | null) => {
    const previousGroupId = currentGroup?.id;
    setAndPersistGroup(group);

    if (group && previousGroupId !== group.id) {
      setCurrentMemberState(null);
      localStorage.removeItem('currentMember');
      if (userId) {
        localStorage.removeItem(userStorageKey(userId, 'currentMember'));
      }
    }

    if (group) {
      void refreshCurrentGroupFromServer(group.id);
    }
  };

  const setCurrentMember = (member: Member | null) => {
    setCurrentMemberState(member);

    if (member) {
      localStorage.setItem('currentMember', JSON.stringify(member));
      if (userId) {
        localStorage.setItem(userStorageKey(userId, 'currentMember'), JSON.stringify(member));
      }
    } else {
      localStorage.removeItem('currentMember');
      if (userId) {
        localStorage.removeItem(userStorageKey(userId, 'currentMember'));
      }
    }

    if (!member || !currentGroup) {
      return;
    }

    const normalizedMember: Member = {
      ...member,
      id: member.id,
      authUserId: member.authUserId ?? userId ?? undefined,
    };

    const memberExists = currentGroup.members.some((m) => m.id === normalizedMember.id);
    const sameNameExists = currentGroup.members.some(
      (m) => m.name.toLowerCase() === normalizedMember.name.toLowerCase()
    );
    const updatedMembers = memberExists
      ? currentGroup.members.map((m) => (m.id === normalizedMember.id ? normalizedMember : m))
      : [...currentGroup.members, normalizedMember];

    setAndPersistGroup({
      ...currentGroup,
      members: updatedMembers,
    });

    if (userId) {
      const memberships = readStoredJson<UserGroupMembership[]>(
        userStorageKey(userId, 'memberships'),
        []
      );
      const membership: UserGroupMembership = {
        groupId: currentGroup.id,
        memberId: normalizedMember.id,
        memberName: normalizedMember.name,
        joinedAt: new Date().toISOString(),
      };
      const nextMemberships = [
        membership,
        ...memberships.filter((item) => item.groupId !== currentGroup.id),
      ];
      localStorage.setItem(userStorageKey(userId, 'memberships'), JSON.stringify(nextMemberships));
    }

    if (sameNameExists) {
      return;
    }

    void (async () => {
      try {
        const created = await apiAddMember(currentGroup.id, {
          authUserId: normalizedMember.authUserId,
          name: normalizedMember.name,
          gender: normalizedMember.gender,
          ageRange: normalizedMember.ageRange,
          drinkLevel: normalizedMember.drinkLevel,
          foodAppetite: normalizedMember.foodAppetite,
        });

        setCurrentMemberState(created);
        localStorage.setItem('currentMember', JSON.stringify(created));
        if (userId) {
          localStorage.setItem(userStorageKey(userId, 'currentMember'), JSON.stringify(created));
        }

        setAndPersistGroup({
          ...currentGroup,
          members: currentGroup.members.some((m) => m.id === created.id)
            ? currentGroup.members.map((m) => (m.id === created.id ? created : m))
            : [...currentGroup.members.filter((m) => m.id !== normalizedMember.id), created],
          products: currentGroup.products.map((product) =>
            product.addedBy === normalizedMember.id
              ? { ...product, addedBy: created.id, addedByName: created.name }
              : product
          ),
        });

        if (userId) {
          const memberships = readStoredJson<UserGroupMembership[]>(
            userStorageKey(userId, 'memberships'),
            []
          );
          const membership: UserGroupMembership = {
            groupId: currentGroup.id,
            memberId: created.id,
            memberName: created.name,
            joinedAt: new Date().toISOString(),
          };
          localStorage.setItem(
            userStorageKey(userId, 'memberships'),
            JSON.stringify([membership, ...memberships.filter((item) => item.groupId !== currentGroup.id)])
          );
        }

        setIsOffline(false);
      } catch (error) {
        if (error instanceof ApiError && error.offline) {
          setIsOffline(true);
          addOfflineOperation({
            method: 'POST',
            path: `/api/groups/${currentGroup.id}/members`,
            body: {
              authUserId: normalizedMember.authUserId,
              name: normalizedMember.name,
              gender: normalizedMember.gender,
              ageRange: normalizedMember.ageRange,
              drinkLevel: normalizedMember.drinkLevel,
              foodAppetite: normalizedMember.foodAppetite,
            },
          });
          setPendingSyncCount(getOfflineQueue().length);
        }
      }
    })();
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    if (!currentGroup) return;

    const optimisticProduct: Product = {
      ...product,
      id: createTemporaryId('product'),
    };

    const optimisticGroup = {
      ...currentGroup,
      products: [optimisticProduct, ...currentGroup.products],
    };
    setAndPersistGroup(optimisticGroup);

    void (async () => {
      try {
        const created = await apiAddProduct(currentGroup.id, product);
        setAndPersistGroup({
          ...optimisticGroup,
          products: optimisticGroup.products.map((item) => (item.id === optimisticProduct.id ? created : item)),
        });
        setIsOffline(false);
      } catch (error) {
        if (error instanceof ApiError && error.offline) {
          setIsOffline(true);
          addOfflineOperation({
            method: 'POST',
            path: `/api/groups/${currentGroup.id}/products`,
            body: product,
          });
          setPendingSyncCount(getOfflineQueue().length);
          return;
        }

        setAndPersistGroup({
          ...currentGroup,
          products: currentGroup.products,
        });
      }
    })();
  };

  const claimProduct = (productId: string, memberId: string) => {
    if (!currentGroup) return;
    
    const updatedProducts = currentGroup.products.map(p => 
      p.id === productId ? { ...p, claimedBy: memberId || undefined } : p
    );

    const updatedGroup = {
      ...currentGroup,
      products: updatedProducts
    };
    setAndPersistGroup(updatedGroup);

    void (async () => {
      try {
        await apiUpdateProduct(currentGroup.id, productId, { claimedBy: memberId || null });
        setIsOffline(false);
      } catch (error) {
        if (error instanceof ApiError && error.offline) {
          setIsOffline(true);
          addOfflineOperation({
            method: 'PUT',
            path: `/api/groups/${currentGroup.id}/products/${productId}`,
            body: { claimedBy: memberId || null },
          });
          setPendingSyncCount(getOfflineQueue().length);
        }
      }
    })();
  };

  const updateGroupDetails = (details: Partial<Group>) => {
    if (!currentGroup) return;
    
    const updatedGroup = {
      ...currentGroup,
      ...details
    };
    setAndPersistGroup(updatedGroup);
  };

  const getAllGroups = (): Group[] => {
    const groups = localStorage.getItem('groups');
    if (!groups) return [];

    try {
      return JSON.parse(groups);
    } catch (error) {
      localStorage.removeItem('groups');
      return [];
    }
  };

  const getUserGroups = (): UserGroupOption[] => {
    if (!userId) return [];

    const memberships = readStoredJson<UserGroupMembership[]>(
      userStorageKey(userId, 'memberships'),
      []
    );
    const groups = getAllGroups();

    return memberships
      .map((membership) => {
        const group = groups.find((item) => item.id === membership.groupId);
        if (!group) return null;
        return {
          group,
          membership,
          member: group.members.find((member) => member.id === membership.memberId) ?? null,
        };
      })
      .filter((item): item is UserGroupOption => Boolean(item));
  };

  const selectUserGroup = (groupId: string): boolean => {
    const option = getUserGroups().find((item) => item.group.id === groupId);
    if (!option) {
      return false;
    }

    setAndPersistGroup(option.group);
    setCurrentMemberState(option.member);

    if (option.member) {
      localStorage.setItem('currentMember', JSON.stringify(option.member));
      if (userId) {
        localStorage.setItem(userStorageKey(userId, 'currentMember'), JSON.stringify(option.member));
      }
    }

    return true;
  };

  const selectGroupWithMember = (group: Group, member: Member): void => {
    setAndPersistGroup(group);
    setCurrentMemberState(member);
    localStorage.setItem('currentMember', JSON.stringify(member));

    if (!userId) {
      return;
    }

    localStorage.setItem(userStorageKey(userId, 'currentMember'), JSON.stringify(member));
    localStorage.setItem(userStorageKey(userId, 'currentGroup'), JSON.stringify(group));

    const memberships = readStoredJson<UserGroupMembership[]>(
      userStorageKey(userId, 'memberships'),
      []
    );
    const membership: UserGroupMembership = {
      groupId: group.id,
      memberId: member.id,
      memberName: member.name,
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem(
      userStorageKey(userId, 'memberships'),
      JSON.stringify([membership, ...memberships.filter((item) => item.groupId !== group.id)])
    );
  };

  const voteProduct = (productId: string, memberId: string, voteType: 'up' | 'down') => {
    if (!currentGroup) return;
    
    const updatedProducts = currentGroup.products.map(p => {
      if (p.id !== productId) return p;
      
      // Initialize votes if they don't exist
      const votes = p.votes || { thumbsUp: [], thumbsDown: [] };
      let newThumbsUp = [...votes.thumbsUp];
      let newThumbsDown = [...votes.thumbsDown];
      
      // Remove from both arrays first
      newThumbsUp = newThumbsUp.filter(id => id !== memberId);
      newThumbsDown = newThumbsDown.filter(id => id !== memberId);
      
      // Add to the appropriate array (toggle if same vote)
      if (voteType === 'up' && !votes.thumbsUp.includes(memberId)) {
        newThumbsUp.push(memberId);
      } else if (voteType === 'down' && !votes.thumbsDown.includes(memberId)) {
        newThumbsDown.push(memberId);
      }
      
      return { ...p, votes: { thumbsUp: newThumbsUp, thumbsDown: newThumbsDown } };
    });

    const updatedGroup = {
      ...currentGroup,
      products: updatedProducts
    };
    setAndPersistGroup(updatedGroup);

    void (async () => {
      try {
        await apiUpdateProduct(currentGroup.id, productId, { votes: updatedProducts.find((p) => p.id === productId)?.votes });
        setIsOffline(false);
      } catch (error) {
        if (error instanceof ApiError && error.offline) {
          setIsOffline(true);
          const product = updatedProducts.find((item) => item.id === productId);
          addOfflineOperation({
            method: 'PUT',
            path: `/api/groups/${currentGroup.id}/products/${productId}`,
            body: { votes: product?.votes },
          });
          setPendingSyncCount(getOfflineQueue().length);
        }
      }
    })();
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (!currentGroup) return;
    
    const updatedProducts = currentGroup.products.map(p => 
      p.id === productId ? { ...p, quantity } : p
    );

    const updatedGroup = {
      ...currentGroup,
      products: updatedProducts
    };
    setAndPersistGroup(updatedGroup);

    void (async () => {
      try {
        await apiUpdateProduct(currentGroup.id, productId, { quantity });
        setIsOffline(false);
      } catch (error) {
        if (error instanceof ApiError && error.offline) {
          setIsOffline(true);
          addOfflineOperation({
            method: 'PUT',
            path: `/api/groups/${currentGroup.id}/products/${productId}`,
            body: { quantity },
          });
          setPendingSyncCount(getOfflineQueue().length);
        }
      }
    })();
  };

  const deleteProduct = (productId: string) => {
    if (!currentGroup) return;
    
    const updatedProducts = currentGroup.products.filter(p => p.id !== productId);

    const updatedGroup = {
      ...currentGroup,
      products: updatedProducts
    };
    setAndPersistGroup(updatedGroup);

    void (async () => {
      try {
        await apiDeleteProduct(currentGroup.id, productId);
        setIsOffline(false);
      } catch (error) {
        if (error instanceof ApiError && error.offline) {
          setIsOffline(true);
          addOfflineOperation({
            method: 'DELETE',
            path: `/api/groups/${currentGroup.id}/products/${productId}`,
          });
          setPendingSyncCount(getOfflineQueue().length);
        }
      }
    })();
  };

  useEffect(() => {
    if (!currentGroup || !currentMember) return;

    const isMemberInGroup = currentGroup.members.some((m) => m.id === currentMember.id);
    if (isMemberInGroup) return;

    setAndPersistGroup({
      ...currentGroup,
      members: [...currentGroup.members, currentMember],
    });
  }, [currentGroup, currentMember, setAndPersistGroup]);

  return (
    <GroupContext.Provider
      value={{
        currentGroup,
        currentMember,
        isHydrated,
        isOffline,
        isSyncingPending,
        pendingSyncCount,
        setCurrentGroup,
        setCurrentMember,
        clearCurrentSelection,
        addProduct,
        claimProduct,
        updateGroupDetails,
        getAllGroups,
        getUserGroups,
        selectUserGroup,
        selectGroupWithMember,
        voteProduct,
        updateProductQuantity,
        deleteProduct,
        syncPendingOperations,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
}
