const express = require('express');
const router = express.Router();
const pool = require('../db');
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Ensure mind_maps table exists
let tableReady = false;
async function ensureMindMapsTable() {
  if (tableReady) return;
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mind_maps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        club_id UUID NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
        generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        message_count INTEGER NOT NULL,
        map_data JSONB NOT NULL,
        created_by VARCHAR(255) NOT NULL
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_mind_maps_club_id ON mind_maps(club_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_mind_maps_created_by ON mind_maps(created_by)');
    tableReady = true;
    console.log('✅ mind_maps table ready');
  } catch (err) {
    console.error('❌ Error ensuring mind_maps table:', err.message);
    throw err;
  }
}

// Generate mind map for a club's discussion
router.post('/:clubId/generate', async (req, res) => {
  const clubId = req.params.clubId;
  const userId = req.body.userId;

  console.log('=== Mind Map Generation Request ===');
  console.log('Club ID:', clubId);
  console.log('User ID:', userId);

  try {
    // Ensure table exists before any DB operations
    await ensureMindMapsTable();
    // 1. Fetch all messages for this club
    const messagesResult = await pool.query(
      `SELECT 
        m.id,
        m.content,
        m.sender_type,
        m.sender_ai_name,
        u.name as user_name,
        m.created_at
      FROM messages m
      LEFT JOIN users u ON m.sender_user_id = u.id
      WHERE m.club_id = $1
      ORDER BY m.created_at ASC`,
      [clubId]
    );

    const messages = messagesResult.rows;
    console.log('Found messages:', messages.length);

    if (messages.length === 0) {
      return res.status(400).json({ error: 'No messages to analyze' });
    }

    // 3. Format messages for Claude
    const conversationText = messages.map((msg) => {
      const sender = msg.sender_type === 'ai' 
        ? msg.sender_ai_name 
        : msg.user_name;
      return `[Message ${msg.id}] ${sender}: ${msg.content}`;
    }).join('\n\n');

    console.log('Sending to Claude API...');

    // 4. Send to Claude for analysis
    const systemPrompt = `You are analyzing a book club discussion to create a mind map visualization.

Given a series of messages from a book club discussion, identify:
1. The central theme or question being discussed
2. Major topics/subtopics that branch from the central theme
3. Supporting arguments, counterpoints, and revelations
4. Which participants contributed to each node

Return your analysis as JSON with this exact structure:

{
  "centralTheme": "One sentence describing the main discussion theme",
  "nodes": [
    {
      "id": "unique_id",
      "label": "Topic name (max 50 chars)",
      "type": "theme|supporting|counterpoint|revelation|question",
      "participants": ["Alice", "F. Scott Fitzgerald"],
      "messageIds": [1, 3, 5],
      "children": []
    }
  ]
}

Rules:
- Maximum 3 levels deep
- Aim for 5-8 main nodes, each with 2-4 children
- If discussion is very short (<10 messages), return fewer nodes
- Use actual participant names from the messages
- Keep labels concise but meaningful
- Type definitions:
  - "theme": Major discussion topic
  - "supporting": Evidence or agreement
  - "counterpoint": Disagreement or alternative view
  - "revelation": New insight or discovery
  - "question": Open question raised

Only return valid JSON, no additional text.`;

    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze this book club discussion and create a mind map:\n\n${conversationText}`
        }
      ]
    });

    console.log('Received Claude response');

// 5. Parse Claude's response (strip markdown code fences if present)
    let responseText = claudeResponse.content[0].text;
    
    // Remove markdown code fences if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const mindMapData = JSON.parse(responseText);
    console.log('Parsed mind map data');

    // 6. Save to database
    const insertResult = await pool.query(
      `INSERT INTO mind_maps (club_id, message_count, map_data, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [clubId, messages.length, JSON.stringify(mindMapData), userId]
    );

    const savedMindMap = insertResult.rows[0];
    console.log('Saved to database, ID:', savedMindMap.id);

    res.json({
      id: savedMindMap.id,
      clubId: savedMindMap.club_id,
      generatedAt: savedMindMap.generated_at,
      messageCount: savedMindMap.message_count,
      mapData: savedMindMap.map_data
    });

  } catch (error) {
    console.error('Error generating mind map:', error);
    res.status(500).json({ 
      error: 'Failed to generate mind map',
      details: error.message 
    });
  }
});

// Get existing mind maps for a club
router.get('/:clubId', async (req, res) => {
  const clubId = req.params.clubId;

  try {
    const result = await pool.query(
      `SELECT 
        mm.*,
        u.name as creator_name
      FROM mind_maps mm
      LEFT JOIN users u ON mm.created_by = u.id
      WHERE mm.club_id = $1
      ORDER BY mm.generated_at DESC`,
      [clubId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching mind maps:', error);
    res.status(500).json({ error: 'Failed to fetch mind maps' });
  }
});

module.exports = router;