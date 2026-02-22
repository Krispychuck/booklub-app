const express = require('express');
const router = express.Router();
const pool = require('../db');
const Anthropic = require('@anthropic-ai/sdk');
const logApiUsage = require('../utils/logApiUsage');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Messages routes working!' });
});

// GET all messages for a club
router.get('/club/:clubId', async (req, res) => {
  try {
    const { clubId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        m.id,
        m.club_id,
        m.sender_type,
        m.sender_user_id,
        m.sender_ai_name,
        m.content,
        m.created_at,
        u.name as sender_name
      FROM messages m
      LEFT JOIN users u ON m.sender_user_id = u.id
      WHERE m.club_id = $1
      ORDER BY m.created_at ASC`,
      [clubId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET new messages since a given message ID (for polling)
router.get('/club/:clubId/since/:lastMessageId', async (req, res) => {
  try {
    const { clubId, lastMessageId } = req.params;

    const result = await pool.query(
      `SELECT
        m.id,
        m.club_id,
        m.sender_type,
        m.sender_user_id,
        m.sender_ai_name,
        m.content,
        m.created_at,
        u.name as sender_name
      FROM messages m
      LEFT JOIN users u ON m.sender_user_id = u.id
      WHERE m.club_id = $1 AND m.id > $2
      ORDER BY m.created_at ASC`,
      [clubId, lastMessageId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching new messages:', error);
    res.status(500).json({ error: 'Failed to fetch new messages' });
  }
});

// POST a new message
router.post('/club/:clubId', async (req, res) => {
  try {
    const { clubId } = req.params;
    const { content, senderType, senderUserId, senderAiName } = req.body;
    
    const result = await pool.query(
      `INSERT INTO messages (club_id, sender_type, sender_user_id, sender_ai_name, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [clubId, senderType, senderUserId || null, senderAiName || null, content]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// POST generate AI author response
router.post('/club/:clubId/ai-response', async (req, res) => {
  try {
    const { clubId } = req.params;

    // Get club and book info
    const clubResult = await pool.query(
      `SELECT bc.*, b.title, b.author, b.ai_author_prompt, b.publication_year
       FROM book_clubs bc
       JOIN books b ON bc.book_id = b.id
       WHERE bc.id = $1`,
      [clubId]
    );

    if (clubResult.rows.length === 0) {
      return res.status(404).json({ error: 'Club not found' });
    }

    const club = clubResult.rows[0];
    const authorName = club.author;
    const bookTitle = club.title;

    // Get club members so the AI knows who's in the conversation
    const membersResult = await pool.query(
      `SELECT u.name FROM club_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.club_id = $1`,
      [clubId]
    );
    const memberNames = membersResult.rows.map(m => m.name).filter(Boolean);

    // Get reading progress for spoiler guard (Sprint 6)
    let spoilerGuardSection = '';
    try {
      const progressResult = await pool.query(
        `SELECT rp.progress_value, rp.progress_label, u.name
         FROM reading_progress rp
         JOIN users u ON rp.user_id = u.id
         WHERE rp.club_id = $1`,
        [clubId]
      );
      if (progressResult.rows.length > 0) {
        const progressLines = progressResult.rows.map(p => {
          const label = p.progress_label ? ` (${p.progress_label})` : '';
          return `  - ${p.name}: ${p.progress_value}% through the book${label}`;
        });
        spoilerGuardSection = `\n=== SPOILER GUARD (CRITICAL) ===
The following club members have shared how far they are in the book:
${progressLines.join('\n')}

IMPORTANT RULES:
- NEVER discuss plot events, character developments, twists, or revelations that happen BEYOND where a member has read.
- If a member asks about something later in the book, gently deflect: "I don't want to spoil anything — keep reading and we can discuss that when you get there!"
- If members are at different points, be careful to only discuss content that ALL participating members have reached.
- You may discuss general themes and craft in a spoiler-free way regardless of progress.
- If a member has not set their progress, assume they may not have finished and err on the side of caution.
`;
      }
    } catch (progressError) {
      console.error('Error fetching reading progress for AI prompt:', progressError.message);
    }

    // Get recent messages for context (last 20 — increased from 10 for better multi-user awareness)
    const messagesResult = await pool.query(
      `SELECT m.sender_type, m.sender_ai_name, m.content, u.name as sender_name
       FROM messages m
       LEFT JOIN users u ON m.sender_user_id = u.id
       WHERE m.club_id = $1
       ORDER BY m.created_at DESC
       LIMIT 20`,
      [clubId]
    );

    // Reverse to get chronological order
    const recentMessages = messagesResult.rows.reverse();

    // Build conversation history — include sender names so AI knows who's talking
    const conversationHistory = recentMessages.map(msg => ({
      role: msg.sender_type === 'ai' ? 'assistant' : 'user',
      content: msg.sender_type === 'ai'
        ? msg.content
        : `[${msg.sender_name || 'A reader'}]: ${msg.content}`
    }));

    // Build the per-book author persona prompt (from DB or fallback)
    const authorPersonaPrompt = club.ai_author_prompt ||
      `You are ${authorName}, the author of "${bookTitle}" (${club.publication_year}).
Stay in character as ${authorName}. Speak from your perspective as the author who wrote this work.
Share insights about your creative process, the themes you explored, your characters' motivations,
and the historical/cultural context of when you wrote the book.`;

    // Build the full system prompt: Booklub context wrapper + per-book author persona
    const memberList = memberNames.length > 0
      ? `The current members of this club are: ${memberNames.join(', ')}.`
      : 'The club members are readers discussing your book.';

    const systemPrompt = `=== CONTEXT: ABOUT BOOKLUB ===
You are participating in Booklub, a social book club app where readers form private clubs to discuss books together. Your role is to serve as an AI representation of the author — a knowledgeable, engaging discussion partner who helps readers explore the book more deeply.

=== YOUR ROLE ===
- You are the AI author persona for this book club. You represent ${authorName}'s perspective and voice.
- This is a GROUP book club called "${club.name}". Multiple real people may be chatting with you and with each other.
- ${memberList}
- Messages from club members are prefixed with their name in brackets, like [Sarah]: or [Mike]:. Address members by name when responding to create a warm, personal book club atmosphere.
- Some messages in the conversation are "Group Comments" — messages between club members that were NOT directed at you. You may see these for context, but they are part of the natural club conversation. Don't be confused by them; simply be aware of what members are discussing with each other.
- Keep responses conversational and around 2-3 paragraphs unless a longer response is warranted.
- Be warm, engaging, and intellectually stimulating. Encourage discussion among club members, not just Q&A with you.
- Feel free to ask members questions about their interpretations or what drew them to the work.

=== AUTHOR PERSONA ===
${authorPersonaPrompt}
${spoilerGuardSection}`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversationHistory
    });
    
    const aiContent = response.content[0].text;

    // Log API usage for cost tracking
    await logApiUsage({
      feature: 'author_response',
      clubId,
      model: 'claude-sonnet-4-20250514',
      inputTokens: response.usage?.input_tokens || 0,
      outputTokens: response.usage?.output_tokens || 0,
    });

    // Save AI response to database
    const savedMessage = await pool.query(
      `INSERT INTO messages (club_id, sender_type, sender_ai_name, content, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        clubId,
        'ai',
        authorName,
        aiContent,
        JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          input_tokens: response.usage?.input_tokens,
          output_tokens: response.usage?.output_tokens
        })
      ]
    );
    
    res.status(201).json(savedMessage.rows[0]);
    
  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});
// DELETE a message
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM messages WHERE id = $1 RETURNING *',
      [messageId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});
module.exports = router;