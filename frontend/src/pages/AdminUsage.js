import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { API_URL } from '../config';
import './AdminUsage.css';

function AdminUsage() {
  const [localData, setLocalData] = useState(null);
  const [anthropicData, setAnthropicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [localRes, anthropicRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/usage`),
          fetch(`${API_URL}/api/admin/anthropic-usage`),
        ]);

        if (!localRes.ok) throw new Error('Failed to fetch local usage');
        const local = await localRes.json();
        setLocalData(local);

        if (anthropicRes.ok) {
          const anthropic = await anthropicRes.json();
          setAnthropicData(anthropic);
        }
      } catch (err) {
        setError('Could not load usage data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingSpinner message="Loading usage data..." fullPage />;

  if (error) return (
    <div className="admin-usage page-transition">
      <button className="back-button" onClick={() => navigate('/')}>Back</button>
      <p className="error-text">{error}</p>
    </div>
  );

  const totalCost = Number(localData.totals.total_cost);
  const totalCalls = Number(localData.totals.total_calls);
  const totalInputTokens = Number(localData.totals.total_input_tokens);
  const totalOutputTokens = Number(localData.totals.total_output_tokens);
  const maxDailyCost = localData.daily.length > 0
    ? Math.max(...localData.daily.map(d => Number(d.total_cost)))
    : 0;

  const showAnthropicSection = anthropicData && anthropicData.configured && !anthropicData.error;
  const showAnthropicPrompt = anthropicData && !anthropicData.configured;

  return (
    <div className="admin-usage page-transition">
      <button className="back-button" onClick={() => navigate('/')}>Back</button>
      <h1 className="section-title">API Usage</h1>

      {/* Anthropic Account Usage Section */}
      {showAnthropicSection && (
        <div className="usage-section anthropic-section">
          <h2>Anthropic Account Usage</h2>
          <p className="section-subtitle">
            Account-wide data from Anthropic ({anthropicData.period.from} to {anthropicData.period.to})
          </p>

          {/* Anthropic Total Cost Card */}
          <div className="usage-total-card">
            <span className="usage-total-label">Account Total (Last 31 Days)</span>
            <span className="usage-total-amount">
              ${anthropicData.totals.total_cost.toFixed(2)}
            </span>
            <div className="usage-total-details">
              <span>{anthropicData.totals.total_input_tokens.toLocaleString()} input tokens</span>
              <span>{anthropicData.totals.total_output_tokens.toLocaleString()} output tokens</span>
              {anthropicData.totals.total_cache_read_tokens > 0 && (
                <span>{anthropicData.totals.total_cache_read_tokens.toLocaleString()} cache read</span>
              )}
            </div>
          </div>

          {/* Anthropic Model Breakdown */}
          {anthropicData.byModel.length > 0 && (
            <div className="usage-feature-cards">
              {anthropicData.byModel.map(m => (
                <div key={m.model} className="usage-feature-card">
                  <span className="feature-name">{m.model}</span>
                  <span className="feature-meta">
                    {m.input_tokens.toLocaleString()} in / {m.output_tokens.toLocaleString()} out
                  </span>
                  {m.cache_read > 0 && (
                    <span className="feature-meta">{m.cache_read.toLocaleString()} cache read</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Anthropic Daily Chart */}
          {anthropicData.daily.length > 0 && (() => {
            const maxAnthropicDaily = Math.max(...anthropicData.daily.map(d => d.cost));
            return (
              <div className="anthropic-daily-section">
                <h3>Daily Account Costs</h3>
                <div className="usage-daily-chart">
                  {anthropicData.daily.map(d => {
                    const barWidth = maxAnthropicDaily > 0
                      ? Math.max(2, (d.cost / maxAnthropicDaily) * 100)
                      : 2;
                    return (
                      <div key={d.date} className="daily-bar-row">
                        <span className="daily-date">
                          {new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="daily-bar-container">
                          <div
                            className="daily-bar"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="daily-cost">${d.cost.toFixed(4)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Anthropic not configured prompt */}
      {showAnthropicPrompt && (
        <div className="anthropic-info-banner">
          <span className="info-icon">&#9432;</span>
          <div>
            <strong>Want account-wide historical data?</strong>
            <p>Add your <code>ANTHROPIC_ADMIN_API_KEY</code> to your Render environment variables to see full account usage from Anthropic's API.</p>
          </div>
        </div>
      )}

      {/* Anthropic API error */}
      {anthropicData && anthropicData.configured && anthropicData.error && (
        <div className="anthropic-info-banner anthropic-error-banner">
          <span className="info-icon">&#9888;</span>
          <div>
            <strong>Could not load Anthropic account data</strong>
            <p>{anthropicData.error}</p>
          </div>
        </div>
      )}

      {/* Divider between sections */}
      {(showAnthropicSection || showAnthropicPrompt) && (
        <hr className="section-divider" />
      )}

      {/* Local BooKlub Tracked Usage Section */}
      <div className="usage-section">
        <h2>BooKlub Tracked Usage</h2>
        <p className="section-subtitle">Per-call detail logged by the app</p>
      </div>

      {/* Total Cost Card */}
      <div className="usage-total-card">
        <span className="usage-total-label">Total Tracked Cost</span>
        <span className="usage-total-amount">
          ${totalCost.toFixed(2)}
        </span>
        <div className="usage-total-details">
          <span>{totalCalls} API calls</span>
          <span>{totalInputTokens.toLocaleString()} input tokens</span>
          <span>{totalOutputTokens.toLocaleString()} output tokens</span>
        </div>
      </div>

      {/* Feature Breakdown */}
      {localData.byFeature.length > 0 && (
        <div className="usage-section">
          <h2>By Feature</h2>
          <div className="usage-feature-cards">
            {localData.byFeature.map(f => (
              <div key={f.feature} className="usage-feature-card">
                <span className="feature-name">
                  {f.feature === 'author_response' ? 'Author Responses' : 'Mind Maps'}
                </span>
                <span className="feature-cost">${Number(f.total_cost).toFixed(4)}</span>
                <span className="feature-meta">{f.calls} calls</span>
                <span className="feature-meta">
                  {Number(f.input_tokens).toLocaleString()} in / {Number(f.output_tokens).toLocaleString()} out
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Costs */}
      {localData.daily.length > 0 && (
        <div className="usage-section">
          <h2>Daily Costs (Last 30 Days)</h2>
          <div className="usage-daily-chart">
            {localData.daily.map(d => {
              const cost = Number(d.total_cost);
              const barWidth = maxDailyCost > 0
                ? Math.max(2, (cost / maxDailyCost) * 100)
                : 2;
              return (
                <div key={d.date} className="daily-bar-row">
                  <span className="daily-date">
                    {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="daily-bar-container">
                    <div
                      className="daily-bar"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="daily-cost">${cost.toFixed(4)}</span>
                  <span className="daily-calls">{d.calls} calls</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Calls Table */}
      {localData.recent.length > 0 && (
        <div className="usage-section">
          <h2>Recent API Calls</h2>
          <div className="usage-table-wrapper">
            <table className="usage-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Feature</th>
                  <th>Club</th>
                  <th>Input</th>
                  <th>Output</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {localData.recent.map(r => (
                  <tr key={r.id}>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
                    <td>{r.feature === 'author_response' ? 'Author' : 'Mind Map'}</td>
                    <td>{r.club_name || '\u2014'}</td>
                    <td>{r.input_tokens.toLocaleString()}</td>
                    <td>{r.output_tokens.toLocaleString()}</td>
                    <td>${Number(r.total_cost).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalCalls === 0 && !showAnthropicSection && (
        <div className="usage-empty">
          <p>No API usage recorded yet.</p>
          <p>Cost tracking begins the next time someone asks an author a question or generates a mind map.</p>
        </div>
      )}
    </div>
  );
}

export default AdminUsage;
