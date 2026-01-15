import React, { useState } from 'react';
import './ClubCreatedModal.css';

function ClubCreatedModal({ club, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(club.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="success-icon">✓</div>
        
        <h2>Club Created!</h2>
        
        <p className="success-message">
          Your book club "{club.name}" has been created.
        </p>

        <div className="invite-code-section">
          <label>Share this code with a friend:</label>
          <div className="invite-code-display">
            <span className="invite-code">{club.invite_code}</span>
            <button 
              className="copy-button"
              onClick={handleCopyCode}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="invite-hint">
            They can use this code to join your club
          </p>
        </div>

        <button 
          className="button-primary full-width"
          onClick={onClose}
        >
          Start Reading & Discussing
        </button>
      </div>
    </div>
  );
}

export default ClubCreatedModal;