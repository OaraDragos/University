import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroup } from '../context/GroupContext';
import { Users, ShoppingCart, MapPin, Copy, Check, MessageCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentGroup, currentMember, isHydrated } = useGroup();
  const { user, hasPermission } = useAuth();
  const [copied, setCopied] = useState(false);
  const canUseChat = hasPermission('VIEW_CHAT');

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

  const handleCopyCode = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
          .writeText(currentGroup.shareCode)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => {
            fallbackCopy(currentGroup.shareCode);
          });
    } else {
      fallbackCopy(currentGroup.shareCode);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert(`Copy this code: ${text}`);
    } finally {
      document.body.removeChild(textArea);
    }
  };

  return (
      <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#F8FAFC',
            paddingBottom: '80px',
            fontFamily: 'Inter, Arial, sans-serif',
          }}
      >
        <div
            style={{
              background: 'linear-gradient(to right, #3B82F6, #7C3AED)',
              color: '#FFFFFF',
              padding: '24px 24px 32px 24px',
            }}
        >
          <div
              style={{
                maxWidth: '448px',
                margin: '0 auto',
              }}
          >
            <button
                onClick={() => navigate('/home')}
                style={{
                  marginBottom: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  backgroundColor: 'rgba(255, 255, 255, 0.16)',
                  color: '#FFFFFF',
                  height: '36px',
                  padding: '0 12px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
            >
              <ArrowLeft size={16} />
              Back to groups
            </button>

            <h1
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '24px',
                  fontWeight: 700,
                }}
            >
              {currentGroup.name}
            </h1>

            <p
                style={{
                  margin: 0,
                  color: '#DBEAFE',
                  fontSize: '16px',
                }}
            >
              Welcome, {currentMember.name}!
            </p>

            {user && (
                <div
                    style={{
                      marginTop: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(255, 255, 255, 0.16)',
                      padding: '6px 10px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                >
                  <ShieldCheck size={14} />
                  {user.username} - {user.roles.join(', ')}
                </div>
            )}
          </div>
        </div>

        <div
            style={{
              maxWidth: '448px',
              margin: '0 auto',
              padding: '0 16px',
              marginTop: '-16px',
            }}
        >
          <div
              style={{
                padding: '16px',
                marginBottom: '24px',
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
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
              <div>
                <div
                    style={{
                      fontSize: '14px',
                      color: '#6B7280',
                      marginBottom: '4px',
                    }}
                >
                  Share Code
                </div>

                <div
                    style={{
                      fontSize: '24px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: '#111827',
                    }}
                >
                  {currentGroup.shareCode}
                </div>
              </div>

              <button
                  onClick={handleCopyCode}
                  style={{
                    height: '36px',
                    padding: '0 12px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    color: '#111827',
                    fontSize: '14px',
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
              >
                {copied ? (
                    <>
                      <Check size={16} />
                      Copied
                    </>
                ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                )}
              </button>
            </div>

            <p
                style={{
                  margin: '12px 0 0 0',
                  fontSize: '12px',
                  color: '#6B7280',
                }}
            >
              Share this code with friends to invite them
            </p>
          </div>

          <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '16px',
                marginBottom: '24px',
              }}
          >
            <StatCard
                bg="#F3E8FF"
                iconBg="#E9D5FF"
                icon={<Users size={20} color="#9333EA" />}
                value={currentGroup.members.length}
                label="Members"
            />

            <StatCard
                bg="#DCFCE7"
                iconBg="#BBF7D0"
                icon={<ShoppingCart size={20} color="#16A34A" />}
                value={currentGroup.products.length}
                label="Items"
            />
          </div>

          <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
          >
            <h2
                style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
            >
              Quick Actions
            </h2>

            <ActionCard
                iconBg="#22C55E"
                icon={<ShoppingCart size={28} color="#FFFFFF" />}
                title="Smart Inventory"
                description="Manage shopping list & prices"
                onClick={() => navigate('/inventory')}
            />

            <ActionCard
                iconBg="#F97316"
                icon={<MapPin size={28} color="#FFFFFF" />}
                title="Event Hub"
                description="Location & bill splitting"
                onClick={() => navigate('/event-hub')}
            />

            <ActionCard
                iconBg="#A855F7"
                icon={<Users size={28} color="#FFFFFF" />}
                title="View Members"
                description="See who's coming"
                onClick={() => navigate('/members')}
            />

            {canUseChat && (
                <ActionCard
                    iconBg="#2563EB"
                    icon={<MessageCircle size={28} color="#FFFFFF" />}
                    title="Live Chat"
                    description="Private messages for this group"
                    onClick={() => navigate('/chat')}
                />
            )}
          </div>
        </div>
      </div>
  );
}

function StatCard({
                    bg,
                    iconBg,
                    icon,
                    value,
                    label,
                  }: {
  bg: string;
  iconBg: string;
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
      <div
          style={{
            padding: '16px',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
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

          <div>
            <div
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#111827',
                  lineHeight: 1,
                }}
            >
              {value}
            </div>
            <div
                style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  marginTop: '4px',
                }}
            >
              {label}
            </div>
          </div>
        </div>
      </div>
  );
}

function ActionCard({
                      iconBg,
                      icon,
                      title,
                      description,
                      onClick,
                    }: {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
      <div
          onClick={onClick}
          style={{
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
      >
        <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '18px',
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
                margin: '0 0 4px 0',
                fontWeight: 600,
                color: '#111827',
                fontSize: '18px',
              }}
          >
            {title}
          </h3>

          <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: '#6B7280',
              }}
          >
            {description}
          </p>
        </div>
      </div>
  );
}
