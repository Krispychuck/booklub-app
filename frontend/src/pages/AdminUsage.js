import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { API_URL } from '../config';
import './AdminUsage.css';

function AdminUsage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/usage`);
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Could not load usage data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  if (loading) return <LoadingSpinner message="Loading usage data..." fullPage />;

  if (error) return (
    <div className="admin-usage page-transition">
      <button className="back-button" onClick={() => navigate('/')}>Back</button>
      <p className="error-text">{error}</p>
    </div>
  );

  const totalCost = Number(data.totals.total_cost);
  const totalCalls = Number(data.totals.total_calls);
  const totalInputTokens = Number(data.totals.total_input_tokens);
  const totalOutputTokens = Number(data.totals.total_output_tokens);
  const maxDailyCost = data.daily.length > 0
    ? Math.max(...data.daily.map(d => Number(d.total_cost)))
    : 0;

  return (
    <div className="admin-usage page-transition">
      <button className="back-button" onClick={() => navigate('/')}>Back</button>
      <h1 className="section-title">API Usage</h1>

      {/* Total Cost Card */}
      <div className="usage-total-card">
        <span className="usage-total-label">Total API Cost</span>
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
      {data.byFeature.length > 0 && (
        <div className="usage-section">
          <h2>By Feature</h2>
          <div className="usage-feature-cards">
            {data.byFeature.map(f => (
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
      {data.daily.length > 0 && (
        <div className="usage-section">
          <h2>Daily Costs (Last 30 Days)</h2>
          <div className="usage-daily-chart">
            {data.daily.map(d => {
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
      {data.recent.length > 0 && (
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
                {data.recent.map(r => (
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
      {totalCalls === 0 && (
        <div className="usage-empty">
          <p>No API usage recorded yet.</p>
          <p>Cost tracking begins the next time someone asks an author a question or generates a mind map.</p>
        </div>
      )}
    </div>
  );
}

export default AdminUsage;
