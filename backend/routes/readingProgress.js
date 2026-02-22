const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ensure reading_progress table exists
let tableReady = false;
async function ensureReadingProgressTable() {
  if (tableReady) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reading_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        club_id UUID NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
        progress_type VARCHAR(20) NOT NULL DEFAULT 'percent',
        progress_value INTEGER NOT NULL DEFAULT 0,
        progress_label VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, club_id)
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_reading_progress_club ON reading_progress(club_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON reading_progress(user_id)');
    tableReady = true;
    console.log('✅ reading_progress table ready');
  } catch (err) {
    console.error('❌ Error ensuring reading_progress table:', err.message);
    throw err;
  }
}

// GET reading progress for all members of a club
router.get('/club/:clubId', async (req, res) => {
  try {
    await ensureReadingProgressTable();
    const { clubId } = req.params;

    const result = await pool.query(
      `SELECT rp.*, u.name as user_name
       FROM reading_progress rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.club_id = $1
       ORDER BY rp.progress_value DESC`,
      [clubId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reading progress:', error);
    res.status(500).json({ error: 'Failed to fetch reading progress' });
  }
});

// GET reading progress for a specific user in a club
router.get('/club/:clubId/user/:userId', async (req, res) => {
  try {
    await ensureReadingProgressTable();
    const { clubId, userId } = req.params;

    const result = await pool.query(
      `SELECT * FROM reading_progress
       WHERE club_id = $1 AND user_id = $2`,
      [clubId, userId]
    );

    if (result.rows.length === 0) {
      return res.json({ progress_type: 'percent', progress_value: 0, progress_label: null });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user reading progress:', error);
    res.status(500).json({ error: 'Failed to fetch reading progress' });
  }
});

// POST/UPDATE reading progress (upsert)
router.post('/club/:clubId', async (req, res) => {
  try {
    await ensureReadingProgressTable();
    const { clubId } = req.params;
    const { userId, progressType, progressValue, progressLabel } = req.body;

    if (!userId || progressValue === undefined) {
      return res.status(400).json({ error: 'userId and progressValue are required' });
    }

    // Validate progressValue
    const value = parseInt(progressValue);
    if (isNaN(value) || value < 0 || value > 100) {
      return res.status(400).json({ error: 'progressValue must be between 0 and 100' });
    }

    // Upsert — insert or update on conflict
    const result = await pool.query(
      `INSERT INTO reading_progress (user_id, club_id, progress_type, progress_value, progress_label, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id, club_id)
       DO UPDATE SET progress_type = $3, progress_value = $4, progress_label = $5, updated_at = NOW()
       RETURNING *`,
      [userId, clubId, progressType || 'percent', value, progressLabel || null]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating reading progress:', error);
    res.status(500).json({ error: 'Failed to update reading progress' });
  }
});

module.exports = router;
