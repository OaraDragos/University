import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGroup } from '../context/GroupContext';
import { joinGroup as joinGroupApi } from '../services/tripBuddyApi';
import { ApiError } from '../services/networkClient';

export default function JoinGroup() {
  const navigate = useNavigate();
  const { setCurrentGroup } = useGroup();
  const [shareCode, setShareCode] = useState('');
  const [groupPassword, setGroupPassword] = useState('');

  const handleJoinGroup = async () => {
    const code = shareCode.trim().toUpperCase();

    if (!code) {
      alert('Please enter a share code');
      return;
    }

    if (!groupPassword.trim()) {
      alert('Please enter the group password');
      return;
    }

    try {
      const group = await joinGroupApi({
        shareCode: code,
        joinPassword: groupPassword.trim(),
      });
      setCurrentGroup(group);
      navigate('/profile-setup');
    } catch (error) {
      if (error instanceof ApiError && error.offline) {
        alert('Server unreachable. Please reconnect and try again.');
        return;
      }

      alert(error instanceof Error ? error.message : 'Failed to join group');
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
              Join Group
            </h1>

            <p
                style={{
                  margin: '8px 0 0 0',
                  color: '#6B7280',
                  fontSize: '16px',
                }}
            >
              Enter the code shared by your group organizer
            </p>
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
            <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
            >
              <label
                  htmlFor="shareCode"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827',
                  }}
              >
                Share Code
              </label>

              <input
                  id="shareCode"
                  placeholder="ABC123"
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  style={{
                    height: '48px',
                    width: '100%',
                    borderRadius: '14px',
                    border: '1px solid #D1D5DB',
                    boxSizing: 'border-box',
                    padding: '0 14px',
                    textAlign: 'center',
                    fontSize: '24px',
                    fontFamily: 'monospace',
                    letterSpacing: '0.2em',
                    color: '#111827',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                  }}
              />
            </div>

            <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
            >
              <label
                  htmlFor="groupPassword"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827',
                  }}
              >
                Group Password
              </label>

              <input
                  id="groupPassword"
                  type="password"
                  placeholder="Enter group password"
                  value={groupPassword}
                  onChange={(e) => setGroupPassword(e.target.value)}
                  style={{
                    height: '48px',
                    width: '100%',
                    borderRadius: '14px',
                    border: '1px solid #D1D5DB',
                    boxSizing: 'border-box',
                    padding: '0 14px',
                    fontSize: '16px',
                    color: '#111827',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                  }}
              />
            </div>

            <button
                onClick={handleJoinGroup}
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
              Join Group
            </button>
          </div>

          <div
              style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#EFF6FF',
                borderRadius: '16px',
                border: '1px solid #BFDBFE',
              }}
          >
            <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#1E3A8A',
                  lineHeight: 1.6,
                }}
            >
              <strong>Tip:</strong> The share code is a 6-character code provided by
              the group creator. Ask them to share it with you!
            </p>
          </div>
        </div>
      </div>
  );
}
