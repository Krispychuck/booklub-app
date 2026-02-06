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

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Link to="/" className="logo-link">
            <svg className="logo-icon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              <circle cx="22" cy="18" r="5" fill="#c8aa6e"/>
              <ellipse cx="22" cy="28" rx="7" ry="4" fill="#c8aa6e"/>
              <circle cx="42" cy="18" r="5" fill="#c8aa6e"/>
              <ellipse cx="42" cy="28" rx="7" ry="4" fill="#c8aa6e"/>
              <circle cx="32" cy="14" r="5.5" fill="#c8aa6e"/>
              <ellipse cx="32" cy="24" rx="7.5" ry="4.5" fill="#c8aa6e"/>
              <path d="M18 34 Q18 32 20 32 L44 32 Q46 32 46 34 L46 50 Q46 52 44 52 L28 52 L22 58 L22 52 L20 52 Q18 52 18 50 Z" fill="#000" stroke="#c8aa6e" strokeWidth="1.5"/>
              <path d="M26 38 L32 40 L32 49 L26 47 Z" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round"/>
              <path d="M38 38 L32 40 L32 49 L38 47 Z" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            <h1 className="logo-wordmark">
              <span className="logo-boo">Boo</span>
              <span className="logo-k">K</span>
              <span className="logo-lub">lub</span>
            </h1>
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