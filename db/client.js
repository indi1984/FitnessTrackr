require('dotenv').config();

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://pi-ai:5432/fitness-dev';

const client = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

module.exports = client;
