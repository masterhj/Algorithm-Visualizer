'use strict';

const mysql = require('mysql2/promise');

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS runs (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    mode        VARCHAR(16)  NOT NULL,
    algorithm   VARCHAR(32)  NOT NULL,
    size        INT          NOT NULL DEFAULT 0,
    comparisons INT          NOT NULL DEFAULT 0,
    writes      INT          NOT NULL DEFAULT 0,
    elapsed     FLOAT        NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_algorithm (algorithm),
    INDEX idx_created (created_at)
  )`;

let pool = null;

async function init() {
  const candidate = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'algorithm_visualizer',
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 4000
  });

  try {
    const conn = await candidate.getConnection();
    try {
      await conn.execute(SCHEMA);
    } finally {
      conn.release();
    }
    pool = candidate;
    console.log('mysql connected');
  } catch (err) {
    await candidate.end().catch(() => {});
    console.warn('mysql unavailable (%s) — run history will not be kept', err.code || err.message);
  }
}

const online = () => pool !== null;

// Every caller goes through here, so a failing query can never leak the
// connection back out of the pool.
async function query(sql, params = []) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(sql, params);
    return rows;
  } finally {
    conn.release();
  }
}

async function close() {
  if (pool) await pool.end();
  pool = null;
}

module.exports = { init, online, query, close };
