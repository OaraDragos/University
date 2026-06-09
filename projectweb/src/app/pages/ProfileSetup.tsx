import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGroup } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';
import { Member } from '../types';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { currentGroup, setCurrentMember, isHydrated } = useGroup();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [ageRange, setAgeRange] = useState<'18-24' | '24-30' | '30-40' | '40-50' | '50+'>('24-30');
  const [drinkLevel, setDrinkLevel] = useState(3);
  const [foodAppetite, setFoodAppetite] = useState(3);

  React.useEffect(() => {
    if (isHydrated && !currentGroup) {
      navigate('/home');
    }
  }, [currentGroup, isHydrated, navigate]);

  if (!isHydrated) {
    return null;
  }

  const handleComplete = () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    const newMember: Member = {
      id: Date.now().toString(),
      authUserId: user?.id,
      name: name.trim(),
      gender,
      ageRange,
      drinkLevel,
      foodAppetite,
    };

    setCurrentMember(newMember);
    navigate('/dashboard');
  };

  if (!currentGroup) {
    return null;
  }

  return (
      <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#F8FAFC',
            padding: '16px',
            paddingBottom: '96px',
            fontFamily: 'Inter, Arial, sans-serif',
          }}
      >
        <div
            style={{
              maxWidth: '448px',
              margin: '0 auto',
              paddingTop: '24px',
            }}
        >
          <div style={{ marginBottom: '32px' }}>
            <button
                onClick={() => navigate('/home')}
                style={{
                  marginBottom: '16px',
                  marginLeft: '-8px',
                  border: 'none',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  color: '#0F172A',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '8px',
                  borderRadius: '10px',
                }}
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <h1
                style={{
                  margin: 0,
                  fontSize: '30px',
                  fontWeight: 700,
                  color: '#111827',
                }}
            >
              Complete Profile
            </h1>

            <p
                style={{
                  margin: '8px 0 0 0',
                  color: '#6B7280',
                  fontSize: '16px',
                }}
            >
              Help us plan better for the group
            </p>
          </div>

          <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
          >
            <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '24px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label
                    htmlFor="name"
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#111827',
                    }}
                >
                  Your Name *
                </label>

                <input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      height: '48px',
                      width: '100%',
                      borderRadius: '14px',
                      border: '1px solid #D1D5DB',
                      padding: '0 14px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#111827',
                      backgroundColor: '#FFFFFF',
                    }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#111827',
                    }}
                >
                  Gender
                </div>

                <RadioOption
                    label="Male"
                    checked={gender === 'male'}
                    onClick={() => setGender('male')}
                />
                <RadioOption
                    label="Female"
                    checked={gender === 'female'}
                    onClick={() => setGender('female')}
                />
                <RadioOption
                    label="Other"
                    checked={gender === 'other'}
                    onClick={() => setGender('other')}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#111827',
                    }}
                >
                  Age Range
                </div>

                <RadioOption
                    label="18-24"
                    checked={ageRange === '18-24'}
                    onClick={() => setAgeRange('18-24')}
                />
                <RadioOption
                    label="24-30"
                    checked={ageRange === '24-30'}
                    onClick={() => setAgeRange('24-30')}
                />
                <RadioOption
                    label="30-40"
                    checked={ageRange === '30-40'}
                    onClick={() => setAgeRange('30-40')}
                />
                <RadioOption
                    label="40-50"
                    checked={ageRange === '40-50'}
                    onClick={() => setAgeRange('40-50')}
                />
                <RadioOption
                    label="50+"
                    checked={ageRange === '50+'}
                    onClick={() => setAgeRange('50+')}
                />
              </div>
            </div>

            <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '24px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                >
                  <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#111827',
                      }}
                  >
                    Drink Level
                  </div>

                  <span
                      style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        color: '#3B82F6',
                        lineHeight: 1,
                      }}
                  >
                  {drinkLevel}
                </span>
                </div>

                <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={drinkLevel}
                    onChange={(e) => setDrinkLevel(Number(e.target.value))}
                    style={{
                      width: '100%',
                      cursor: 'pointer',
                    }}
                />

                <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#6B7280',
                    }}
                >
                  <span>None</span>
                  <span>Social</span>
                  <span>Party</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                >
                  <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#111827',
                      }}
                  >
                    Food Appetite
                  </div>

                  <span
                      style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        color: '#22C55E',
                        lineHeight: 1,
                      }}
                  >
                  {foodAppetite}
                </span>
                </div>

                <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={foodAppetite}
                    onChange={(e) => setFoodAppetite(Number(e.target.value))}
                    style={{
                      width: '100%',
                      cursor: 'pointer',
                    }}
                />

                <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#6B7280',
                    }}
                >
                  <span>Light</span>
                  <span>Normal</span>
                  <span>Heavy</span>
                </div>
              </div>
            </div>

            <button
                onClick={handleComplete}
                style={{
                  width: '100%',
                  height: '48px',
                  border: 'none',
                  borderRadius: '16px',
                  backgroundColor: '#3B82F6',
                  color: '#FFFFFF',
                  fontSize: '18px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
            >
              Complete & Join Group
            </button>
          </div>
        </div>
      </div>
  );
}

function RadioOption({
                       label,
                       checked,
                       onClick,
                     }: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
      <label
          onClick={onClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
      >
        <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '9999px',
              border: checked ? '5px solid #3B82F6' : '2px solid #D1D5DB',
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF',
              flexShrink: 0,
            }}
        />
        <span
            style={{
              fontSize: '14px',
              fontWeight: 400,
              color: '#111827',
            }}
        >
        {label}
      </span>
      </label>
  );
}
