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
    
    // Get recent messages for context (last 10)
    const messagesResult = await pool.query(
      `SELECT sender_type, sender_ai_name, content 
       FROM messages 
       WHERE club_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [clubId]
    );
    
    // Reverse to get chronological order
    const recentMessages = messagesResult.rows.reverse();
    
    // Build conversation history for Claude
    const conversationHistory = recentMessages.map(msg => ({
      role: msg.sender_type === 'ai' ? 'assistant' : 'user',
      content: msg.content
    }));
    
    // Create system prompt for the author persona
    const systemPrompt = club.ai_author_prompt || 
      `You are ${authorName}, the author of "${bookTitle}". You are having a conversation with a reader about your book. 
      
      Stay in character as ${authorName}. Speak from your perspective as the author who wrote this work. 
      Share insights about your creative process, the themes you explored, your characters' motivations, 
      and the historical/cultural context of when you wrote the book.
      
      Be warm, engaging, and intellectually stimulating. Feel free to ask the reader questions about their 
      interpretation or what drew them to your work.
      
      Keep responses conversational and around 2-3 paragraphs unless a longer response is warranted.`;
    
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