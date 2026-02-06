import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

function MyClubs({ booklubUser }) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchMyClubs = async () => {
    try {
      // booklubUser.id is already the database integer ID (passed from App.js)
      const response = await fetch(`${API_URL}/api/clubs?userId=${booklubUser.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch clubs');
      }

      const data = await response.json();
      setClubs(data);
    } catch (err) {
      console.error('Error fetching clubs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (booklubUser) {
      fetchMyClubs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booklubUser]);

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Loading your clubs...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Error loading clubs: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ 
        fontSize: '2.5rem', 
        marginBottom: '40px',
        fontFamily: 'Georgia, serif',
        fontWeight: 'normal'
      }}>
        My Book Clubs
      </h1>

      {clubs.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          border: '2px solid #000',
          marginTop: '40px'
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
            You haven't joined any book clubs yet.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              backgroundColor: 'transparent',
              color: '#000',
              border: '2px solid #c8aa6e',
              cursor: 'pointer',
              fontFamily: "'Georgia', serif",
              letterSpacing: '2px',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c8aa6e';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#000';
            }}
          >
            Browse Books
          </button>
        </div>
      ) : (
        <div className="clubs-grid">
          {clubs.map(club => (
            <div 
              key={club.id}
              className="club-card"
              onClick={() => navigate(`/club/${club.id}`)}
              style={{
                border: '2px solid #000',
                padding: '20px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <h2 style={{ 
                fontSize: '1.5rem', 
                marginBottom: '10px',
                fontFamily: 'Georgia, serif'
              }}>
                {club.name}
              </h2>
              
              <p style={{ 
                fontSize: '1.1rem', 
                marginBottom: '5px',
                fontStyle: 'italic'
              }}>
                {club.book_title}
              </p>
              
              <p style={{ 
                fontSize: '0.9rem', 
                color: '#666',
                marginBottom: '15px'
              }}>
                by {club.book_author}
              </p>

              <div style={{
                fontSize: '0.85rem',
                color: '#666',
                borderTop: '1px solid #ccc',
                paddingTop: '10px',
                marginTop: '15px'
              }}>
                <p>Invite Code: <strong>{club.invite_code}</strong></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyClubs;