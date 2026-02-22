import React, { useState, useEffect, useCallback } from 'react';
import './ReadingProgressBar.css';
import { API_URL } from '../config';

function ReadingProgressBar({ clubId, userId, bookTitle }) {
  const [myProgress, setMyProgress] = useState(null);
  const [allProgress, setAllProgress] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  // Fetch progress data
  const fetchProgress = useCallback(async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        fetch(`${API_URL}/api/reading-progress/club/${clubId}`),
        fetch(`${API_URL}/api/reading-progress/club/${clubId}/user/${userId}`)
      ]);

      if (allRes.ok) {
        const allData = await allRes.json();
        setAllProgress(allData);
      }

      if (myRes.ok) {
        const myData = await myRes.json();
        if (myData) {
          setMyProgress(myData);
          setSliderValue(myData.progress_value || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching reading progress:', err);
    }
  }, [clubId, userId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Get a readable label for the progress value
  const getProgressLabel = (value) => {
    if (value === 0) return 'Not started';
    if (value <= 10) return 'Just started';
    if (value <= 25) return 'Early chapters';
    if (value <= 50) return 'Halfway';
    if (value <= 75) return 'Past halfway';
    if (value <= 90) return 'Almost done';
    if (value < 100) return 'Final pages';
    return 'Finished';
  };

  // Save progress
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/reading-progress/club/${clubId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          progressType: 'percentage',
          progressValue: sliderValue,
          progressLabel: getProgressLabel(sliderValue)
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setMyProgress(updated);
        // Refresh all progress
        await fetchProgress();
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    } finally {
      setSaving(false);
    }
  };

  // Compute display values
  const hasProgress = myProgress && myProgress.progress_value > 0;
  const progressPct = myProgress?.progress_value || 0;

  return (
    <div className="reading-progress-bar">
      {/* Compact bar — always visible in chat */}
      <button
        className="reading-progress-toggle"
        onClick={() => setShowPanel(!showPanel)}
      >
        <div className="reading-progress-track">
          <div
            className="reading-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="reading-progress-label">
          {hasProgress ? `${progressPct}%` : 'Set progress'}
        </span>
        <span className={`reading-progress-chevron ${showPanel ? 'reading-progress-chevron--open' : ''}`}>
          ▾
        </span>
      </button>

      {/* Expanded panel */}
      {showPanel && (
        <div className="reading-progress-panel">
          <div className="reading-progress-panel-header">
            <h4>Reading Progress</h4>
            {bookTitle && <p className="reading-progress-book">{bookTitle}</p>}
          </div>

          {/* My progress slider */}
          <div className="reading-progress-my-section">
            <label className="reading-progress-slider-label">
              Your progress: <strong>{sliderValue}%</strong>
              <span className="reading-progress-stage">{getProgressLabel(sliderValue)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value, 10))}
              className="reading-progress-slider"
            />
            <div className="reading-progress-slider-marks">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
            <button
              className="reading-progress-save-btn"
              onClick={handleSave}
              disabled={saving || sliderValue === (myProgress?.progress_value || 0)}
            >
              {saving ? 'Saving...' : 'Update Progress'}
            </button>
          </div>

          {/* Club members' progress */}
          {allProgress.length > 0 && (
            <div className="reading-progress-members-section">
              <h5 className="reading-progress-members-heading">Club Members</h5>
              {allProgress.map((member) => (
                <div key={member.user_id} className="reading-progress-member">
                  <span className="reading-progress-member-name">{member.name}</span>
                  <div className="reading-progress-member-track">
                    <div
                      className="reading-progress-member-fill"
                      style={{ width: `${member.progress_value}%` }}
                    />
                  </div>
                  <span className="reading-progress-member-pct">
                    {member.progress_value}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {allProgress.length === 0 && (
            <div className="reading-progress-empty">
              No one has set their progress yet. Be the first!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReadingProgressBar;
