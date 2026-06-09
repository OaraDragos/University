import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroup } from '../context/GroupContext';
import { ArrowLeft, User, Wine, Utensils } from 'lucide-react';

export default function Members() {
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
                maxWidth: '448px',
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

              <div>
                <h1
                    style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#0F172A',
                    }}
                >
                  Members
                </h1>
                <p
                    style={{
                      margin: 0,
                      marginTop: '2px',
                      fontSize: '14px',
                      color: '#6B7280',
                    }}
                >
                  {currentGroup.members.length} people
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
            style={{
              maxWidth: '448px',
              margin: '0 auto',
              padding: '24px 16px 0 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
        >
          {currentGroup.members.length === 0 ? (
              <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '24px',
                    padding: '48px',
                    textAlign: 'center',
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
                  <User size={32} color="#9CA3AF" />
                </div>

                <h3
                    style={{
                      margin: 0,
                      marginBottom: '8px',
                      fontWeight: 600,
                      color: '#111827',
                    }}
                >
                  No members yet
                </h3>

                <p
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#6B7280',
                    }}
                >
                  Share the group code to invite people
                </p>
              </div>
          ) : (
              currentGroup.members.map((member) => {
                const isCurrentMember = member.id === currentMember.id;

                const avatarColor =
                    member.gender === 'male'
                        ? '#3B82F6'
                        : member.gender === 'female'
                            ? '#EC4899'
                            : '#A855F7';

                return (
                    <div
                        key={member.id}
                        style={{
                          backgroundColor: isCurrentMember ? '#EFF6FF' : '#FFFFFF',
                          border: isCurrentMember ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                          borderRadius: '24px',
                          padding: '20px',
                        }}
                    >
                      <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                          }}
                      >
                        <div
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '9999px',
                              backgroundColor: avatarColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF',
                              fontSize: '20px',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px',
                                flexWrap: 'wrap',
                              }}
                          >
                            <h3
                                style={{
                                  margin: 0,
                                  fontSize: '18px',
                                  fontWeight: 700,
                                  color: '#111827',
                                }}
                            >
                              {member.name}
                            </h3>

                            {isCurrentMember && (
                                <span
                                    style={{
                                      fontSize: '12px',
                                      backgroundColor: '#3B82F6',
                                      color: '#FFFFFF',
                                      padding: '4px 8px',
                                      borderRadius: '9999px',
                                      fontWeight: 600,
                                    }}
                                >
                          You
                        </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '16px',
                                  fontSize: '14px',
                                  color: '#6B7280',
                                }}
                            >
                              <span style={{ textTransform: 'capitalize' }}>{member.gender}</span>
                              <span>·</span>
                              <span>{member.ageRange} years</span>
                            </div>

                            <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  flexWrap: 'wrap',
                                }}
                            >
                              <Wine size={16} color="#9333EA" />
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <div
                                        key={level}
                                        style={{
                                          width: '8px',
                                          height: '16px',
                                          borderRadius: '2px',
                                          backgroundColor:
                                              level <= member.drinkLevel ? '#A855F7' : '#E5E7EB',
                                        }}
                                    />
                                ))}
                              </div>
                              <span
                                  style={{
                                    fontSize: '14px',
                                    color: '#6B7280',
                                    marginLeft: '4px',
                                  }}
                              >
                          {member.drinkLevel}/5
                        </span>
                            </div>

                            <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  flexWrap: 'wrap',
                                }}
                            >
                              <Utensils size={16} color="#16A34A" />
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <div
                                        key={level}
                                        style={{
                                          width: '8px',
                                          height: '16px',
                                          borderRadius: '2px',
                                          backgroundColor:
                                              level <= member.foodAppetite ? '#22C55E' : '#E5E7EB',
                                        }}
                                    />
                                ))}
                              </div>
                              <span
                                  style={{
                                    fontSize: '14px',
                                    color: '#6B7280',
                                    marginLeft: '4px',
                                  }}
                              >
                          {member.foodAppetite}/5
                        </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                );
              })
          )}
        </div>
      </div>
  );
}
