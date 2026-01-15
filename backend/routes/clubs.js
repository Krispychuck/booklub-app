const express = require('express');
const router = express.Router();
const pool = require('../db');
console.log('✅ Clubs routes loaded successfully');

// Helper function to generate random 6-character invite code
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0, O, 1, I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST /api/clubs - Create a new book club
router.post('/', async (req, res) => {
  try {
    const { name, bookId, userId } = req.body;

    // Validate required fields
    if (!name || !bookId || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, bookId, userId' 
      });
    }

    // Generate unique invite code (keep trying if collision)
    let inviteCode;
    let isUnique = false;
    while (!isUnique) {
      inviteCode = generateInviteCode();
      const checkCode = await pool.query(
        'SELECT id FROM book_clubs WHERE invite_code = $1',
        [inviteCode]
      );
      if (checkCode.rows.length === 0) {
        isUnique = true;
      }
    }

    // Create the club
    const clubResult = await pool.query(
      `INSERT INTO book_clubs (name, book_id, creator_user_id, invite_code)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, bookId, userId, inviteCode]
    );

    const club = clubResult.rows[0];

    // Add creator as a member with 'creator' role
    await pool.query(
      `INSERT INTO club_members (club_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [club.id, userId, 'creator']
    );

    res.status(201).json({
      success: true,
      club: club
    });

  } catch (error) {
    console.error('Error creating club:', error);
    res.status(500).json({ error: 'Failed to create club' });
  }
});

// GET /api/clubs - Get all clubs for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    const result = await pool.query(
      `SELECT 
        bc.*,
        b.title as book_title,
        b.author as book_author
       FROM book_clubs bc
       JOIN club_members cm ON bc.id = cm.club_id
       JOIN books b ON bc.book_id = b.id
       WHERE cm.user_id = $1 AND bc.status = 'active'
       ORDER BY bc.created_at DESC`,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});

// TEST ROUTES
router.get('/test', (req, res) => {
  res.json({ message: 'Test GET route works!' });
});

router.post('/testpost', (req, res) => {
  res.json({ message: 'Test POST route works!' });
});

// Test members route
router.get('/members-test', (req, res) => {
  res.json({ message: 'Members test route works!' });
});


// POST /api/clubs/join - Join a club using invite code
router.post('/join', async (req, res) => {
  console.log('🎯 JOIN endpoint hit!', req.body);
  try {
    const { inviteCode, userId } = req.body;

    // Validate required fields
    if (!inviteCode || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: inviteCode, userId' 
      });
    }

    // Find the club by invite code
    const clubResult = await pool.query(
      'SELECT * FROM book_clubs WHERE invite_code = $1 AND status = $2',
      [inviteCode.toUpperCase(), 'active']
    );

    if (clubResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    const club = clubResult.rows[0];

    // Check if user is already a member
    const memberCheck = await pool.query(
      'SELECT * FROM club_members WHERE club_id = $1 AND user_id = $2',
      [club.id, userId]
    );

    if (memberCheck.rows.length > 0) {
      return res.status(400).json({ error: 'You are already a member of this club' });
    }

    // Check if club is full (MVP: max 5 members)
    const memberCount = await pool.query(
      'SELECT COUNT(*) FROM club_members WHERE club_id = $1',
      [club.id]
    );

    if (parseInt(memberCount.rows[0].count) >= 5) {
      return res.status(400).json({ error: 'This club is full (max 5 members for MVP)' });
    }

    // Add user as a member
    await pool.query(
      `INSERT INTO club_members (club_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [club.id, userId, 'member']
    );

    // Get the full club details with book info to return
    const fullClubResult = await pool.query(
      `SELECT 
        bc.*,
        b.title as book_title,
        b.author as book_author
       FROM book_clubs bc
       JOIN books b ON bc.book_id = b.id
       WHERE bc.id = $1`,
      [club.id]
    );

    res.status(200).json({
      success: true,
      message: 'Successfully joined the club!',
      club: fullClubResult.rows[0]
    });

  } catch (error) {
    console.error('Error joining club:', error);
    res.status(500).json({ error: 'Failed to join club' });
  }
});

// GET /api/clubs/:clubId/members - Get all members of a club
router.get('/:clubId/members', async (req, res) => {
  try {
    const { clubId } = req.params;

const result = await pool.query(
      `SELECT 
        u.id,
        u.name,
        cm.role,
        cm.joined_at
       FROM club_members cm
       JOIN users u ON cm.user_id = u.clerk_id
       WHERE cm.club_id = $1::uuid
       ORDER BY cm.joined_at ASC`,
      [clubId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching club members:', error);
    res.status(500).json({ error: 'Failed to fetch club members' });
  }
});

// GET /api/clubs/:id - Get specific club details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    // Check if user is a member of this club
    const memberCheck = await pool.query(
      'SELECT * FROM club_members WHERE club_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this club' });
    }

    // Get club details with book info
    const result = await pool.query(
      `SELECT 
        bc.*,
        b.title as book_title,
        b.author as book_author,
        b.publication_year,
        b.genre
       FROM book_clubs bc
       JOIN books b ON bc.book_id = b.id
       WHERE bc.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Club not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({ error: 'Failed to fetch club' });
  }
});

module.exports = router;
