const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET user by Clerk ID
router.get('/clerk/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM users WHERE clerk_id = $1',
      [clerkId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST create new user
router.post('/', async (req, res) => {
  try {
    const { clerkId, email, name } = req.body;
    
    // Check if user already exists
    const existing = await pool.query(
      'SELECT * FROM users WHERE clerk_id = $1',
      [clerkId]
    );
    
    if (existing.rows.length > 0) {
      return res.json(existing.rows[0]);
    }
    
    const result = await pool.query(
      `INSERT INTO users (clerk_id, email, name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [clerkId, email, name]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT update user display name
router.put('/:userId/name', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const result = await pool.query(
      `UPDATE users SET name = $1 WHERE id = $2 RETURNING *`,
      [name.trim(), userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user name:', error);
    res.status(500).json({ error: 'Failed to update name' });
  }
});

// GET check if name is available in a club
router.get('/check-name/:clubId/:name', async (req, res) => {
  try {
    const { clubId, name } = req.params;
    
    // Get all members of this club and their names
    const result = await pool.query(
      `SELECT u.name 
       FROM club_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.club_id = $1 AND LOWER(u.name) = LOWER($2)`,
      [clubId, name.trim()]
    );
    
    res.json({ available: result.rows.length === 0 });
  } catch (error) {
    console.error('Error checking name:', error);
    res.status(500).json({ error: 'Failed to check name' });
  }
});

module.exports = router;