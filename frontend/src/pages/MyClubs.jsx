import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

function MyClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchMyClubs();
    }
  }, [user]);

  const fetchMyClubs = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/clubs?userId=${user.id}`);

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
              fontSize: '1rem',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
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