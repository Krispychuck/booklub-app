-- BooKlub Database Initialization Script
-- For PostgreSQL (tested with Neon serverless Postgres)

-- Enable UUID extension (required for book_clubs.id)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  clerk_id VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- 2. BOOKS Table
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  publication_year INTEGER,
  ai_author_prompt TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. BOOK_CLUBS Table
CREATE TABLE IF NOT EXISTS book_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  book_id INTEGER NOT NULL,
  creator_user_id INTEGER NOT NULL,
  invite_code VARCHAR(6) NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_book_clubs_book_id FOREIGN KEY (book_id) REFERENCES books(id),
  CONSTRAINT fk_book_clubs_creator_user_id FOREIGN KEY (creator_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_book_clubs_invite_code ON book_clubs(invite_code);
CREATE INDEX IF NOT EXISTS idx_book_clubs_creator_user_id ON book_clubs(creator_user_id);

-- 4. CLUB_MEMBERS Table
CREATE TABLE IF NOT EXISTS club_members (
  id SERIAL PRIMARY KEY,
  club_id UUID NOT NULL,
  user_id INTEGER NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_club_members_club_id FOREIGN KEY (club_id) REFERENCES book_clubs(id) ON DELETE CASCADE,
  CONSTRAINT fk_club_members_user_id FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(club_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_members_user_id ON club_members(user_id);

-- 5. MESSAGES Table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  club_id UUID NOT NULL,
  sender_type VARCHAR(50) NOT NULL,
  sender_user_id INTEGER,
  sender_ai_name VARCHAR(255),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_messages_club_id FOREIGN KEY (club_id) REFERENCES book_clubs(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender_user_id FOREIGN KEY (sender_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_messages_club_id ON messages(club_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Insert sample books (Phase 5 currently has these 5 books)
INSERT INTO books (title, author, genre, publication_year, ai_author_prompt) VALUES
  ('Pride and Prejudice', 'Jane Austen', 'Romance', 1813, 'You are Jane Austen, author of Pride and Prejudice. Respond to questions about your novel with wit, elegance, and insight into social manners and marriage in Regency England.'),
  ('1984', 'George Orwell', 'Dystopian Fiction', 1949, 'You are George Orwell, author of 1984. Discuss your novel''s themes of totalitarianism, surveillance, propaganda, and the corruption of language with clarity and moral urgency.'),
  ('The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 1925, 'You are F. Scott Fitzgerald, author of The Great Gatsby. Share insights about the American Dream, wealth, love, and the Jazz Age with lyrical prose and critical observation.'),
  ('To Kill a Mockingbird', 'Harper Lee', 'Fiction', 1960, 'You are Harper Lee, author of To Kill a Mockingbird. Discuss themes of racial injustice, moral growth, and compassion in the American South with wisdom and humanity.'),
  ('The Catcher in the Rye', 'J.D. Salinger', 'Fiction', 1951, 'You are J.D. Salinger, author of The Catcher in the Rye. Respond to questions about Holden Caulfield, teenage alienation, and authenticity with empathy and psychological depth.')
ON CONFLICT DO NOTHING;

-- 6. API_USAGE Table (cost tracking for Anthropic API calls)
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
);

CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_feature ON api_usage(feature);

-- Verification queries (commented out - uncomment to test)
-- SELECT 'Users:' as table_name, COUNT(*) as count FROM users
-- UNION ALL SELECT 'Books:', COUNT(*) FROM books
-- UNION ALL SELECT 'Book Clubs:', COUNT(*) FROM book_clubs
-- UNION ALL SELECT 'Club Members:', COUNT(*) FROM club_members
-- UNION ALL SELECT 'Messages:', COUNT(*) FROM messages;
