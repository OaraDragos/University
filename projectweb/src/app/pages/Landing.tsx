import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  LogOut,
  MapPin,
  Plus,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGroup, UserGroupOption } from '../context/GroupContext';
import { listGroupsForUser } from '../services/tripBuddyApi';
import { Group } from '../types';

export default function Landing() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getUserGroups, selectGroupWithMember, selectUserGroup } = useGroup();
  const [serverGroups, setServerGroups] = React.useState<Group[]>([]);
  const [serverLookupComplete, setServerLookupComplete] = React.useState(false);
  const [serverLookupFailed, setServerLookupFailed] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;

    let active = true;
    setServerLookupComplete(false);
    setServerLookupFailed(false);
    void (async () => {
      try {
        const response = await listGroupsForUser(user.id);
        if (active) {
          setServerGroups(response.groups);
          setServerLookupComplete(true);
        }
      } catch (_error) {
        if (active) {
          setServerGroups([]);
          setServerLookupFailed(true);
          setServerLookupComplete(true);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  const localOptions = getUserGroups();
  const serverOptions: UserGroupOption[] = user
    ? serverGroups
        .map((group) => {
          const member = group.members.find((item) => item.authUserId === user.id) ?? null;
          if (!member) return null;
          return {
            group,
            member,
            membership: {
              groupId: group.id,
              memberId: member.id,
              memberName: member.name,
              joinedAt: group.createdAt,
            },
          };
        })
        .filter((item): item is UserGroupOption => Boolean(item))
    : [];

  const serverGroupIds = new Set(serverOptions.map((option) => option.group.id));
  const userGroups = [
    ...serverOptions,
    ...(serverLookupComplete && !serverLookupFailed
      ? []
      : localOptions.filter((option) => !serverGroupIds.has(option.group.id))),
  ];

  const openGroup = (option: UserGroupOption) => {
    if (option.member) {
      selectGroupWithMember(option.group, option.member);
      navigate('/dashboard');
      return;
    }

    const selected = selectUserGroup(option.group.id);
    if (selected) {
      navigate('/profile-setup');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        padding: '16px',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          paddingTop: '24px',
          paddingBottom: '32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            padding: '12px',
            borderRadius: '16px',
            border: '1px solid #DCE3ED',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={17} color="#15803D" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#0F172A',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.username}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                {user?.roles.join(', ')}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            style={topButtonStyle}
            aria-label="Logout"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              margin: 0,
              marginBottom: '8px',
              fontSize: '30px',
              lineHeight: '1.2',
              fontWeight: 700,
              color: '#0F172A',
            }}
          >
            Choose your group
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: '16px',
              lineHeight: '24px',
              color: '#5B6475',
            }}
          >
            Continue with a group where you are already added, create a new one, or join another group.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <ActionButton
            icon={<Plus size={18} />}
            title="Create group"
            description="Start a new trip group"
            primary
            onClick={() => {
              navigate('/create-group');
            }}
          />
          <ActionButton
            icon={<UserPlus size={18} />}
            title="Join group"
            description="Use a share code and password"
            onClick={() => navigate('/join-group')}
          />
        </div>

        <section>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#0F172A', fontWeight: 700 }}>
            Your groups
          </h2>

          {userGroups.length === 0 ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '18px',
                padding: '28px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                }}
              >
                <Users size={24} color="#2563EB" />
              </div>
              <h3 style={{ margin: '0 0 6px 0', color: '#0F172A', fontSize: '17px' }}>
                No groups yet
              </h3>
              <p style={{ margin: 0, color: '#64748B', fontSize: '14px', lineHeight: '22px' }}>
                Create a group or join one, then it will appear here for this logged-in user.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {userGroups.map((option) => (
                <button
                  key={option.group.id}
                  onClick={() => openGroup(option)}
                  style={{
                    width: '100%',
                    border: '1px solid #E5E7EB',
                    borderRadius: '18px',
                    backgroundColor: '#FFFFFF',
                    padding: '16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '14px',
                        backgroundColor: '#DCFCE7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CalendarDays size={20} color="#15803D" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          color: '#0F172A',
                          fontSize: '16px',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {option.group.name}
                      </div>
                      <div
                        style={{
                          marginTop: '4px',
                          color: '#64748B',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span>{option.member?.name ?? option.membership.memberName}</span>
                        <span>-</span>
                        <MapPin size={13} />
                        <span>{option.group.location.address}</span>
                      </div>
                    </div>
                  </div>

                  <span style={{ color: '#2563EB', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>
                    Open
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const topButtonStyle: React.CSSProperties = {
  height: '34px',
  borderRadius: '10px',
  border: '1px solid #CBD5E1',
  backgroundColor: '#FFFFFF',
  color: '#0F172A',
  padding: '0 10px',
  fontSize: '13px',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  flexShrink: 0,
};

function ActionButton({
  icon,
  title,
  description,
  onClick,
  primary = false,
  disabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        borderRadius: '16px',
        backgroundColor: primary ? '#2563EB' : '#FFFFFF',
        border: primary ? '1px solid #2563EB' : '1px solid #DCE3ED',
        padding: '14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        textAlign: 'left',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.62 : 1,
      }}
    >
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '11px',
          backgroundColor: primary ? 'rgba(255,255,255,0.18)' : '#EFF6FF',
          color: primary ? '#FFFFFF' : '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <h3
          style={{
            margin: 0,
            marginBottom: '3px',
            fontSize: '15px',
            fontWeight: 600,
            color: primary ? '#FFFFFF' : '#0F172A',
          }}
        >
          {title}
        </h3>

        <p
          style={{
            margin: 0,
            fontSize: '12px',
            lineHeight: '18px',
            color: primary ? '#DBEAFE' : '#64748B',
          }}
        >
          {description}
        </p>
      </div>
    </button>
  );
}
