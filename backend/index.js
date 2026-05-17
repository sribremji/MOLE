require('dotenv').config();

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { setupSocketHandlers } = require('./src/socketHandlers');

const app = express();
const httpServer = createServer(app);

// Allow all origins — safe for a game with no auth/cookies
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  // Start with polling so Render's proxy doesn't block the handshake,
  // then upgrade to WebSocket automatically
  transports: ['polling', 'websocket'],
});

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.json({ status: 'ok', game: 'The Mole' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`The Mole server listening on http://0.0.0.0:${PORT}`);
});
