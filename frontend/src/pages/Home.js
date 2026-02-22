import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/clerk-react';
import CreateClubModal from '../components/CreateClubModal';
import ClubCreatedModal from '../components/ClubCreatedModal';
import WelcomeBanner from '../components/WelcomeBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import { API_URL } from '../config';

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdClub, setCreatedClub] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/books`);
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      const data = await response.json();
      setBooks(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Could not load books. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartClub = (book) => {
    setSelectedBook(book);
    setShowCreateModal(true);
  };

  const handleClubCreated = (club) => {
    setCreatedClub(club);
    setShowCreateModal(false);
    setShowSuccessModal(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setCreatedClub(null);
    setSelectedBook(null);
  };

  if (loading) {
    return <LoadingSpinner message="Loading books..." fullPage />;
  }

  if (error) {
    return (
      <div className="error">{error}</div>
    );
  }

  return (
    <div className="page-transition">
      {/* Welcome Banner — explains what Booklub is */}
      <SignedOut>
        <WelcomeBanner isSignedIn={false} />
        <div className="auth-prompt">
          <SignInButton mode="modal">
            <p className="auth-prompt-text">Sign in to create book clubs and start discussions</p>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <WelcomeBanner isSignedIn={true} />
      </SignedIn>

      <div className="books-grid">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            <h2>{book.title}</h2>
            <p className="author">by {book.author}</p>
            <p className="year">{book.publication_year}</p>
            <p className="genre">{book.genre}</p>
            
            <SignedIn>
              <button 
                className="start-club-button"
                onClick={() => handleStartClub(book)}
              >
                START A CLUB
              </button>
            </SignedIn>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showCreateModal && selectedBook && (
        <CreateClubModal
          book={selectedBook}
          userId={user?.id}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedBook(null);
          }}
          onClubCreated={handleClubCreated}
        />
      )}

      {showSuccessModal && createdClub && (
        <ClubCreatedModal
          club={createdClub}
          onClose={handleCloseSuccess}
        />
      )}
    </div>
  );
}

export default Home;