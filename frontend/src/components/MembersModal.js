import React, { useState, useEffect } from 'react';

function MembersModal({ clubId, clubName, onClose }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        <button className="modal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default MembersModal;