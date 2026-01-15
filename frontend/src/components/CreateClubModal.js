import React, { useState } from 'react';
import './CreateClubModal.css';

function CreateClubModal({ book, onClose, onClubCreated, userId }) {
  const [clubName, setClubName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!clubName.trim()) {
      setError('Please enter a club name');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: clubName,
          bookId: book.id,
          userId: userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create club');
      }

      const data = await response.json();
      onClubCreated(data.club);
      
    } catch (err) {
      console.error('Error creating club:', err);
      setError('Failed to create club. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>Create Book Club</h2>
        
        <div className="modal-book-info">
          <h3>{book.title}</h3>
          <p>by {book.author}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="clubName">Club Name</label>
            <input
              id="clubName"
              type="text"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="e.g., Monday Night Readers"
              maxLength={100}
              autoFocus
              disabled={isCreating}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-buttons">
            <button 
              type="button" 
              onClick={onClose} 
              className="button-secondary"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="button-primary"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Club'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateClubModal;