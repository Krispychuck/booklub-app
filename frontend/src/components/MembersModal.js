import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MembersModal({ clubId, clubName, booklubUser, onClose }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null); // 'leave' or 'delete'
  const navigate = useNavigate();
console.log('booklubUser:', booklubUser);
console.log('currentUserClerkId:', booklubUser?.clerk_id);

  const currentUserClerkId = booklubUser?.clerk_id;
  const currentUserRole = members.find(m => m.clerk_id === currentUserClerkId)?.role;
  const isCreator = currentUserRole === 'creator';

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/clubs/${clubId}/members`);
        if (!response.ok) throw new Error('Failed to fetch members');
        const data = await response.json();
        setMembers(data);
      } catch (err) {
        setError('Could not load members');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [clubId]);

  const handleLeaveClub = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/clubs/${clubId}/members/${currentUserClerkId}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        navigate('/my-clubs');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to leave club');
      }
    } catch (err) {
      setError('Failed to leave club');
      console.error(err);
    }
    setShowConfirm(null);
  };

  const handleDeleteClub = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/clubs/${clubId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clerkId: currentUserClerkId })
        }
      );
      
      if (response.ok) {
        navigate('/my-clubs');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete club');
      }
    } catch (err) {
      setError('Failed to delete club');
      console.error(err);
    }
    setShowConfirm(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content members-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Members of {clubName}</h2>
        
        {loading && <p className="loading-text">Loading members...</p>}
        
        {error && <p className="error-text">{error}</p>}
        
        {!loading && !error && members.length === 0 && (
          <p className="empty-text">No members found.</p>
        )}
        
        {!loading && !error && members.length > 0 && (
          <ul className="members-list">
            {members.map((member) => (
              <li key={member.id} className="member-item">
                <span className="member-name">{member.name || 'Unknown'}</span>
                <span className="member-role">{member.role}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="confirm-dialog">
            <p>
              {showConfirm === 'delete' 
                ? 'Are you sure you want to delete this club? All messages will be lost.'
                : 'Are you sure you want to leave this club?'}
            </p>
            <div className="confirm-buttons">
              <button 
                className="confirm-cancel-btn"
                onClick={() => setShowConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className="confirm-action-btn"
                onClick={showConfirm === 'delete' ? handleDeleteClub : handleLeaveClub}
              >
                {showConfirm === 'delete' ? 'Delete' : 'Leave'}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!showConfirm && !loading && (
          <div className="modal-actions">
            <button className="leave-btn" onClick={() => setShowConfirm('leave')}>
              Leave Club
            </button>
            {isCreator && (
              <button className="delete-btn" onClick={() => setShowConfirm('delete')}>
                Delete Club
              </button>
            )}
          </div>
        )}
        
        <button className="modal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default MembersModal;