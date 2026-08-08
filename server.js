'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');
const db = require('./config/db');

const app = express();
const port = Number(process.env.PORT) || 3001;

app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

// Only public/ is reachable over HTTP — server sources and .env sit outside it.
// No max-age: ETags still spare the bytes, without pinning a stale index.html.
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', require('./routes/api'));

app.use('/api', (req, res) => res.status(404).json({ error: 'no such endpoint' }));

app.use((err, req, res, next) => {
  // A body express could not parse is the caller's problem, not ours.
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
    return res.status(400).json({ error: 'bad request body' });
  }
  console.error(err);
  res.status(500).json({ error: 'internal error' });
});

db.init().then(() => {
  const server = app.listen(port, () => {
    console.log('listening on http://localhost:' + port);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(() => db.close().then(() => process.exit(0)));
    });
  }
});
