import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroup } from '../context/GroupContext';
import {
  ArrowLeft,
  MapPin,
  Key,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Users,
  ChefHat,
  Beer,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Smart Appetite Predictor helpers
// ─────────────────────────────────────────────────────────────
function getAlcoholRecommendations(avgDrink: number, count: number) {
  const beersPerPerson =
      avgDrink <= 1 ? 0.5 :
          avgDrink <= 2 ? 1.5 :
              avgDrink <= 3 ? 2.5 :
                  avgDrink <= 4 ? 3.5 : 5;

  const wineBottles =
      avgDrink <= 2 ? 0 :
          avgDrink <= 3 ? 0.5 :
              avgDrink <= 4 ? 1 : 1.5;

  return {
    beers: Math.ceil(beersPerPerson * count),
    wine: parseFloat((wineBottles * (count / 4)).toFixed(1)),
    beersPerPerson,
  };
}

function getFoodRecommendations(avgFood: number, count: number) {
  const meatGrams =
      avgFood <= 1 ? 150 :
          avgFood <= 2 ? 250 :
              avgFood <= 3 ? 350 :
                  avgFood <= 4 ? 500 : 700;

  return {
    meatKg: parseFloat(((meatGrams * count) / 1000).toFixed(2)),
    saladG: Math.ceil((avgFood * 80 + 100) * count),
    corn: avgFood >= 3 ? count : Math.ceil(count / 2),
    meatGrams,
  };
}

function getDrinkLabel(avg: number) {
  if (avg <= 1.5) return 'Ușor 🥤';
  if (avg <= 2.5) return 'Moderat 🍺';
  if (avg <= 3.5) return 'Consistent 🍻';
  if (avg <= 4.5) return 'Heavy 🍷';
  return 'Party Mode 🎉';
}

function getFoodLabel(avg: number) {
  if (avg <= 1.5) return 'Mic apetit 🥗';
  if (avg <= 2.5) return 'Moderat 🍽️';
  if (avg <= 3.5) return 'Bun 🥩';
  if (avg <= 4.5) return 'Vorace 🍖';
  return 'Concurs de mâncat 🏆';
}

// ─────────────────────────────────────────────────────────────
// SmartAppetitePredictor Component
// ─────────────────────────────────────────────────────────────
function SmartAppetitePredictor({
                                  members,
                                }: {
  members: Array<{ drinkLevel: number; foodAppetite: number; name: string }>;
}) {
  if (members.length === 0) {
    return (
        <div
            style={{
              padding: '20px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #1d4ed8 100%)',
              color: '#FFFFFF',
            }}
        >
          <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}
          >
            <Sparkles size={20} color="#FCD34D" />
            <span style={{ fontWeight: 700 }}>Smart Appetite Predictor</span>
            <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontWeight: 600,
                }}
            >
            AI ✨
          </span>
          </div>

          <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: 'rgba(255,255,255,0.75)',
              }}
          >
            Adaugă membri în grup pentru a genera predicții automate.
          </p>
        </div>
    );
  }

  const count = members.length;
  const avgDrink = members.reduce((s, m) => s + m.drinkLevel, 0) / count;
  const avgFood = members.reduce((s, m) => s + m.foodAppetite, 0) / count;
  const alcohol = getAlcoholRecommendations(avgDrink, count);
  const food = getFoodRecommendations(avgFood, count);

  return (
      <div
          style={{
            borderRadius: '20px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #1d4ed8 100%)',
            boxShadow: '0 8px 32px rgba(79,70,229,0.35)',
          }}
      >
        <div style={{ padding: '20px 20px 12px 20px' }}>
          <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px',
              }}
          >
            <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
            >
              <Sparkles size={16} color="#FCD34D" />
            </div>

            <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '16px' }}>
            Smart Appetite Predictor
          </span>

            <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '12px',
                  background: 'rgba(250,204,21,0.9)',
                  color: '#713f12',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                }}
            >
            AI ✨
          </span>
          </div>

          <p
              style={{
                margin: '0 0 0 40px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.65)',
              }}
          >
            Bazat pe profilurile celor {count} membri
          </p>
        </div>

        <div
            style={{
              padding: '0 20px 12px 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '12px',
            }}
        >
          <div
              style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '14px',
                padding: '12px',
                backdropFilter: 'blur(8px)',
              }}
          >
            <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px',
                }}
            >
              <Beer size={16} color="#FCD34D" />
              <span
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                  }}
              >
              Nivel băut
            </span>
            </div>

            <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  marginBottom: '4px',
                }}
            >
              <div
                  style={{
                    height: '100%',
                    width: `${(avgDrink / 5) * 100}%`,
                    background: '#FBBF24',
                    borderRadius: '9999px',
                  }}
              />
            </div>

            <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '14px' }}>
              {avgDrink.toFixed(1)}
              <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>/5</span>
            </div>

            <div style={{ fontSize: '12px', color: '#FCD34D', marginTop: '2px' }}>
              {getDrinkLabel(avgDrink)}
            </div>
          </div>

          <div
              style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '14px',
                padding: '12px',
                backdropFilter: 'blur(8px)',
              }}
          >
            <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px',
                }}
            >
              <ChefHat size={16} color="#86EFAC" />
              <span
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                  }}
              >
              Apetit
            </span>
            </div>

            <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  marginBottom: '4px',
                }}
            >
              <div
                  style={{
                    height: '100%',
                    width: `${(avgFood / 5) * 100}%`,
                    background: '#4ADE80',
                    borderRadius: '9999px',
                  }}
              />
            </div>

            <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '14px' }}>
              {avgFood.toFixed(1)}
              <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>/5</span>
            </div>

            <div style={{ fontSize: '12px', color: '#86EFAC', marginTop: '2px' }}>
              {getFoodLabel(avgFood)}
            </div>
          </div>
        </div>

        <div
            style={{
              margin: '0 20px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
        />

        <div style={{ padding: '16px 20px' }}>
          <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}
          >
            <Zap size={16} color="#FCD34D" />
            <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.9)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
            >
            Listă generată automat
          </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <PredictRow
                emoji="🍺"
                label="Bere"
                sublabel={`(~${alcohol.beersPerPerson.toFixed(1)} / persoană)`}
                value={`${alcohol.beers} cutii`}
            />

            {alcohol.wine > 0 && (
                <PredictRow emoji="🍷" label="Vin" value={`${alcohol.wine} sticle`} />
            )}

            <PredictRow
                emoji="🥩"
                label="Carne grătar"
                sublabel={`(${food.meatGrams}g / persoană)`}
                value={`${food.meatKg} kg`}
            />

            <PredictRow
                emoji="🥗"
                label="Salate & gustări"
                value={`${food.saladG}g`}
            />

            <PredictRow
                emoji="🌽"
                label="Porumb la grătar"
                value={`${food.corn} buc`}
            />
          </div>
        </div>

        <div style={{ padding: '0 20px 16px 20px' }}>
          <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '14px',
                padding: '12px',
              }}
          >
            <Users
                size={14}
                color="rgba(255,255,255,0.4)"
                style={{ flexShrink: 0, marginTop: '2px' }}
            />
            <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.4)',
                  lineHeight: 1.5,
                }}
            >
              Calculat din mediile drinkLevel și foodAppetite ale membrilor.
              Ajustează după preferințe.
            </p>
          </div>
        </div>
      </div>
  );
}

function PredictRow({
                      emoji,
                      label,
                      sublabel,
                      value,
                    }: {
  emoji: string;
  label: string;
  sublabel?: string;
  value: string;
}) {
  return (
      <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '14px',
            padding: '10px 12px',
          }}
      >
        <span style={{ fontSize: '20px' }}>{emoji}</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 500 }}>{label}</span>
          {sublabel && (
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginLeft: '8px' }}>
            {sublabel}
          </span>
          )}
        </div>
        <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '16px' }}>{value}</span>
      </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main EventHub Component
// ─────────────────────────────────────────────────────────────
export default function EventHub() {
  const navigate = useNavigate();
  const { currentGroup, currentMember, isHydrated } = useGroup();

  React.useEffect(() => {
    if (isHydrated && (!currentGroup || !currentMember)) {
      navigate('/home');
    }
  }, [currentGroup, currentMember, isHydrated, navigate]);

  if (!isHydrated) {
    return null;
  }

  if (!currentGroup || !currentMember) {
    return null;
  }

  const totalCost = currentGroup.products.reduce((sum, p) => {
    const qty = p.quantity || 1;
    return sum + p.price * qty;
  }, 0);

  const claimedProducts = currentGroup.products.filter((p) => p.claimedBy);

  const unclaimedCost = currentGroup.products
      .filter((p) => !p.claimedBy)
      .reduce((sum, p) => {
        const qty = p.quantity || 1;
        return sum + p.price * qty;
      }, 0);

  const memberCosts = currentGroup.members.map((member) => {
    const claimedByMember = currentGroup.products
        .filter((p) => p.claimedBy === member.id)
        .reduce((sum, p) => {
          const qty = p.quantity || 1;
          return sum + p.price * qty;
        }, 0);

    const sharedCost = unclaimedCost / Math.max(currentGroup.members.length, 1);

    return {
      member,
      claimedAmount: claimedByMember,
      sharedAmount: sharedCost,
      total: claimedByMember + sharedCost,
    };
  });

  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${currentGroup.location.lat},${currentGroup.location.lng}&zoom=14`;

  return (
      <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#F3F4F6',
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
                maxWidth: '1024px',
                margin: '0 auto',
                padding: '16px',
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
                Event Hub
              </h1>
            </div>
          </div>
        </div>

        <div
            style={{
              maxWidth: '1024px',
              margin: '0 auto',
              padding: '20px 16px 0 16px',
            }}
        >
          <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
                alignItems: 'start',
              }}
          >
            {/* LEFT COLUMN */}
            <div
                style={{
                  borderRadius: '24px',
                  backgroundColor: 'rgba(239,246,255,0.8)',
                  border: '1px solid #DBEAFE',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
            >
              <SectionHeader
                  iconBg="#3B82F6"
                  icon={<MapPin size={16} color="#FFFFFF" />}
                  title="Logistică"
                  titleColor="#1E3A8A"
                  badge="Locație & Acces"
                  badgeColor="#60A5FA"
                  borderColor="#DBEAFE"
              />

              <Panel>
                <div style={{ width: '100%', height: '176px', backgroundColor: '#E5E7EB' }}>
                  <iframe
                      width="100%"
                      height="100%"
                      frameBorder={0}
                      style={{ border: 0 }}
                      src={mapUrl}
                      allowFullScreen
                      title="Event location map"
                  />
                </div>

                <div style={{ padding: '16px' }}>
                  <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                      }}
                  >
                    <MapPin
                        size={20}
                        color="#3B82F6"
                        style={{ flexShrink: 0, marginTop: '2px' }}
                    />

                    <div>
                      <div
                          style={{
                            fontWeight: 600,
                            color: '#111827',
                            marginBottom: '2px',
                            fontSize: '14px',
                          }}
                      >
                        Locație eveniment
                      </div>
                      <div
                          style={{
                            fontSize: '14px',
                            color: '#6B7280',
                          }}
                      >
                        {currentGroup.location.address}
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel padding="16px">
                <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                >
                  <IconBox bg="#DBEAFE">
                    <Key size={20} color="#2563EB" />
                  </IconBox>

                  <div style={{ flex: 1 }}>
                    <div
                        style={{
                          fontWeight: 600,
                          color: '#111827',
                          marginBottom: '8px',
                          fontSize: '14px',
                        }}
                    >
                      Informații acces
                    </div>
                    <p
                        style={{
                          margin: 0,
                          fontSize: '14px',
                          color: '#6B7280',
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.6,
                        }}
                    >
                      {currentGroup.cabinDetails}
                    </p>
                  </div>
                </div>
              </Panel>

              <Panel padding="16px">
                <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    }}
                >
                  <IconBox bg="#DBEAFE">
                    <Users size={20} color="#2563EB" />
                  </IconBox>

                  <div>
                    <div
                        style={{
                          fontWeight: 600,
                          color: '#111827',
                          fontSize: '14px',
                        }}
                    >
                      Membri grup
                    </div>
                    <div
                        style={{
                          fontSize: '12px',
                          color: '#9CA3AF',
                        }}
                    >
                      {currentGroup.members.length} participanți
                    </div>
                  </div>
                </div>

                {currentGroup.members.length === 0 ? (
                    <p
                        style={{
                          margin: 0,
                          fontSize: '14px',
                          color: '#9CA3AF',
                          textAlign: 'center',
                          padding: '8px 0',
                        }}
                    >
                      Niciun membru încă
                    </p>
                ) : (
                    <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                    >
                      {currentGroup.members.map((m) => (
                          <div
                              key={m.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 10px',
                                borderRadius: '9999px',
                                fontSize: '12px',
                                fontWeight: 500,
                                backgroundColor: m.id === currentMember.id ? '#3B82F6' : '#EFF6FF',
                                color: m.id === currentMember.id ? '#FFFFFF' : '#1D4ED8',
                                border: m.id === currentMember.id ? 'none' : '1px solid #BFDBFE',
                              }}
                          >
                            {m.id === currentMember.id && <span>👤</span>}
                            {m.name}
                          </div>
                      ))}
                    </div>
                )}
              </Panel>
            </div>

            {/* RIGHT COLUMN */}
            <div
                style={{
                  borderRadius: '24px',
                  backgroundColor: 'rgba(255,247,237,0.8)',
                  border: '1px solid #FED7AA',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
            >
              <SectionHeader
                  iconBg="#F97316"
                  icon={<DollarSign size={16} color="#FFFFFF" />}
                  title="Finanțe"
                  titleColor="#9A3412"
                  badge="Split & Predicție"
                  badgeColor="#FB923C"
                  borderColor="#FED7AA"
              />

              <div
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'linear-gradient(to right, #FFF7ED, #FFFBEB)',
                    border: '1px solid #FED7AA',
                  }}
              >
                <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                    }}
                >
                  <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                  >
                    <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '14px',
                          backgroundColor: '#F97316',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                    >
                      <DollarSign size={24} color="#FFFFFF" />
                    </div>

                    <div>
                      <div
                          style={{
                            fontSize: '14px',
                            color: '#9A3412',
                          }}
                      >
                        Cost Total
                      </div>
                      <div
                          style={{
                            fontSize: '30px',
                            fontWeight: 700,
                            color: '#7C2D12',
                          }}
                      >
                        ${totalCost.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: '12px',
                      fontSize: '14px',
                    }}
                >
                  <MiniFinanceCard
                      title="Revendicat"
                      value={`$${(totalCost - unclaimedCost).toFixed(2)}`}
                      sub={`${claimedProducts.length} produse`}
                  />
                  <MiniFinanceCard
                      title="Shared"
                      value={`$${unclaimedCost.toFixed(2)}`}
                      sub={`${currentGroup.products.filter((p) => !p.claimedBy).length} produse`}
                  />
                </div>
              </div>

              {currentGroup.members.length === 0 ? (
                  <Panel padding="32px">
                    <p
                        style={{
                          margin: 0,
                          color: '#6B7280',
                          fontSize: '14px',
                          textAlign: 'center',
                        }}
                    >
                      Niciun membru. Invită prieteni pentru a vedea split-ul!
                    </p>
                  </Panel>
              ) : (
                  <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                  >
                    {memberCosts.map(({ member, claimedAmount, sharedAmount, total }) => {
                      const isCurrentMember = member.id === currentMember.id;

                      return (
                          <div
                              key={member.id}
                              style={{
                                borderRadius: '16px',
                                padding: '16px',
                                border: isCurrentMember ? '2px solid #FB923C' : '1px solid #F3F4F6',
                                backgroundColor: '#FFFFFF',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              }}
                          >
                            <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  marginBottom: '8px',
                                  gap: '12px',
                                }}
                            >
                              <div>
                                <div
                                    style={{
                                      fontWeight: 600,
                                      color: '#111827',
                                      fontSize: '14px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      flexWrap: 'wrap',
                                    }}
                                >
                                  {member.name}
                                  {isCurrentMember && (
                                      <span
                                          style={{
                                            fontSize: '12px',
                                            backgroundColor: '#F97316',
                                            color: '#FFFFFF',
                                            padding: '2px 8px',
                                            borderRadius: '9999px',
                                          }}
                                      >
                                Tu
                              </span>
                                  )}
                                </div>

                                <div
                                    style={{
                                      fontSize: '12px',
                                      color: '#9CA3AF',
                                      marginTop: '2px',
                                    }}
                                >
                                  {member.ageRange} · 🍺{member.drinkLevel}/5 · 🍖{member.foodAppetite}/5
                                </div>
                              </div>

                              <div style={{ textAlign: 'right' }}>
                                <div
                                    style={{
                                      fontSize: '24px',
                                      fontWeight: 700,
                                      color: '#111827',
                                    }}
                                >
                                  ${total.toFixed(2)}
                                </div>
                              </div>
                            </div>

                            <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                  gap: '8px',
                                }}
                            >
                              <SmallPill
                                  bg="#F0FDF4"
                                  icon={<TrendingUp size={14} color="#16A34A" />}
                                  text={`Claimed: $${claimedAmount.toFixed(2)}`}
                              />
                              <SmallPill
                                  bg="#FFF7ED"
                                  icon={<TrendingDown size={14} color="#EA580C" />}
                                  text={`Shared: $${sharedAmount.toFixed(2)}`}
                              />
                            </div>
                          </div>
                      );
                    })}
                  </div>
              )}

              <SmartAppetitePredictor members={currentGroup.members} />
            </div>
          </div>
        </div>
      </div>
  );
}

function SectionHeader({
                         iconBg,
                         icon,
                         title,
                         titleColor,
                         badge,
                         badgeColor,
                         borderColor,
                       }: {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  titleColor: string;
  badge: string;
  badgeColor: string;
  borderColor: string;
}) {
  return (
      <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingBottom: '4px',
            borderBottom: `1px solid ${borderColor}`,
          }}
      >
        <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '10px',
              backgroundColor: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
        >
          {icon}
        </div>

        <h2
            style={{
              margin: 0,
              fontWeight: 700,
              color: titleColor,
              letterSpacing: '-0.01em',
            }}
        >
          {title}
        </h2>

        <span
            style={{
              marginLeft: 'auto',
              fontSize: '12px',
              color: badgeColor,
              fontWeight: 500,
            }}
        >
        {badge}
      </span>
      </div>
  );
}

function Panel({
                 children,
                 padding,
               }: {
  children: React.ReactNode;
  padding?: string;
}) {
  return (
      <div
          style={{
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            border: '1px solid #E5E7EB',
            padding,
          }}
      >
        {children}
      </div>
  );
}

function IconBox({
                   children,
                   bg,
                 }: {
  children: React.ReactNode;
  bg: string;
}) {
  return (
      <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '14px',
            backgroundColor: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
      >
        {children}
      </div>
  );
}

function MiniFinanceCard({
                           title,
                           value,
                           sub,
                         }: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
      <div
          style={{
            background: 'rgba(255,255,255,0.6)',
            borderRadius: '14px',
            padding: '12px',
            border: '1px solid #FED7AA',
          }}
      >
        <div
            style={{
              color: '#9A3412',
              fontWeight: 500,
              fontSize: '12px',
              marginBottom: '2px',
            }}
        >
          {title}
        </div>
        <div
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#7C2D12',
            }}
        >
          {value}
        </div>
        <div
            style={{
              fontSize: '12px',
              color: '#F97316',
              marginTop: '4px',
            }}
        >
          {sub}
        </div>
      </div>
  );
}

function SmallPill({
                     bg,
                     icon,
                     text,
                   }: {
  bg: string;
  icon: React.ReactNode;
  text: string;
}) {
  return (
      <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: bg,
            borderRadius: '12px',
            padding: '8px 10px',
          }}
      >
        {icon}
        <span
            style={{
              fontSize: '12px',
              color: '#4B5563',
            }}
        >
        <strong>{text.split(':')[0]}:</strong> {text.split(': ').slice(1).join(': ')}
      </span>
      </div>
  );
}
