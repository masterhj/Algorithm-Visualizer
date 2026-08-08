'use strict';

const express = require('express');
const db = require('../config/db');

const router = express.Router();

const MODES = new Set(['sort', 'search', 'path']);
const ALGORITHM = /^[a-z]{2,20}$/;

function count(value, cap) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.round(n), cap) : 0;
}

router.get('/health', (req, res) => {
  res.json({ ok: true, database: db.online() ? 'connected' : 'offline' });
});

router.post('/runs', async (req, res, next) => {
  const { mode, algorithm } = req.body || {};

  if (!MODES.has(mode)) return res.status(400).json({ error: 'unknown mode' });
  if (typeof algorithm !== 'string' || !ALGORITHM.test(algorithm)) {
    return res.status(400).json({ error: 'unknown algorithm' });
  }

  // Without a database the run is simply not kept; that is not a client error.
  if (!db.online()) return res.status(202).json({ persisted: false });

  try {
    const result = await db.query(
      `INSERT INTO runs (mode, algorithm, size, comparisons, writes, elapsed)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        mode,
        algorithm,
        count(req.body.size, 100000),
        count(req.body.comparisons, 100000000),
        count(req.body.writes, 100000000),
        Math.min(Number(req.body.elapsed) || 0, 86400)
      ]
    );
    res.status(201).json({ persisted: true, id: result.insertId });
  } catch (err) {
    next(err);
  }
});

router.get('/runs', async (req, res, next) => {
  if (!db.online()) return res.json([]);
  try {
    // Clamped to an integer here, so it is safe to inline — prepared statements
    // refuse a placeholder in LIMIT.
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200) | 0;
    const rows = req.query.algorithm && ALGORITHM.test(req.query.algorithm)
      ? await db.query(`SELECT * FROM runs WHERE algorithm = ? ORDER BY id DESC LIMIT ${limit}`,
                       [req.query.algorithm])
      : await db.query(`SELECT * FROM runs ORDER BY id DESC LIMIT ${limit}`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/stats', async (req, res, next) => {
  if (!db.online()) return res.json([]);
  try {
    res.json(await db.query(
      `SELECT algorithm, mode,
              COUNT(*)         AS runs,
              ROUND(AVG(comparisons)) AS avg_comparisons,
              ROUND(AVG(writes))      AS avg_writes,
              MIN(elapsed)     AS best,
              MAX(elapsed)     AS worst
       FROM runs
       GROUP BY algorithm, mode
       ORDER BY runs DESC`
    ));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
