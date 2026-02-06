import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import Home from './pages/Home';
import MyClubs from './pages/MyClubs';
import JoinClubModal from './components/JoinClubModal';
import JoinSuccessModal from './components/JoinSuccessModal';
import ClubChat from './pages/ClubChat';
import DisplayNameModal from './components/DisplayNameModal';
import LoadingSpinner from './components/LoadingSpinner';
import { API_URL } from './config';

function App() {
  const { user, isLoaded } = useUser();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showJoinSuccessModal, setShowJoinSuccessModal] = useState(false);
  const [joinedClub, setJoinedClub] = useState(null);
  const [booklubUser, setBooklubUser] = useState(null);
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);

  // Check/create user in our database when Clerk user signs in
  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) {
        setBooklubUser(null);
        return;
      }

      try {
        // Check if user exists in our database
        const response = await fetch(`${API_URL}/api/users/clerk/${user.id}`);
        
        if (response.ok) {
          const existingUser = await response.json();
          setBooklubUser(existingUser);
          
          // If user has no name, show the modal
          if (!existingUser.name) {
            setShowDisplayNameModal(true);
          }
        } else if (response.status === 404) {
          // User doesn't exist, create them
          const createResponse = await fetch(`${API_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clerkId: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              name: null
            })
          });
          
          if (createResponse.ok) {
            const newUser = await createResponse.json();
            setBooklubUser(newUser);
            setShowDisplayNameModal(true); // Prompt for display name
          }
        }
      } catch (error) {
        console.error('Error syncing user:', error);
      }
    };

    syncUser();
  }, [isLoaded, user]);

  const handleSaveDisplayName = async (name) => {
    if (!booklubUser) return;

    const response = await fetch(`${API_URL}/api/users/${booklubUser.id}/name`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    if (response.ok) {
      const updatedUser = await response.json();
      setBooklubUser(updatedUser);
      setShowDisplayNameModal(false);
    } else {
      throw new Error('Failed to save name');
    }
  };

  const handleClubJoined = (club) => {
    setJoinedClub(club);
    setShowJoinModal(false);
    setShowJoinSuccessModal(true);
  };

  const handleCloseJoinSuccess = () => {
    setShowJoinSuccessModal(false);
    setJoinedClub(null);
  };

  if (!isLoaded) {
    return (
      <div className="app-loading">
        <img src="/booklub-marquee.png" alt="BooKlub" className="app-loading-logo" />
        <LoadingSpinner message="Warming up..." />
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Link to="/" className="logo-link">
            <img src="/booklub-marquee.png" alt="BooKlub" className="logo-marquee" />
          </Link>
          
          <nav className="main-nav">
            <Link to="/" className="nav-link">Browse Books</Link>
            <SignedIn>
              <Link to="/my-clubs" className="nav-link">My Clubs</Link>
              <button 
                onClick={() => setShowJoinModal(true)}
                className="join-club-button"
              >
                Join Club
              </button>
            </SignedIn>
          </nav>

          <div className="header-actions">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="sign-in-button">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <span 
                className="welcome-text clickable"
                onClick={() => setShowDisplayNameModal(true)}
                title="Click to change display name"
              >
                Welcome, {booklubUser?.name || user?.firstName || 'Reader'}
              </span>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-clubs" element={<MyClubs booklubUser={booklubUser} />} />
            <Route path="/club/:clubId" element={<ClubChat booklubUser={booklubUser} />} />
          </Routes>
        </main>

        {/* Join Club Modals */}
        {showJoinModal && (
          <JoinClubModal
            userId={booklubUser?.id}
            onClose={() => setShowJoinModal(false)}
            onClubJoined={handleClubJoined}
          />
        )}

        {showJoinSuccessModal && joinedClub && (
          <JoinSuccessModal
            club={joinedClub}
            onClose={handleCloseJoinSuccess}
          />
        )}

        {/* Display Name Modal */}
        {showDisplayNameModal && (
          <DisplayNameModal
            currentName={booklubUser?.name}
            onSave={handleSaveDisplayName}
            onClose={() => setShowDisplayNameModal(false)}
          />
        )}
      </div>
    </Router>
  );
}

export default App;