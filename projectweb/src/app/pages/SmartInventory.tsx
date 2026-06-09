import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroup } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';
import { setTracking } from '../utils/cookieTracker';
import { ArrowLeft, Plus, Minus, Trash2, Shuffle, TrendingDown, BarChart2, List, ListChecks } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import AddProductDialog from '../components/AddProductDialog';
import { getGeneratorStatus, startGenerator, stopGenerator } from '../services/tripBuddyApi';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

type ViewMode = 'standard' | 'list' | 'visual';

const CATEGORY_COLORS = [
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
];

type RandomTemplate = {
  productName: string;
  category: string;
  supermarkets: string[];
  units: string[];
  priceRange: [number, number];
  quantityRange: [number, number];
};

const RANDOM_PRODUCT_TEMPLATES: RandomTemplate[] = [
  {
    productName: 'Mici',
    category: 'Meat',
    supermarkets: ['Lidl', 'Kaufland', 'Carrefour'],
    units: ['buc', 'pachete'],
    priceRange: [18, 35],
    quantityRange: [1, 3],
  },
  {
    productName: 'Mustar',
    category: 'Sauces',
    supermarkets: ['Lidl', 'Penny', 'Carrefour'],
    units: ['buc'],
    priceRange: [4, 9],
    quantityRange: [1, 2],
  },
  {
    productName: 'Paine',
    category: 'Bakery',
    supermarkets: ['Lidl', 'Mega Image', 'Kaufland'],
    units: ['buc'],
    priceRange: [2.5, 6],
    quantityRange: [1, 4],
  },
  {
    productName: 'Bere',
    category: 'Drinks',
    supermarkets: ['Lidl', 'Auchan', 'Penny'],
    units: ['buc', 'pachete', 'L'],
    priceRange: [3.5, 18],
    quantityRange: [1, 6],
  },
  {
    productName: 'Ceafa de porc',
    category: 'Meat',
    supermarkets: ['Kaufland', 'Carrefour', 'Selgros'],
    units: ['kg'],
    priceRange: [22, 45],
    quantityRange: [1, 3],
  },
  {
    productName: 'Salata verde',
    category: 'Vegetables',
    supermarkets: ['Lidl', 'Penny', 'Mega Image'],
    units: ['buc'],
    priceRange: [3, 8],
    quantityRange: [1, 3],
  },
  {
    productName: 'Cartofi',
    category: 'Vegetables',
    supermarkets: ['Lidl', 'Kaufland', 'Carrefour'],
    units: ['kg'],
    priceRange: [4, 10],
    quantityRange: [1, 4],
  },
  {
    productName: 'Apa minerala',
    category: 'Drinks',
    supermarkets: ['Lidl', 'Auchan', 'Mega Image'],
    units: ['buc', 'L'],
    priceRange: [2, 7],
    quantityRange: [1, 6],
  },
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPrice(min: number, max: number): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(2));
}

export default function SmartInventory() {
  const navigate = useNavigate();
  const {
    currentGroup,
    currentMember,
    addProduct,
    claimProduct,
    updateProductQuantity,
    deleteProduct,
    isHydrated,
    isOffline,
    isSyncingPending,
    pendingSyncCount,
    syncPendingOperations,
  } = useGroup();
  const { hasPermission } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('standard');
  const [randomNotice, setRandomNotice] = useState('');
  const [generatorRunning, setGeneratorRunning] = useState(false);
  const canCreate = hasPermission('CREATE_ENTITY');
  const canUpdate = hasPermission('UPDATE_ENTITY');
  const canDelete = hasPermission('DELETE_ENTITY');

  const openAddDialog = React.useCallback(() => {
    if (!canCreate) {
      setRandomNotice('Read-only role: adding products requires CREATE_ENTITY.');
      return;
    }

    setTracking({
      lastInventoryAction: 'open_add_dialog',
      lastInventoryActionAt: new Date().toISOString(),
    });
    setIsAddDialogOpen(true);
  }, [canCreate]);

  const addRandomItem = React.useCallback(() => {
    if (!currentMember) return;
    if (!canCreate) {
      setRandomNotice('Read-only role: random products require CREATE_ENTITY.');
      return;
    }

    const template = pickRandom(RANDOM_PRODUCT_TEMPLATES);
    const supermarket = pickRandom(template.supermarkets);
    const unit = pickRandom(template.units);
    const quantity = randomInt(template.quantityRange[0], template.quantityRange[1]);
    const price = randomPrice(template.priceRange[0], template.priceRange[1]);

    addProduct({
      productName: template.productName,
      supermarket,
      price,
      quantity,
      unit,
      category: template.category,
      addedBy: currentMember.id,
      addedByName: currentMember.name,
      votes: {
        thumbsUp: [],
        thumbsDown: [],
      },
    });

    const randomLabel = `${template.productName} • ${supermarket} • ${quantity} ${unit}`;
    setRandomNotice(`Random added: ${randomLabel}`);

    setTracking({
      lastInventoryAction: 'random_generate',
      lastInventoryActionAt: new Date().toISOString(),
      lastRandomProduct: randomLabel,
    });
  }, [addProduct, canCreate, currentMember]);

  React.useEffect(() => {
    if (isHydrated && (!currentGroup || !currentMember)) {
      navigate('/home');
    }
  }, [currentGroup, currentMember, isHydrated, navigate]);

  React.useEffect(() => {
    setTracking({ inventoryViewMode: viewMode });
  }, [viewMode]);

  React.useEffect(() => {
    setTracking({ inventoryItemsCount: currentGroup?.products.length ?? 0 });
  }, [currentGroup?.products.length]);

  React.useEffect(() => {
    if (!randomNotice) return;

    const timer = window.setTimeout(() => {
      setRandomNotice('');
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [randomNotice]);

  React.useEffect(() => {
    void (async () => {
      try {
        const status = await getGeneratorStatus();
        setGeneratorRunning(status.running);
      } catch (_error) {
        // ignore
      }
    })();
  }, []);

  const handleToggleGenerator = React.useCallback(async () => {
    if (!canCreate) {
      setRandomNotice('Read-only role: generator controls require CREATE_ENTITY.');
      return;
    }

    try {
      if (generatorRunning) {
        const status = await stopGenerator();
        setGeneratorRunning(status.running);
        setRandomNotice('Generator stopped');
      } else {
        const status = await startGenerator(2000);
        setGeneratorRunning(status.running);
        setRandomNotice('Generator started: products incoming live');
      }
    } catch (_error) {
      setRandomNotice('Could not toggle generator (server unavailable)');
    }
  }, [canCreate, generatorRunning]);

  if (!isHydrated) {
    return null;
  }

  if (!currentGroup || !currentMember) {
    return null;
  }

  const categorizedProducts = currentGroup.products.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, typeof currentGroup.products>);

  const bestPrices = Object.entries(categorizedProducts)
      .map(([category, products]) => {
        const sortedByPrice = [...products].sort((a, b) => {
          const totalA = a.price * (a.quantity || 1);
          const totalB = b.price * (b.quantity || 1);
          return totalA - totalB;
        });

        return {
          category,
          bestProduct: sortedByPrice[0],
          worstProduct: sortedByPrice[sortedByPrice.length - 1],
          savings:
              sortedByPrice.length > 1
                  ? sortedByPrice[sortedByPrice.length - 1].price *
                  (sortedByPrice[sortedByPrice.length - 1].quantity || 1) -
                  sortedByPrice[0].price * (sortedByPrice[0].quantity || 1)
                  : 0,
        };
      })
      .filter((item) => item.savings > 0);

  const categoryChartData = Object.entries(categorizedProducts).map(([category, products]) => ({
    name: category,
    value: parseFloat(
        products.reduce((sum, p) => sum + p.price * (p.quantity || 1), 0).toFixed(2)
    ),
  }));

  const top3Items = [...currentGroup.products]
      .sort((a, b) => b.price * (b.quantity || 1) - a.price * (a.quantity || 1))
      .slice(0, 3)
      .map((p) => ({
        name: p.productName.length > 14 ? p.productName.slice(0, 13) + '…' : p.productName,
        total: parseFloat((p.price * (p.quantity || 1)).toFixed(2)),
      }));

  const grandTotal = currentGroup.products.reduce(
      (sum, p) => sum + p.price * (p.quantity || 1),
      0
  );

  return (
      <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#F8FAFC',
            paddingBottom: '96px',
            fontFamily: 'Inter, Arial, sans-serif',
          }}
      >
        <div
            style={{
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid #E5E7EB',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
        >
          <div
              style={{
                maxWidth: '672px',
                margin: '0 auto',
                padding: '16px',
              }}
          >
            {(isOffline || pendingSyncCount > 0) && (
                <div
                    style={{
                      marginBottom: '12px',
                      borderRadius: '12px',
                      border: '1px solid #F59E0B',
                      backgroundColor: '#FFFBEB',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                >
                  <div style={{ color: '#92400E', fontSize: '13px', fontWeight: 600 }}>
                    {isOffline
                      ? 'Offline mode active: changes are stored locally'
                      : `${pendingSyncCount} pending change(s) waiting to sync`}
                  </div>
                  {pendingSyncCount > 0 && (
                      <button
                          disabled={isSyncingPending}
                          onClick={() => {
                            void syncPendingOperations();
                          }}
                          style={{
                            border: '1px solid #D97706',
                            borderRadius: '8px',
                            backgroundColor: '#FFFFFF',
                            color: '#92400E',
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '6px 10px',
                            cursor: isSyncingPending ? 'default' : 'pointer',
                            opacity: isSyncingPending ? 0.65 : 1,
                          }}
                      >
                        {isSyncingPending ? 'Syncing...' : 'Sync now'}
                      </button>
                  )}
                </div>
            )}
            <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
            >
              <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
              >
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                      width: '36px',
                      height: '36px',
                      border: 'none',
                      background: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      borderRadius: '10px',
                    }}
                >
                  <ArrowLeft size={16} color="#0F172A" />
                </button>

                <h1
                    style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#111827',
                    }}
                >
                  Smart Inventory
                </h1>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {canCreate && (
                    <>
                      <button
                          onClick={() => {
                            void handleToggleGenerator();
                          }}
                          style={{
                            height: '36px',
                            border: generatorRunning ? '1px solid #DC2626' : '1px solid #16A34A',
                            borderRadius: '12px',
                            backgroundColor: '#FFFFFF',
                            color: generatorRunning ? '#DC2626' : '#15803D',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0 12px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}
                      >
                        {generatorRunning ? 'Stop Generator' : 'Start Generator'}
                      </button>
                      <button
                          onClick={addRandomItem}
                          style={{
                            height: '36px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '12px',
                            backgroundColor: '#FFFFFF',
                            color: '#111827',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0 12px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}
                      >
                        <Shuffle size={14} />
                        Random Item
                      </button>

                      <button
                          onClick={openAddDialog}
                          style={{
                            height: '36px',
                            border: 'none',
                            borderRadius: '12px',
                            backgroundColor: '#22C55E',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0 14px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                          }}
                      >
                        <Plus size={16} />
                        Add Item
                      </button>
                    </>
                )}
              </div>
            </div>

            <div
                style={{
                  marginTop: '12px',
                  display: 'flex',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '16px',
                  padding: '4px',
                  gap: '4px',
                }}
            >
              <SegmentButton
                  active={viewMode === 'standard'}
                  onClick={() => setViewMode('standard')}
                  icon={<ListChecks size={16} />}
                  label="Standard"
              />
              <SegmentButton
                  active={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  icon={<List size={16} />}
                  label="Descriptivă"
              />
              <SegmentButton
                  active={viewMode === 'visual'}
                  onClick={() => setViewMode('visual')}
                  icon={<BarChart2 size={16} />}
                  label="Statistici"
              />
            </div>

            {randomNotice && (
                <div
                    style={{
                      marginTop: '10px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1px solid #BBF7D0',
                      backgroundColor: '#F0FDF4',
                      color: '#166534',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                >
                  {randomNotice}
                </div>
            )}
          </div>
        </div>

        <div
            style={{
              maxWidth: '672px',
              margin: '0 auto',
              padding: '16px',
            }}
        >
          {viewMode === 'standard' && (
              <>
                {currentGroup.products.length === 0 ? (
                    <EmptyState
                        icon={<Plus size={32} color="#9CA3AF" />}
                        title="Nicio articol"
                        description="Începe să adaugi produse în lista de cumpărături"
                        buttonLabel={canCreate ? "Adauga primul produs" : "Read only"}
                        onClick={canCreate ? openAddDialog : () => undefined}
                        buttonColor={canCreate ? "#22C55E" : "#94A3B8"}
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div
                          style={{
                            padding: '16px',
                            borderRadius: '20px',
                            border: '1px solid #BFDBFE',
                            background: 'linear-gradient(to right, #EFF6FF, #ECFEFF)',
                          }}
                      >
                        <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                        >
                    <span
                        style={{
                          fontSize: '14px',
                          color: '#1D4ED8',
                        }}
                    >
                      Total estimat
                    </span>
                          <span
                              style={{
                                fontSize: '30px',
                                fontWeight: 700,
                                color: '#1E3A8A',
                              }}
                          >
                      ${grandTotal.toFixed(2)}
                    </span>
                        </div>

                        <div
                            style={{
                              marginTop: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                              color: '#2563EB',
                            }}
                        >
                          <span>{currentGroup.products.length} produse</span>
                          <span>{Object.keys(categorizedProducts).length} categorii</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {currentGroup.products.map((product) => {
                          const claimedByMember = currentGroup.members.find(
                              (m) => m.id === product.claimedBy
                          );
                          const isClaimed = !!product.claimedBy;
                          const isClaimedByMe = product.claimedBy === currentMember.id;
                          const quantity = product.quantity || 1;
                          const unit = product.unit || 'buc';
                          const totalPrice = product.price * quantity;

                          const handleQuantityDelta = (delta: number) => {
                            const nextQuantity = Math.max(1, quantity + delta);
                            updateProductQuantity(product.id, nextQuantity);
                          };

                          return (
                              <div
                                  key={product.id}
                                  style={{
                                    padding: '12px',
                                    borderRadius: '18px',
                                    border: `1px solid ${isClaimed ? '#E5E7EB' : '#E5E7EB'}`,
                                    backgroundColor: isClaimed ? '#F9FAFB' : '#FFFFFF',
                                  }}
                              >
                                <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '12px',
                                    }}
                                >
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3
                                        style={{
                                          margin: 0,
                                          fontSize: '14px',
                                          fontWeight: 600,
                                          color: '#111827',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                    >
                                      {product.productName}
                                    </h3>

                                    <div
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          marginTop: '2px',
                                        }}
                                    >
                              <span style={{ fontSize: '12px', color: '#6B7280' }}>
                                {product.supermarket}
                              </span>
                                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>•</span>
                                      <span style={{ fontSize: '12px', color: '#4B5563' }}>
                                {quantity} {unit}
                              </span>
                                    </div>
                                  </div>

                                  <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        flexShrink: 0,
                                      }}
                                  >
                                    <div style={{ textAlign: 'right' }}>
                                      <div
                                          style={{
                                            fontSize: '16px',
                                            fontWeight: 700,
                                            color: '#111827',
                                          }}
                                      >
                                        ${totalPrice.toFixed(2)}
                                      </div>

                                      {quantity > 1 && (
                                          <div
                                              style={{
                                                fontSize: '12px',
                                                color: '#6B7280',
                                              }}
                                          >
                                            ${product.price.toFixed(2)}/{unit}
                                          </div>
                                      )}
                                    </div>

                                    {isClaimed && claimedByMember ? (
                                        <div
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              fontSize: '12px',
                                              padding: '6px 10px',
                                              borderRadius: '9999px',
                                              backgroundColor: '#DBEAFE',
                                              color: '#1D4ED8',
                                              fontWeight: 500,
                                            }}
                                        >
                                          <div
                                              style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '9999px',
                                                backgroundColor: '#3B82F6',
                                              }}
                                          />
                                          {isClaimedByMe ? 'Tu' : claimedByMember.name.split(' ')[0]}
                                        </div>
                                    ) : canUpdate ? (
                                        <button
                                            onClick={() => {
                                              claimProduct(product.id, currentMember.id);
                                            }}
                                            style={{
                                              height: '32px',
                                              padding: '0 12px',
                                              borderRadius: '10px',
                                              border: '1px solid #D1D5DB',
                                              backgroundColor: '#FFFFFF',
                                              color: '#111827',
                                              fontSize: '12px',
                                              cursor: 'pointer',
                                            }}
                                        >
                                          Claim
                                        </button>
                                    ) : (
                                        <div
                                            style={{
                                              height: '32px',
                                              padding: '0 10px',
                                              borderRadius: '10px',
                                              backgroundColor: '#F1F5F9',
                                              color: '#64748B',
                                              display: 'flex',
                                              alignItems: 'center',
                                              fontSize: '12px',
                                              fontWeight: 600,
                                            }}
                                        >
                                          Read only
                                        </div>
                                    )}
                                  </div>
                                </div>

                                <div
                                    style={{
                                      marginTop: '10px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '10px',
                                    }}
                                >
                                  {canUpdate ? (
                                      <div
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                          }}
                                      >
                                        <button
                                            onClick={() => handleQuantityDelta(-1)}
                                            disabled={isClaimed}
                                            style={{
                                              width: '28px',
                                              height: '28px',
                                              borderRadius: '8px',
                                              border: '1px solid #D1D5DB',
                                              backgroundColor: '#FFFFFF',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              cursor: isClaimed ? 'not-allowed' : 'pointer',
                                              opacity: isClaimed ? 0.5 : 1,
                                            }}
                                        >
                                          <Minus size={14} />
                                        </button>

                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>
                                      Qty: {quantity} {unit}
                                    </span>

                                        <button
                                            onClick={() => handleQuantityDelta(1)}
                                            disabled={isClaimed}
                                            style={{
                                              width: '28px',
                                              height: '28px',
                                              borderRadius: '8px',
                                              border: '1px solid #D1D5DB',
                                              backgroundColor: '#FFFFFF',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              cursor: isClaimed ? 'not-allowed' : 'pointer',
                                              opacity: isClaimed ? 0.5 : 1,
                                            }}
                                        >
                                          <Plus size={14} />
                                        </button>
                                      </div>
                                  ) : (
                                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                                    Qty: {quantity} {unit}
                                  </span>
                                  )}

                                  {canDelete && (
                                      <button
                                          onClick={() => deleteProduct(product.id)}
                                          style={{
                                            height: '30px',
                                            padding: '0 10px',
                                            borderRadius: '10px',
                                            border: '1px solid #FCA5A5',
                                            backgroundColor: '#FEF2F2',
                                            color: '#B91C1C',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            cursor: 'pointer',
                                          }}
                                      >
                                        <Trash2 size={13} />
                                        Delete
                                      </button>
                                  )}
                                </div>
                              </div>
                          );
                        })}
                      </div>
                    </div>
                )}
              </>
          )}

          {viewMode === 'visual' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {currentGroup.products.length === 0 ? (
                    <div
                        style={{
                          padding: '48px',
                          textAlign: 'center',
                          borderRadius: '24px',
                          border: '1px solid #E5E7EB',
                          backgroundColor: '#FFFFFF',
                        }}
                    >
                      <BarChart2 size={48} color="#D1D5DB" style={{ margin: '0 auto 12px auto' }} />
                      <h3
                          style={{
                            margin: '0 0 4px 0',
                            fontWeight: 600,
                            color: '#374151',
                          }}
                      >
                        Nicio statistică
                      </h3>
                      <p
                          style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#6B7280',
                          }}
                      >
                        Adaugă produse pentru a vedea statistici
                      </p>
                    </div>
                ) : (
                    <>
                      <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                            gap: '12px',
                          }}
                      >
                        <StatCard
                            value={`$${grandTotal.toFixed(2)}`}
                            label="Total coș"
                            bg="linear-gradient(to bottom right, #F0FDF4, #ECFDF5)"
                            border="#BBF7D0"
                            valueColor="#15803D"
                            labelColor="#16A34A"
                        />
                        <StatCard
                            value={`${currentGroup.products.length}`}
                            label="Produse"
                            bg="linear-gradient(to bottom right, #EFF6FF, #F0F9FF)"
                            border="#BFDBFE"
                            valueColor="#1D4ED8"
                            labelColor="#2563EB"
                        />
                        <StatCard
                            value={`${Object.keys(categorizedProducts).length}`}
                            label="Categorii"
                            bg="linear-gradient(to bottom right, #FAF5FF, #F5F3FF)"
                            border="#DDD6FE"
                            valueColor="#7E22CE"
                            labelColor="#9333EA"
                        />
                      </div>

                      <PanelCard>
                        <h3
                            style={{
                              margin: '0 0 4px 0',
                              fontWeight: 600,
                              color: '#111827',
                            }}
                        >
                          Cost total pe categorie
                        </h3>
                        <p
                            style={{
                              margin: '0 0 16px 0',
                              fontSize: '12px',
                              color: '#6B7280',
                            }}
                        >
                          Distribuția cheltuielilor pe categorii
                        </p>

                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Pie
                                data={categoryChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={100}
                                paddingAngle={3}
                                dataKey="value"
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                            >
                              {categoryChartData.map((_, index) => (
                                  <Cell
                                      key={`cell-${index}`}
                                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                                  />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']} />
                            <Legend
                                formatter={(value) => (
                                    <span style={{ fontSize: '12px', color: '#374151' }}>{value}</span>
                                )}
                            />
                          </PieChart>
                        </ResponsiveContainer>

                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {categoryChartData.map((item, index) => (
                              <div
                                  key={item.name}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: '14px',
                                  }}
                              >
                                <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                    }}
                                >
                                  <div
                                      style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '9999px',
                                        backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                                        flexShrink: 0,
                                      }}
                                  />
                                  <span style={{ color: '#374151' }}>{item.name}</span>
                                </div>

                                <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                    }}
                                >
                          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                            {grandTotal > 0 ? ((item.value / grandTotal) * 100).toFixed(1) : 0}%
                          </span>
                                  <span style={{ fontWeight: 600, color: '#111827' }}>
                            ${item.value.toFixed(2)}
                          </span>
                                </div>
                              </div>
                          ))}
                        </div>
                      </PanelCard>

                      {top3Items.length > 0 && (
                          <PanelCard>
                            <h3
                                style={{
                                  margin: '0 0 4px 0',
                                  fontWeight: 600,
                                  color: '#111827',
                                }}
                            >
                              Top 3 produse ca preț
                            </h3>
                            <p
                                style={{
                                  margin: '0 0 16px 0',
                                  fontSize: '12px',
                                  color: '#6B7280',
                                }}
                            >
                              Cele mai costisitoare articole din lista ta
                            </p>

                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={top3Items} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#6b7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `$${v}`}
                                />
                                <Tooltip
                                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total']}
                                    cursor={{ fill: '#f9fafb' }}
                                />
                                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                  {top3Items.map((_, index) => (
                                      <Cell
                                          key={`bar-${index}`}
                                          fill={index === 0 ? '#22c55e' : index === 1 ? '#3b82f6' : '#f59e0b'}
                                      />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>

                            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {top3Items.map((item, index) => (
                                  <div
                                      key={item.name}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        fontSize: '14px',
                                      }}
                                  >
                                    <div
                                        style={{
                                          width: '24px',
                                          height: '24px',
                                          borderRadius: '9999px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: '#FFFFFF',
                                          fontSize: '12px',
                                          fontWeight: 700,
                                          flexShrink: 0,
                                          backgroundColor:
                                              index === 0 ? '#22c55e' : index === 1 ? '#3b82f6' : '#f59e0b',
                                        }}
                                    >
                                      {index + 1}
                                    </div>

                                    <span
                                        style={{
                                          flex: 1,
                                          color: '#374151',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                    >
                            {item.name}
                          </span>

                                    <span style={{ fontWeight: 600, color: '#111827' }}>
                            ${item.total.toFixed(2)}
                          </span>
                                  </div>
                              ))}
                            </div>
                          </PanelCard>
                      )}

                      {bestPrices.length > 0 && (
                          <InsightCard
                              title="Economii Smart"
                              bg="linear-gradient(to right, #F0FDF4, #ECFDF5)"
                              border="#BBF7D0"
                              iconBg="#22C55E"
                              icon={<TrendingDown size={20} color="#FFFFFF" />}
                              titleColor="#14532D"
                              textColor="#166534"
                              items={bestPrices.map((item) => (
                                  <div key={item.category} style={{ fontSize: '14px' }}>
                                    <strong>{item.category}:</strong> Economisești ${item.savings.toFixed(2)} alegând{' '}
                                    {item.bestProduct.supermarket}
                                  </div>
                              ))}
                          />
                      )}
                    </>
                )}
              </div>
          )}

          {viewMode === 'list' && (
              <>
                {bestPrices.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <InsightCard
                          title="Smart Savings"
                          bg="linear-gradient(to right, #F0FDF4, #ECFDF5)"
                          border="#BBF7D0"
                          iconBg="#22C55E"
                          icon={<TrendingDown size={20} color="#FFFFFF" />}
                          titleColor="#14532D"
                          textColor="#166534"
                          items={bestPrices.map((item) => (
                              <div key={item.category} style={{ fontSize: '14px' }}>
                                <strong>{item.category}:</strong> Save ${item.savings.toFixed(2)} by choosing{' '}
                                {item.bestProduct.supermarket}
                              </div>
                          ))}
                      />
                    </div>
                )}

                {currentGroup.products.length === 0 ? (
                    <EmptyState
                        icon={<Plus size={32} color="#9CA3AF" />}
                        title="No items yet"
                        description="Start adding products to your shopping list"
                        buttonLabel={canCreate ? "Add First Item" : "Read only"}
                        onClick={canCreate ? openAddDialog : () => undefined}
                        buttonColor={canCreate ? "#22C55E" : "#94A3B8"}
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {Object.entries(categorizedProducts).map(([category, products]) => {
                        const lowestCategoryTotal = Math.min(
                            ...products.map((p) => p.price * (p.quantity || 1))
                        );

                        return (
                          <div key={category}>
                            <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  marginBottom: '12px',
                                }}
                            >
                              <h2
                                  style={{
                                    margin: 0,
                                    fontWeight: 600,
                                    color: '#111827',
                                  }}
                              >
                                {category}
                              </h2>
                              <span
                                  style={{
                                    fontSize: '14px',
                                    color: '#6B7280',
                                  }}
                              >
                        {products.length} items
                      </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {products.map((product) => (
                                  <ProductCard
                                      key={product.id}
                                      product={product}
                                      isLowestPrice={
                                          products.length > 1 &&
                                          product.price * (product.quantity || 1) === lowestCategoryTotal
                                      }
                                  />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                )}
              </>
          )}
        </div>

        {canCreate && (
            <>
              <button
                  onClick={openAddDialog}
                  style={{
                    position: 'fixed',
                    right: 'max(16px, calc((100vw - 672px) / 2 + 16px))',
                    bottom: '24px',
                    zIndex: 20,
                    height: '44px',
                    border: 'none',
                    borderRadius: '14px',
                    backgroundColor: '#22C55E',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0 14px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    boxShadow: '0 10px 24px rgba(34, 197, 94, 0.35)',
                  }}
              >
                <Plus size={16} />
                Add Product
              </button>

              <AddProductDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
            </>
        )}
      </div>
  );
}

function SegmentButton({
                         active,
                         onClick,
                         icon,
                         label,
                       }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
      <button
          onClick={onClick}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: active ? '#FFFFFF' : 'transparent',
            boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            color: active ? '#111827' : '#6B7280',
            fontSize: '12px',
            fontWeight: active ? 600 : 500,
          }}
      >
        {icon}
        {label}
      </button>
  );
}

function PanelCard({ children }: { children: React.ReactNode }) {
  return (
      <div
          style={{
            padding: '20px',
            borderRadius: '24px',
            border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
          }}
      >
        {children}
      </div>
  );
}

function StatCard({
                    value,
                    label,
                    bg,
                    border,
                    valueColor,
                    labelColor,
                  }: {
  value: string;
  label: string;
  bg: string;
  border: string;
  valueColor: string;
  labelColor: string;
}) {
  return (
      <div
          style={{
            padding: '16px',
            textAlign: 'center',
            borderRadius: '20px',
            background: bg,
            border: `1px solid ${border}`,
          }}
      >
        <div
            style={{
              fontSize: '30px',
              fontWeight: 700,
              color: valueColor,
            }}
        >
          {value}
        </div>
        <div
            style={{
              fontSize: '12px',
              marginTop: '4px',
              color: labelColor,
            }}
        >
          {label}
        </div>
      </div>
  );
}

function InsightCard({
                       title,
                       bg,
                       border,
                       iconBg,
                       icon,
                       titleColor,
                       textColor,
                       items,
                     }: {
  title: string;
  bg: string;
  border: string;
  iconBg: string;
  icon: React.ReactNode;
  titleColor: string;
  textColor: string;
  items: React.ReactNode[];
}) {
  return (
      <div
          style={{
            padding: '16px',
            borderRadius: '20px',
            background: bg,
            border: `1px solid ${border}`,
          }}
      >
        <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
        >
          <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
          >
            {icon}
          </div>

          <div style={{ flex: 1 }}>
            <h3
                style={{
                  margin: '0 0 8px 0',
                  fontWeight: 600,
                  color: titleColor,
                }}
            >
              {title}
            </h3>

            <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  color: textColor,
                }}
            >
              {items}
            </div>
          </div>
        </div>
      </div>
  );
}

function EmptyState({
                      icon,
                      title,
                      description,
                      buttonLabel,
                      onClick,
                      buttonColor,
                    }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  buttonColor: string;
}) {
  return (
      <div
          style={{
            padding: '48px',
            textAlign: 'center',
            borderRadius: '24px',
            border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
          }}
      >
        <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '9999px',
              backgroundColor: '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
        >
          {icon}
        </div>

        <h3
            style={{
              margin: '0 0 8px 0',
              fontWeight: 600,
              color: '#111827',
            }}
        >
          {title}
        </h3>

        <p
            style={{
              margin: '0 0 16px 0',
              fontSize: '14px',
              color: '#6B7280',
            }}
        >
          {description}
        </p>

        <button
            onClick={onClick}
            style={{
              height: '40px',
              padding: '0 14px',
              border: 'none',
              borderRadius: '12px',
              backgroundColor: buttonColor,
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
        >
          {buttonLabel}
        </button>
      </div>
  );
}
