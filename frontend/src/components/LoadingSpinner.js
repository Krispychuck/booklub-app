import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ message, size = 'medium', fullPage = false }) {
  return (
    <div className={`loading-spinner-container ${fullPage ? 'full-page' : ''}`}>
      <div className={`book-loader book-loader-${size}`}>
        <span className="book-page"></span>
        <span className="book-page"></span>
        <span className="book-page"></span>
      </div>
      {message && <p className="loading-spinner-message">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
