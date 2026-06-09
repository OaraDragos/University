import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGroup } from '../context/GroupContext';
import { createGroup as createGroupApi } from '../services/tripBuddyApi';
import { ApiError } from '../services/networkClient';

export default function CreateGroup() {
  const navigate = useNavigate();
  const { setCurrentGroup } = useGroup();

  const [groupName, setGroupName] = useState('');
  const [groupPassword, setGroupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [cabinDetails, setCabinDetails] = useState('');

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    const password = groupPassword.trim();
    if (!password) {
      alert('Please set a group password');
      return;
    }

    if (password.length < 4) {
      alert('Password must be at least 4 characters');
      return;
    }

    if (password !== confirmPassword.trim()) {
      alert('Passwords do not match');
      return;
    }

    try {
      const createdGroup = await createGroupApi({
        name: groupName.trim(),
        joinPassword: password,
        location: {
          lat: 40.7128,
          lng: -74.006,
          address: location.trim() || 'To be determined',
        },
        cabinDetails: cabinDetails.trim() || 'Details coming soon',
      });

      setCurrentGroup(createdGroup);
      navigate('/profile-setup');
    } catch (error) {
      if (error instanceof ApiError && error.offline) {
        alert('Server unreachable. Please reconnect and try again.');
        return;
      }

      alert(error instanceof Error ? error.message : 'Failed to create group');
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
              Create Group
            </h1>

            <p
                style={{
                  margin: '8px 0 0 0',
                  color: '#6B7280',
                  fontSize: '16px',
                }}
            >
              Set up your trip and invite friends
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
                  htmlFor="groupName"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827',
                  }}
              >
                Group Name *
              </label>

              <input
                  id="groupName"
                  placeholder="Summer BBQ 2026"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
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
                Group Password *
              </label>

              <input
                  id="groupPassword"
                  type="password"
                  placeholder="Set a password for joining"
                  value={groupPassword}
                  onChange={(e) => setGroupPassword(e.target.value)}
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

              <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#6B7280',
                  }}
              >
                Members will need both share code and password to join.
              </p>
            </div>

            <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
            >
              <label
                  htmlFor="confirmPassword"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827',
                  }}
              >
                Confirm Password *
              </label>

              <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat the password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

            <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
            >
              <label
                  htmlFor="location"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827',
                  }}
              >
                Location (optional)
              </label>

              <input
                  id="location"
                  placeholder="123 Lake View Dr, Mountain City"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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

              <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#6B7280',
                  }}
              >
                You can add map coordinates later
              </p>
            </div>

            <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
            >
              <label
                  htmlFor="cabinDetails"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827',
                  }}
              >
                Access Details (optional)
              </label>

              <textarea
                  id="cabinDetails"
                  placeholder="Gate code: 1234, Key under mat, Check-in after 3pm..."
                  value={cabinDetails}
                  onChange={(e) => setCabinDetails(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    borderRadius: '14px',
                    border: '1px solid #D1D5DB',
                    padding: '12px 14px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: '#111827',
                    backgroundColor: '#FFFFFF',
                    resize: 'vertical',
                    minHeight: '112px',
                    fontFamily: 'Inter, Arial, sans-serif',
                  }}
              />
            </div>

            <button
                onClick={handleCreateGroup}
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
              Create Group & Continue
            </button>
          </div>

          <div
              style={{
                marginTop: '24px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#6B7280',
              }}
          >
            After creating, you'll get a shareable link for invites
          </div>
        </div>
      </div>
  );
}
