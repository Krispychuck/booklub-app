import React, { useEffect, useState } from 'react';
import './TopicExplorer.css';
import LoadingSpinner from './LoadingSpinner';
import { API_URL } from '../config';

const TYPE_LABELS = {
  theme: 'Theme',
  character: 'Character',
  plot: 'Plot',
  symbolism: 'Symbolism',
  personal: 'Personal',
  question: 'Question',
};

const TYPE_ICONS = {
  theme: '◆',
  character: '◉',
  plot: '▸',
  symbolism: '✦',
  personal: '♡',
  question: '?',
};

function TopicExplorer({ clubId, userId, bookTitle, bookAuthor, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topicData, setTopicData] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/mindmaps/${clubId}/generate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.details || data.error || 'Failed to analyze topics');
        }

        const data = await response.json();
        setTopicData(data.topicData);
      } catch (err) {
        console.error('Topic Explorer error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [clubId, userId]);

  const toggleTopic = (topicId) => {
    setExpandedTopic(prev => prev === topicId ? null : topicId);
  };

  return (
    <div className="topic-explorer-overlay" onClick={onClose}>
      <div className="topic-explorer-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="topic-explorer-header">
          <div className="topic-explorer-title">
            <h2>Discussion Topics</h2>
            <p>{bookTitle} by {bookAuthor}</p>
          </div>
          <button className="topic-explorer-close-btn" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Content */}
        <div className="topic-explorer-body">
          {loading && (
            <div className="topic-explorer-loading">
              <LoadingSpinner message="Analyzing your discussion..." />
            </div>
          )}

          {error && (
            <div className="topic-explorer-error">
              <p>{error}</p>
              <button onClick={onClose}>Close</button>
            </div>
          )}

          {!loading && !error && topicData && (
            <>
              {/* Topic summary */}
              <div className="topic-explorer-summary">
                <span className="topic-explorer-count">
                  {topicData.topicCount || topicData.topics?.length || 0} topics
                </span>
                <span className="topic-explorer-separator">·</span>
                <span className="topic-explorer-messages-analyzed">
                  from your conversation
                </span>
              </div>

              {/* Topic list */}
              <div className="topic-explorer-list">
                {(topicData.topics || []).map((topic, index) => {
                  const isExpanded = expandedTopic === topic.id;
                  const typeIcon = TYPE_ICONS[topic.type] || '◆';
                  const typeLabel = TYPE_LABELS[topic.type] || topic.type;

                  return (
                    <div
                      key={topic.id}
                      className={`topic-card ${isExpanded ? 'topic-card--expanded' : ''}`}
                    >
                      {/* Topic header — clickable */}
                      <button
                        className="topic-card-header"
                        onClick={() => toggleTopic(topic.id)}
                        aria-expanded={isExpanded}
                      >
                        <div className="topic-card-left">
                          <span className={`topic-card-icon topic-card-icon--${topic.type}`}>
                            {typeIcon}
                          </span>
                          <div className="topic-card-info">
                            <h3 className="topic-card-name">{topic.name}</h3>
                            <div className="topic-card-meta">
                              <span className={`topic-card-type topic-card-type--${topic.type}`}>
                                {typeLabel}
                              </span>
                              {topic.participants && topic.participants.length > 0 && (
                                <span className="topic-card-participants">
                                  {topic.participants.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className={`topic-card-chevron ${isExpanded ? 'topic-card-chevron--open' : ''}`}>
                          ›
                        </span>
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="topic-card-detail">
                          {/* Summary */}
                          {topic.summary && (
                            <p className="topic-card-summary">{topic.summary}</p>
                          )}

                          {/* Key quotes */}
                          {topic.quotes && topic.quotes.length > 0 && (
                            <div className="topic-card-quotes">
                              <h4 className="topic-card-quotes-label">Key Quotes</h4>
                              {topic.quotes.map((quote, qi) => {
                                return (
                                  <div key={qi} className="topic-card-quote">
                                    <div className="topic-card-quote-text">
                                      "{quote.text}"
                                    </div>
                                    <div className="topic-card-quote-speaker">
                                      — {quote.speaker}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Message count */}
                          {topic.messageCount && (
                            <div className="topic-card-message-count">
                              {topic.messageCount} message{topic.messageCount !== 1 ? 's' : ''} in this topic
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Empty state */}
              {(!topicData.topics || topicData.topics.length === 0) && (
                <div className="topic-explorer-empty">
                  <p>No topics could be extracted from this conversation yet.</p>
                  <p>Keep chatting and try again!</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="topic-explorer-footer">
          Tap a topic to explore · AI-powered analysis
        </div>
      </div>
    </div>
  );
}

export default TopicExplorer;
