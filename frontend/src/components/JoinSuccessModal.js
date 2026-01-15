import React from 'react';
import { useNavigate } from 'react-router-dom';

function JoinSuccessModal({ club, onClose }) {
  const navigate = useNavigate();

  const handleViewClub = () => {
    navigate('/my-clubs');
    onClose();
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
          Welcome to the Club!
        </h2>

        <div style={{ 
          padding: '20px',
          border: '2px solid #000',
          marginBottom: '20px'
        }}>
          <p style={{ 
            fontSize: '1.2rem',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            {club.name}
          </p>
          <p style={{ 
            fontSize: '1rem',
            fontStyle: 'italic',
            marginBottom: '5px'
          }}>
            {club.book_title}
          </p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            by {club.book_author}
          </p>
        </div>

        <p style={{ marginBottom: '20px', color: '#666' }}>
          You've successfully joined this book club. Start discussing with other members!
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'flex-end' 
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              backgroundColor: '#fff',
              color: '#000',
              border: '2px solid #000',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            onClick={handleViewClub}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              backgroundColor: '#000',
              color: '#fff',
              border: '2px solid #000',
              cursor: 'pointer',
            }}
          >
            View My Clubs
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinSuccessModal;