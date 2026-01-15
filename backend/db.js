// Import PostgreSQL client
const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

// Export for use in other files
module.exports = {
  query: (text, params) => pool.query(text, params)
};