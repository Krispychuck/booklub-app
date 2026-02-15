import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ClubChat.css';
import MembersModal from '../components/MembersModal';
import MindMapVisualization from '../components/MindMapVisualization';
import LoadingSpinner from '../components/LoadingSpinner';
import { API_URL } from '../config';

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
  const [showMindMap, setShowMindMap] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch club details and messages
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
          onClick={() => setShowMindMap(true)}
          disabled={messages.length === 0}
        >
          Map Discussion
        </button>
        <button className="members-button" onClick={() => setShowMembersModal(true)}>
          Members
        </button>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
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
              <div className="message-content">{message.content}</div>
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
      {/* Mind Map Modal */}
      {showMindMap && (
        <MindMapVisualization
          clubId={clubId}
          userId={booklubUser?.id}
          bookTitle={book?.title}
          bookAuthor={book?.author}
          messages={messages}
          onClose={() => setShowMindMap(false)}
        />
      )}
    </div>
  );
}

export default ClubChat;