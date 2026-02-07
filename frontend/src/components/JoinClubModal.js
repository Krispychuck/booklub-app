import React, { useState } from 'react';
import './CreateClubModal.css';
import './LoadingSpinner.css';
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
      // userId is already the database integer ID (passed from App.js as booklubUser.id)
      const response = await fetch(`${API_URL}/api/clubs/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode: inviteCode.trim().toUpperCase(),
          userId: userId
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
        <h2>Join a Book Club</h2>

        <p className="modal-book-info" style={{ background: 'transparent', padding: 0 }}>
          Enter the invite code shared with you to join an existing book club.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Invite Code</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g., 8KVVZA"
              maxLength={6}
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: 'monospace',
                fontSize: '1.2rem'
              }}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="modal-buttons">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="button-primary"
            >
              {loading ? <><span className="button-spinner"></span> Joining...</> : 'Join Club'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JoinClubModal;
