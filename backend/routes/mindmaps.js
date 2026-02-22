const express = require('express');
const router = express.Router();
const pool = require('../db');
const Anthropic = require('@anthropic-ai/sdk');
const logApiUsage = require('../utils/logApiUsage');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Ensure mind_maps table exists (reused for topic data — map_data is flexible JSONB)
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

// Generate topic analysis for a club's discussion (Sprint 4: replaces mind map)
router.post('/:clubId/generate', async (req, res) => {
  const clubId = req.params.clubId;
  const userId = req.body.userId;

  console.log('=== Topic Explorer Generation Request ===');
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

    // 2. Get book info for richer analysis
    const clubResult = await pool.query(
      `SELECT bc.name as club_name, b.title, b.author
       FROM book_clubs bc
       JOIN books b ON bc.book_id = b.id
       WHERE bc.id = $1`,
      [clubId]
    );

    const clubInfo = clubResult.rows[0];

    // 3. Format messages for Claude
    const conversationText = messages.map((msg) => {
      const sender = msg.sender_type === 'ai'
        ? msg.sender_ai_name
        : msg.user_name;
      return `[Message ${msg.id}] ${sender}: ${msg.content}`;
    }).join('\n\n');

    console.log('Sending to Claude API for topic analysis...');

    // 4. Send to Claude for topic extraction
    const systemPrompt = `You are analyzing a book club discussion about "${clubInfo?.title || 'a book'}" by ${clubInfo?.author || 'an author'} to extract discussion topics.

Given a series of messages from a book club conversation, identify the main topics and themes being discussed. For each topic, provide:
1. A clear, concise topic name
2. A brief summary of what was discussed about this topic
3. The type of discussion (theme, character, plot, symbolism, personal, question)
4. Key quotes from the conversation that relate to this topic (include message IDs)
5. Which participants contributed to the discussion of this topic

ALSO: Based on the themes and topics discussed in this conversation, recommend 3-5 books that the club members might enjoy. These should be books related to the themes, style, or subject matter they've been discussing.

Return your analysis as JSON with this exact structure:

{
  "bookTitle": "The book being discussed",
  "bookAuthor": "The author",
  "topicCount": 5,
  "topics": [
    {
      "id": "topic_1",
      "name": "Topic name (clear and concise, max 60 chars)",
      "type": "theme|character|plot|symbolism|personal|question",
      "summary": "2-3 sentence summary of what was discussed about this topic",
      "participants": ["Alice", "Bob"],
      "quotes": [
        {
          "text": "The exact or closely paraphrased quote from the message",
          "speaker": "Alice",
          "messageId": "uuid-here"
        }
      ],
      "messageCount": 3
    }
  ],
  "recommendations": [
    {
      "title": "Book title",
      "author": "Author name",
      "reason": "A 1-2 sentence explanation of why this book connects to what the club has been discussing"
    }
  ]
}

Rules:
- Identify 3-8 topics depending on conversation length
- For short conversations (<10 messages), return 2-4 topics
- For longer conversations, return 5-8 topics
- Order topics by how much they were discussed (most discussed first)
- Use actual participant names from the messages
- Include 1-3 key quotes per topic (the most insightful or representative ones)
- Keep topic names clear and readable — these will be displayed as a list
- Type definitions:
  - "theme": Major thematic discussion (e.g., "The American Dream")
  - "character": Discussion about a specific character
  - "plot": Discussion about plot events or structure
  - "symbolism": Discussion about symbols, metaphors, literary devices
  - "personal": Personal reflections or connections to real life
  - "question": Open questions the group raised but didn't fully resolve
- Include the message IDs from the original messages in quotes so we can link back
- For recommendations:
  - Recommend 3-5 books that relate to the THEMES and INTERESTS shown in the discussion
  - Do NOT recommend the book currently being discussed
  - Include a mix of well-known and lesser-known titles
  - The "reason" should directly connect to specific topics or interests from THIS conversation

Only return valid JSON, no additional text.`;

    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze this book club discussion and extract the main topics:\n\n${conversationText}`
        }
      ]
    });

    console.log('Received Claude response');

    // Log API usage for cost tracking
    await logApiUsage({
      feature: 'topic_explorer',
      clubId,
      model: 'claude-sonnet-4-20250514',
      inputTokens: claudeResponse.usage?.input_tokens || 0,
      outputTokens: claudeResponse.usage?.output_tokens || 0,
    });

    // 5. Parse Claude's response (strip markdown code fences if present)
    let responseText = claudeResponse.content[0].text;
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const topicData = JSON.parse(responseText);
    console.log('Parsed topic data:', topicData.topics?.length, 'topics');

    // 6. Save to database (reusing mind_maps table — map_data is JSONB so it's flexible)
    const insertResult = await pool.query(
      `INSERT INTO mind_maps (club_id, message_count, map_data, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [clubId, messages.length, JSON.stringify(topicData), userId]
    );

    const saved = insertResult.rows[0];
    console.log('Saved to database, ID:', saved.id);

    res.json({
      id: saved.id,
      clubId: saved.club_id,
      generatedAt: saved.generated_at,
      messageCount: saved.message_count,
      topicData: saved.map_data
    });

  } catch (error) {
    console.error('Error generating topics:', error);
    res.status(500).json({
      error: 'Failed to generate topics',
      details: error.message
    });
  }
});

// Get existing topic analyses for a club
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
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

module.exports = router;
