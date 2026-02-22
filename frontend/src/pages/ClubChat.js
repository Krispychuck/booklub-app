import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ClubChat.css';
import MembersModal from '../components/MembersModal';
import TopicExplorer from '../components/TopicExplorer';
import ChatExplainer from '../components/ChatExplainer';
import ReadingProgressBar from '../components/ReadingProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { API_URL } from '../config';

const POLL_INTERVAL = 5000; // Check for new messages every 5 seconds

function ClubChat({ booklubUser }) {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [book, setBook] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleteModalMessage, setDeleteModalMessage] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showTopics, setShowTopics] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  // Check if user is scrolled near the bottom (within 150px)
  const isNearBottom = useCallback(() => {
    const area = messagesAreaRef.current;
    if (!area) return true;
    return area.scrollHeight - area.scrollTop - area.clientHeight < 150;
  }, []);

  // Scroll to bottom (only if user is already near bottom)
  const scrollToBottom = useCallback((force = false) => {
    if (force || isNearBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isNearBottom]);

  // Track the latest message ID for efficient polling
  useEffect(() => {
    if (messages.length > 0) {
      lastMessageIdRef.current = messages[messages.length - 1].id;
    }
  }, [messages]);

  // Scroll on initial load and when user sends a message
  useEffect(() => {
    scrollToBottom(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch club details and messages (initial load)
  useEffect(() => {
    if (!clubId || !booklubUser?.id) return;

    const fetchClubData = async () => {
      try {
        // Fetch club details
        const clubRes = await fetch(`${API_URL}/api/clubs/${clubId}?userId=${booklubUser.id}`);
        if (!clubRes.ok) throw new Error('Club not found');
        const clubData = await clubRes.json();
        setClub(clubData);

        // Fetch book details
        const bookRes = await fetch(`${API_URL}/api/books/${clubData.book_id}`);
        if (bookRes.ok) {
          const bookData = await bookRes.json();
          setBook(bookData);
        }

        // Fetch messages
        const messagesRes = await fetch(`${API_URL}/api/messages/club/${clubId}`);
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setMessages(messagesData);
        }
      } catch (error) {
        console.error('Error fetching club data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubData();
  }, [clubId, booklubUser?.id]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!clubId || loading) return;

    const pollForMessages = async () => {
      // Don't poll while user is actively sending (avoids duplicates)
      if (sending) return;

      const lastId = lastMessageIdRef.current;
      if (!lastId) return;

      try {
        const res = await fetch(`${API_URL}/api/messages/club/${clubId}/since/${lastId}`);
        if (res.ok) {
          const newMessages = await res.json();
          if (newMessages.length > 0) {
            setMessages(prev => [...prev, ...newMessages]);
            scrollToBottom();
          }
        }
      } catch (error) {
        // Silently fail — polling errors shouldn't disrupt the UI
      }
    };

    const intervalId = setInterval(pollForMessages, POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [clubId, loading, sending, scrollToBottom]);

  // Delete a message
  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/${messageId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMessages(messages.filter(msg => msg.id !== messageId));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
    setDeleteModalMessage(null);
  };

  // Send a message
  const handleSendMessage = async (e, askAuthor = false) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`${API_URL}/api/messages/club/${clubId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          senderType: 'user',
          senderUserId: booklubUser?.id,
          senderAiName: null
        })
      });

      if (response.ok) {
        const savedMessage = await response.json();
        savedMessage.sender_name = booklubUser?.name || 'You';
        setMessages(prev => [...prev, savedMessage]);
        setNewMessage('');
        // Always scroll to bottom when user sends their own message
        setTimeout(() => scrollToBottom(true), 100);
        
        // Only request AI response if askAuthor is true
        if (askAuthor) {
          try {
            const aiResponse = await fetch(`${API_URL}/api/messages/club/${clubId}/ai-response`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
            
            if (aiResponse.ok) {
              const aiMessage = await aiResponse.json();
              setMessages(prev => [...prev, aiMessage]);
              setTimeout(() => scrollToBottom(true), 100);
            }
          } catch (aiError) {
            console.error('Error getting AI response:', aiError);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading conversation..." fullPage />;
  }

  if (!club) {
    return (
      <div className="chat-error">
        <h2>Club not found</h2>
        <button onClick={() => navigate('/my-clubs')}>Back to My Clubs</button>
      </div>
    );
  }

  return (
    <div className="chat-container page-transition">
      {/* Header */}
     <div className="chat-header">
        <button className="back-button" onClick={() => navigate('/my-clubs')}>
          ← Back
        </button>
        <div className="chat-header-info">
          <h1>{club.name}</h1>
          {book && <p className="book-info">{book.title} by {book.author}</p>}
        </div>
        <button
          className="mind-map-button"
          onClick={() => setShowTopics(true)}
          disabled={messages.length === 0}
        >
          Topics
        </button>
        <button className="members-button" onClick={() => setShowMembersModal(true)}>
          Members
        </button>
      </div>

      {/* Chat Explainer — first-visit tooltip */}
      <ChatExplainer bookAuthor={book?.author} />

      {/* Reading Progress Bar — Sprint 6 */}
      <ReadingProgressBar
        clubId={clubId}
        userId={booklubUser?.id}
        bookTitle={book?.title}
      />

      {/* Messages Area */}
      <div className="messages-area" ref={messagesAreaRef}>
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
            {book && (
              <p className="conversation-prompt">
                Ask {book.author} about "{book.title}"
              </p>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender_type === 'ai' ? 'ai-message' : 'user-message'}`}
            >
              <div className="message-header">
                <span className="sender-name">
                  {message.sender_type === 'ai' 
                    ? message.sender_ai_name 
                    : message.sender_name || 'User'}
                </span>
                <span className="message-time">
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <div className="message-content">
                {message.sender_type === 'ai'
                  ? message.content.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))
                  : message.content
                }
              </div>
              <button 
                className="delete-message-btn"
                onClick={() => setDeleteModalMessage(message)}
              >
                Delete
              </button>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

{/* Input Area */}
      <form className="message-input-area" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={book ? `Discuss "${book.title}"...` : 'Type a message...'}
          disabled={sending}
        />
        <div className="send-buttons">
          <button 
            type="button" 
            onClick={(e) => handleSendMessage(e, false)}
            disabled={sending || !newMessage.trim()}
            className="group-comment-btn"
          >
            {sending ? 'Sending...' : 'Group Comment'}
          </button>
          <button 
            type="button" 
            onClick={(e) => handleSendMessage(e, true)}
            disabled={sending || !newMessage.trim()}
            className="ask-author-btn"
          >
            {sending ? 'Sending...' : `Ask ${book?.author || 'Author'}`}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {deleteModalMessage && (
        <div className="delete-modal-overlay" onClick={() => setDeleteModalMessage(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Message?</h3>
            <p>This action cannot be undone.</p>
            <div className="delete-modal-buttons">
              <button 
                className="delete-cancel-btn"
                onClick={() => setDeleteModalMessage(null)}
              >
                Cancel
              </button>
              <button 
                className="delete-confirm-btn"
                onClick={() => handleDeleteMessage(deleteModalMessage.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Members Modal */}
      {showMembersModal && (
        <MembersModal
          clubId={clubId}
          clubName={club.name}
          booklubUser={booklubUser}
          onClose={() => setShowMembersModal(false)}
        />
      )}
      {/* Topic Explorer */}
      {showTopics && (
        <TopicExplorer
          clubId={clubId}
          userId={booklubUser?.id}
          bookTitle={book?.title}
          bookAuthor={book?.author}
          onClose={() => setShowTopics(false)}
        />
      )}
    </div>
  );
}

export default ClubChat;