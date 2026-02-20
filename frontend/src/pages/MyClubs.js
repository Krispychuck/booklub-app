import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
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
    return <LoadingSpinner message="Loading your clubs..." fullPage />;
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
    <div className="container page-transition">
      <h1 className="my-clubs-heading">
        My Book Clubs
      </h1>

      {clubs.length === 0 ? (
        <div className="my-clubs-empty">
          <p className="my-clubs-empty-text">
            You haven't joined any book clubs yet.
          </p>
          <button
            onClick={() => navigate('/')}
            className="my-clubs-browse-btn"
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
            >
              <h2 className="club-card-title">
                {club.name}
              </h2>

              <p className="club-card-book">
                {club.book_title}
              </p>

              <p className="club-card-author">
                by {club.book_author}
              </p>

              <div className="club-card-footer">
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