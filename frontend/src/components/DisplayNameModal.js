import React, { useState } from 'react';

function DisplayNameModal({ onSave, onClose, currentName }) {
  const [name, setName] = useState(currentName || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a display name');
      return;
    }
    
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    
    if (name.trim().length > 30) {
      setError('Name must be 30 characters or less');
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      await onSave(name.trim());
    } catch (err) {
      setError('Failed to save name. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content display-name-modal">
        <h2>{currentName ? 'Change Display Name' : 'Choose Your Display Name'}</h2>
        <p className="modal-description">
          This is how other members will see you in book club discussions.
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your display name"
            className="modal-input"
            autoFocus
            maxLength={30}
          />
          
          {error && <p className="modal-error">{error}</p>}
          
          <div className="modal-buttons">
            {currentName && (
              <button 
                type="button" 
                onClick={onClose} 
                className="modal-button-secondary"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              className="modal-button-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DisplayNameModal;