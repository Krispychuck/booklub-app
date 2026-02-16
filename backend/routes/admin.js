const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/admin/usage — Aggregated API cost data
router.get('/usage', async (req, res) => {
  try {
    // Check if table exists (may not on first load before any API call)
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'api_usage'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      return res.json({
        totals: { total_calls: '0', total_input_tokens: '0', total_output_tokens: '0', total_cost: '0' },
        byFeature: [],
        daily: [],
        recent: [],
      });
    }

    // Total costs (all time)
    const totalsResult = await pool.query(`
      SELECT
        COUNT(*) as total_calls,
        COALESCE(SUM(input_tokens), 0) as total_input_tokens,
        COALESCE(SUM(output_tokens), 0) as total_output_tokens,
        COALESCE(SUM(total_cost), 0) as total_cost
      FROM api_usage
    `);

    // Costs by feature
    const byFeatureResult = await pool.query(`
      SELECT
        feature,
        COUNT(*) as calls,
        COALESCE(SUM(input_tokens), 0) as input_tokens,
        COALESCE(SUM(output_tokens), 0) as output_tokens,
        COALESCE(SUM(total_cost), 0) as total_cost
      FROM api_usage
      GROUP BY feature
      ORDER BY total_cost DESC
    `);

    // Costs by day (last 30 days)
    const dailyResult = await pool.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as calls,
        COALESCE(SUM(total_cost), 0) as total_cost
      FROM api_usage
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Recent calls (last 20)
    const recentResult = await pool.query(`
      SELECT
        au.id,
        au.feature,
        au.model,
        au.input_tokens,
        au.output_tokens,
        au.total_cost,
        au.created_at,
        bc.name as club_name
      FROM api_usage au
      LEFT JOIN book_clubs bc ON au.club_id = bc.id
      ORDER BY au.created_at DESC
      LIMIT 20
    `);

    res.json({
      totals: totalsResult.rows[0],
      byFeature: byFeatureResult.rows,
      daily: dailyResult.rows,
      recent: recentResult.rows,
    });
  } catch (error) {
    console.error('Error fetching usage data:', error);
    res.status(500).json({ error: 'Failed to fetch usage data' });
  }
});

module.exports = router;
