import { Group, Member, Product } from "../models/types";
import { getGroupsStore } from "../store/memoryStore";
import { HttpError } from "../utils/errors";
import { createId, createShareCode } from "../utils/id";
import { paginate } from "../utils/pagination";
import { CreateGroupInput, JoinGroupInput, UpdateGroupInput } from "../validators/groupValidators";
import { CreateMemberInput, UpdateMemberInput } from "../validators/memberValidators";
import { CreateProductInput, UpdateProductInput } from "../validators/productValidators";

function groups(): Group[] {
  return getGroupsStore();
}

function findGroupIndex(groupId: string): number {
  return groups().findIndex((group) => group.id === groupId);
}

function findGroupOrThrow(groupId: string): Group {
  const group = groups().find((item) => item.id === groupId);
  if (!group) {
    throw new HttpError(404, "Group not found");
  }
  return group;
}

function ensureUniqueShareCode(): string {
  const codes = new Set(groups().map((group) => group.shareCode));
  return createShareCode(codes);
}

export function createGroup(input: CreateGroupInput): Group {
  const group: Group = {
    id: createId(),
    name: input.name,
    shareCode: ensureUniqueShareCode(),
    joinPassword: input.joinPassword,
    location: input.location,
    cabinDetails: input.cabinDetails,
    createdAt: new Date().toISOString(),
    members: [],
    products: [],
  };

  groups().unshift(group);
  return group;
}

export function listGroups(page: number, limit: number) {
  return paginate(groups(), page, limit);
}

export function listGroupsForAuthUser(authUserId: string): Group[] {
  return groups().filter((group) => group.members.some((member) => member.authUserId === authUserId));
}

export function isAuthUserInGroup(groupId: string, authUserId: string): boolean {
  const group = findGroupOrThrow(groupId);
  return group.members.some((member) => member.authUserId === authUserId);
}

export function getGroupById(groupId: string): Group {
  return findGroupOrThrow(groupId);
}

export function updateGroup(groupId: string, input: UpdateGroupInput): Group {
  const group = findGroupOrThrow(groupId);

  if (typeof input.name !== "undefined") {
    group.name = input.name;
  }
  if (typeof input.joinPassword !== "undefined") {
    group.joinPassword = input.joinPassword;
  }
  if (typeof input.cabinDetails !== "undefined") {
    group.cabinDetails = input.cabinDetails;
  }
  if (typeof input.location !== "undefined") {
    group.location = {
      ...group.location,
      ...input.location,
    };
  }

  return group;
}

export function deleteGroup(groupId: string): Group {
  const index = findGroupIndex(groupId);
  if (index === -1) {
    throw new HttpError(404, "Group not found");
  }
  const [removed] = groups().splice(index, 1);
  return removed;
}

export function joinGroupByCode(input: JoinGroupInput): Group {
  const group = groups().find((item) => item.shareCode === input.shareCode.toUpperCase());
  if (!group) {
    throw new HttpError(404, "Group not found for this share code");
  }
  if ((group.joinPassword ?? "") !== input.joinPassword) {
    throw new HttpError(401, "Invalid group password");
  }
  return group;
}

export function listMembers(groupId: string, page: number, limit: number) {
  const group = findGroupOrThrow(groupId);
  return paginate(group.members, page, limit);
}

export function addMember(groupId: string, input: CreateMemberInput): Member {
  const group = findGroupOrThrow(groupId);

  const duplicate = group.members.find((member) => member.name.toLowerCase() === input.name.toLowerCase());
  if (duplicate) {
    throw new HttpError(409, "A member with this name already exists in this group");
  }

  const member: Member = {
    id: createId(),
    ...input,
  };

  group.members.push(member);
  return member;
}

export function updateMember(groupId: string, memberId: string, input: UpdateMemberInput): Member {
  const group = findGroupOrThrow(groupId);
  const member = group.members.find((item) => item.id === memberId);
  if (!member) {
    throw new HttpError(404, "Member not found");
  }

  Object.assign(member, input);
  return member;
}

export function deleteMember(groupId: string, memberId: string): Member {
  const group = findGroupOrThrow(groupId);
  const index = group.members.findIndex((item) => item.id === memberId);
  if (index === -1) {
    throw new HttpError(404, "Member not found");
  }
  const [removed] = group.members.splice(index, 1);

  group.products = group.products.map((product) => {
    if (product.claimedBy === memberId) {
      return { ...product, claimedBy: undefined };
    }

    if (product.votes) {
      return {
        ...product,
        votes: {
          thumbsUp: product.votes.thumbsUp.filter((voterId) => voterId !== memberId),
          thumbsDown: product.votes.thumbsDown.filter((voterId) => voterId !== memberId),
        },
      };
    }

    return product;
  });

  return removed;
}

export function listProducts(groupId: string, page: number, limit: number) {
  const group = findGroupOrThrow(groupId);
  return paginate(group.products, page, limit);
}

export function addProduct(groupId: string, input: CreateProductInput): Product {
  const group = findGroupOrThrow(groupId);

  const product: Product = {
    id: createId(),
    ...input,
    votes: input.votes ?? { thumbsUp: [], thumbsDown: [] },
  };

  group.products.unshift(product);
  return product;
}

export function getProduct(groupId: string, productId: string): Product {
  const group = findGroupOrThrow(groupId);
  const product = group.products.find((item) => item.id === productId);
  if (!product) {
    throw new HttpError(404, "Product not found");
  }
  return product;
}

export function updateProduct(groupId: string, productId: string, input: UpdateProductInput): Product {
  const group = findGroupOrThrow(groupId);
  const index = group.products.findIndex((item) => item.id === productId);
  if (index === -1) {
    throw new HttpError(404, "Product not found");
  }

  const previous = group.products[index];
  const merged: Product = {
    ...previous,
    ...input,
  };

  if (input.photo === null) {
    delete merged.photo;
  }
  if (input.claimedBy === null) {
    delete merged.claimedBy;
  }

  group.products[index] = merged;
  return merged;
}

export function deleteProduct(groupId: string, productId: string): Product {
  const group = findGroupOrThrow(groupId);
  const index = group.products.findIndex((item) => item.id === productId);
  if (index === -1) {
    throw new HttpError(404, "Product not found");
  }
  const [removed] = group.products.splice(index, 1);
  return removed;
}

export function getGroupsStatistics() {
  const store = groups();
  const totalGroups = store.length;
  const totalMembers = store.reduce((sum, group) => sum + group.members.length, 0);
  const totalProducts = store.reduce((sum, group) => sum + group.products.length, 0);

  const groupsByAddress = store.reduce<Record<string, number>>((acc, group) => {
    const key = group.location.address;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalGroups,
    totalMembers,
    totalProducts,
    averageMembersPerGroup: totalGroups === 0 ? 0 : Number((totalMembers / totalGroups).toFixed(2)),
    averageProductsPerGroup: totalGroups === 0 ? 0 : Number((totalProducts / totalGroups).toFixed(2)),
    groupsByAddress,
  };
}

export function getGroupStatistics(groupId: string) {
  const group = findGroupOrThrow(groupId);
  const totalCost = group.products.reduce((sum, product) => sum + product.price * (product.quantity ?? 1), 0);
  const claimedItems = group.products.filter((product) => Boolean(product.claimedBy)).length;

  const memberContributions = group.products.reduce<Record<string, number>>((acc, product) => {
    acc[product.addedByName] = (acc[product.addedByName] ?? 0) + 1;
    return acc;
  }, {});

  return {
    groupId: group.id,
    groupName: group.name,
    membersCount: group.members.length,
    productsCount: group.products.length,
    claimedItems,
    unclaimedItems: group.products.length - claimedItems,
    totalEstimatedCost: Number(totalCost.toFixed(2)),
    memberContributions,
  };
}

export function getProductsStatistics(groupId: string) {
  const group = findGroupOrThrow(groupId);
  const products = group.products;

  if (products.length === 0) {
    return {
      totalItems: 0,
      averageItemCost: 0,
      totalEstimatedCost: 0,
      mostExpensive: null,
      cheapest: null,
      itemsByCategory: {},
      claimedVsUnclaimed: { claimed: 0, unclaimed: 0 },
    };
  }

  const totals = products.map((item) => ({
    ...item,
    totalCost: item.price * (item.quantity ?? 1),
  }));

  const itemsByCategory = products.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});

  const claimed = products.filter((item) => Boolean(item.claimedBy)).length;
  const totalEstimatedCost = totals.reduce((sum, item) => sum + item.totalCost, 0);

  const sortedByTotal = [...totals].sort((a, b) => a.totalCost - b.totalCost);

  return {
    totalItems: products.length,
    averageItemCost: Number((totalEstimatedCost / products.length).toFixed(2)),
    totalEstimatedCost: Number(totalEstimatedCost.toFixed(2)),
    mostExpensive: {
      id: sortedByTotal[sortedByTotal.length - 1].id,
      productName: sortedByTotal[sortedByTotal.length - 1].productName,
      totalCost: Number(sortedByTotal[sortedByTotal.length - 1].totalCost.toFixed(2)),
    },
    cheapest: {
      id: sortedByTotal[0].id,
      productName: sortedByTotal[0].productName,
      totalCost: Number(sortedByTotal[0].totalCost.toFixed(2)),
    },
    itemsByCategory,
    claimedVsUnclaimed: {
      claimed,
      unclaimed: products.length - claimed,
    },
  };
}
