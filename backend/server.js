const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const booksRouter = require('./routes/books');
console.log('📚 Books routes loaded');

const clubsRouter = require('./routes/clubs');
console.log('📖 Clubs routes loaded');

const messagesRouter = require('./routes/messages');
console.log('💬 Messages routes loaded');

const usersRouter = require('./routes/users');
console.log('👤 Users routes loaded');

const mindmapsRouter = require('./routes/mindmaps');
console.log('🧠 Mindmaps routes loaded');

const adminRouter = require('./routes/admin');
console.log('📊 Admin routes loaded');

const readingProgressRouter = require('./routes/readingProgress');
console.log('📖 Reading progress routes loaded');

// Use routes
app.use('/api/books', booksRouter);
console.log('📚 Books routes registered');

app.use('/api/clubs', clubsRouter);
console.log('📖 Clubs routes registered');

app.use('/api/messages', messagesRouter);
console.log('💬 Messages routes registered');

app.use('/api/users', usersRouter);
console.log('👤 Users routes registered');

app.use('/api/mindmaps', mindmapsRouter);
console.log('🧠 Mindmaps routes registered');

app.use('/api/admin', adminRouter);
console.log('📊 Admin routes registered');

app.use('/api/reading-progress', readingProgressRouter);
console.log('📖 Reading progress routes registered');

// Direct test route for messages
app.get('/api/messages-test', (req, res) => {
  res.json({ message: 'Direct messages test works!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BooKlub API is running' });
});

// Test users route directly
app.get('/api/users-test', (req, res) => {
  res.json({ message: 'Users test works!' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`BooKlub backend running on http://localhost:${PORT}`);
});