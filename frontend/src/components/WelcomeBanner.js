import React, { useState } from 'react';
import './WelcomeBanner.css';

function WelcomeBanner({ isSignedIn }) {
  const [dismissed, setDismissed] = useState(false);

  // Check if user has seen the welcome banner before
  const hasSeenBanner = localStorage.getItem('booklub_welcome_dismissed');

  // Don't show if dismissed this session or previously
  if (dismissed || (isSignedIn && hasSeenBanner)) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (isSignedIn) {
      localStorage.setItem('booklub_welcome_dismissed', 'true');
    }
  };

  return (
    <div className="welcome-banner">
      <button className="welcome-banner-close" onClick={handleDismiss} aria-label="Close">
        ✕
      </button>

      <div className="welcome-banner-content">
        <h2 className="welcome-banner-title">Welcome to Booklub</h2>
        <p className="welcome-banner-subtitle">Where readers meet authors — powered by AI</p>

        <div className="welcome-banner-steps">
          <div className="welcome-step">
            <span className="welcome-step-number">1</span>
            <div className="welcome-step-text">
              <strong>Pick a book</strong>
              <span>Browse our catalog and start a private club</span>
            </div>
          </div>
          <div className="welcome-step">
            <span className="welcome-step-number">2</span>
            <div className="welcome-step-text">
              <strong>Invite your friends</strong>
              <span>Share your club's invite code to read together</span>
            </div>
          </div>
          <div className="welcome-step">
            <span className="welcome-step-number">3</span>
            <div className="welcome-step-text">
              <strong>Ask the author</strong>
              <span>Chat with an AI version of the author about the book</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeBanner;
