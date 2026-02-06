import React, { useState } from 'react';
import { API_URL } from '../config';

function JoinClubModal({ userId, onClose, onClubJoined }) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First get the database user ID from Clerk ID
      const userResponse = await fetch(`${API_URL}/api/users/clerk/${userId}`);
      if (!userResponse.ok) {
        throw new Error('User not found');
      }
      const booklubUser = await userResponse.json();

      const response = await fetch(`${API_URL}/api/clubs/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode: inviteCode.trim().toUpperCase(),
          userId: booklubUser.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join club');
      }

      // Success!
      onClubJoined(data.club);
      
    } catch (err) {
      console.error('Error joining club:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ 
          fontFamily: 'Georgia, serif',
          fontSize: '2rem',
          marginBottom: '20px',
          fontWeight: 'normal'
        }}>
          Join a Book Club
        </h2>

        <p style={{ marginBottom: '20px', color: '#666' }}>
          Enter the invite code shared with you to join an existing book club.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              Invite Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g., 8KVVZA"
              maxLength={6}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1.2rem',
                border: '2px solid #000',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: 'monospace'
              }}
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#ffe6e6',
              border: '2px solid #ff0000',
              marginBottom: '20px',
              color: '#cc0000'
            }}>
              {error}
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            justifyContent: 'flex-end' 
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                backgroundColor: '#fff',
                color: '#000',
                border: '2px solid #000',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                backgroundColor: 'transparent',
                color: '#000',
                border: '2px solid #c8aa6e',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontFamily: "'Georgia', serif",
                letterSpacing: '2px',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#c8aa6e';
                  e.currentTarget.style.color = '#000';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#000';
              }}
            >
              {loading ? 'Joining...' : 'Join Club'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JoinClubModal;