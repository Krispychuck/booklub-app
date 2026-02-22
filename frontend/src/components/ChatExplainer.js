import React, { useState } from 'react';
import './ChatExplainer.css';

function ChatExplainer({ bookAuthor }) {
  const [dismissed, setDismissed] = useState(false);

  const hasSeenExplainer = localStorage.getItem('booklub_chat_explainer_dismissed');

  if (dismissed || hasSeenExplainer) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('booklub_chat_explainer_dismissed', 'true');
  };

  return (
    <div className="chat-explainer">
      <div className="chat-explainer-content">
        <h3 className="chat-explainer-title">How this works</h3>
        <div className="chat-explainer-items">
          <div className="chat-explainer-item">
            <span className="chat-explainer-label chat-explainer-label--group">Group Comment</span>
            <span className="chat-explainer-desc">Talk to your club members — the author won't respond</span>
          </div>
          <div className="chat-explainer-item">
            <span className="chat-explainer-label chat-explainer-label--author">Ask {bookAuthor || 'Author'}</span>
            <span className="chat-explainer-desc">Ask the AI author a question — they'll join the conversation</span>
          </div>
        </div>
        <button className="chat-explainer-dismiss" onClick={handleDismiss}>
          Got it
        </button>
      </div>
    </div>
  );
}

export default ChatExplainer;
