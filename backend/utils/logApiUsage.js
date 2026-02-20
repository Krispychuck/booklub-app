const pool = require('../db');
const { calculateCost } = require('../config/pricing');

let tableEnsured = false;

async function ensureApiUsageTable() {
  if (tableEnsured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS api_usage (
      id SERIAL PRIMARY KEY,
      feature VARCHAR(50) NOT NULL,
      club_id UUID,
      model VARCHAR(100) NOT NULL,
      input_tokens INTEGER NOT NULL,
      output_tokens INTEGER NOT NULL,
      input_cost NUMERIC(10, 6) NOT NULL,
      output_cost NUMERIC(10, 6) NOT NULL,
      total_cost NUMERIC(10, 6) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  tableEnsured = true;
}

async function logApiUsage({ feature, clubId, model, inputTokens, outputTokens }) {
  try {
    const costs = calculateCost(model, inputTokens, outputTokens);
    if (!costs) return;

    await ensureApiUsageTable();

    await pool.query(
      `INSERT INTO api_usage (feature, club_id, model, input_tokens, output_tokens, input_cost, output_cost, total_cost)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [feature, clubId, model, inputTokens, outputTokens, costs.input_cost, costs.output_cost, costs.total_cost]
    );
  } catch (error) {
    // Log but don't throw — cost tracking should never break the main flow
    console.error('Failed to log API usage:', error.message);
  }
}

module.exports = logApiUsage;
