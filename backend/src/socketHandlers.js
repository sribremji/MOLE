const { createRoom, getRoom, generateRoomCode, removePlayer, sanitizeRoom } = require('./gameState');
const { getRandomWord } = require('./words');

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`+ connected: ${socket.id}`);

    socket.on('create_room', ({ playerName }, callback) => {
      const roomCode = generateRoomCode();
      const room = createRoom(roomCode, socket.id, playerName);
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.playerName = playerName;
      callback({ success: true, roomCode, room: sanitizeRoom(room) });
    });

    socket.on('join_room', ({ roomCode, playerName }, callback) => {
      const code = (roomCode || '').toUpperCase().trim();
      const room = getRoom(code);

      if (!room) return callback({ success: false, error: 'Room not found' });
      if (room.phase !== 'lobby') return callback({ success: false, error: 'Game already in progress' });
      if (room.players.length >= 10) return callback({ success: false, error: 'Room is full' });
      if (!playerName || !playerName.trim()) return callback({ success: false, error: 'Enter a name' });

      room.players.push({ id: socket.id, name: playerName.trim(), isHost: false });
      socket.join(code);
      socket.data.roomCode = code;
      socket.data.playerName = playerName.trim();

      io.to(code).emit('room_updated', { room: sanitizeRoom(room) });
      callback({ success: true, roomCode: code, room: sanitizeRoom(room) });
    });

    socket.on('start_game', ({ totalCycles } = {}, callback) => {
      const roomCode = socket.data.roomCode;
      const room = getRoom(roomCode);

      if (!room) return callback?.({ success: false, error: 'Room not found' });
      if (room.hostId !== socket.id) return callback?.({ success: false, error: 'Only the host can start' });
      if (room.players.length < 3) return callback?.({ success: false, error: 'Need at least 3 players' });

      // Reset and set up new round
      room.word = getRandomWord();
      room.moleId = room.players[Math.floor(Math.random() * room.players.length)].id;
      room.phase = 'secret';
      room.clues = [];
      room.votes = {};
      room.clueOrder = [...room.players.map((p) => p.id)].sort(() => Math.random() - 0.5);
      room.currentClueIndex = 0;
      room.currentCycle = 1;
      room.totalCycles = Math.min(Math.max(parseInt(totalCycles) || 3, 1), 10);

      // Send personalised secret to each player
      room.players.forEach((player) => {
        const isMole = player.id === room.moleId;
        io.to(player.id).emit('game_started', {
          isMole,
          word: isMole ? null : room.word,
        });
      });

      io.to(roomCode).emit('room_updated', { room: sanitizeRoom(room) });
      callback?.({ success: true });
    });

    socket.on('ready_for_clues', (_, callback) => {
      const roomCode = socket.data.roomCode;
      const room = getRoom(roomCode);

      if (!room) return callback?.({ success: false });
      if (room.hostId !== socket.id) return callback?.({ success: false, error: 'Only the host can do this' });

      room.phase = 'clue';
      const currentPlayerId = room.clueOrder[room.currentClueIndex];

      io.to(roomCode).emit('cycle_started', {
        room: sanitizeRoom(room),
        currentPlayerId,
      });
      callback?.({ success: true });
    });

    socket.on('submit_clue', ({ clue }, callback) => {
      const roomCode = socket.data.roomCode;
      const room = getRoom(roomCode);

      if (!room || room.phase !== 'clue') return callback?.({ success: false, error: 'Not in clue phase' });

      const currentPlayerId = room.clueOrder[room.currentClueIndex];
      if (socket.id !== currentPlayerId) return callback?.({ success: false, error: 'Not your turn' });

      const player = room.players.find((p) => p.id === socket.id);
      const word = (clue || '').trim().split(/\s+/)[0]; // enforce one word
      if (!word) return callback?.({ success: false, error: 'Empty clue' });

      room.clues.push({ playerId: socket.id, playerName: player.name, clue: word, cycle: room.currentCycle });
      room.currentClueIndex++;

      const cycleComplete = room.currentClueIndex >= room.clueOrder.length;

      if (cycleComplete) {
        if (room.currentCycle >= room.totalCycles) {
          // All cycles done → voting
          room.phase = 'voting';
          io.to(roomCode).emit('voting_phase_started', {
            room: sanitizeRoom(room),
            clues: room.clues,
          });
        } else {
          // Advance to next cycle with a fresh shuffled order
          room.currentCycle++;
          room.currentClueIndex = 0;
          room.clueOrder = [...room.players.map((p) => p.id)].sort(() => Math.random() - 0.5);
          const currentPlayerId = room.clueOrder[0];
          io.to(roomCode).emit('cycle_started', {
            room: sanitizeRoom(room),
            currentPlayerId,
          });
        }
      } else {
        const nextPlayerId = room.clueOrder[room.currentClueIndex];
        io.to(roomCode).emit('clue_submitted', {
          room: sanitizeRoom(room),
          clues: room.clues,
          currentPlayerId: nextPlayerId,
        });
      }

      callback?.({ success: true });
    });

    socket.on('submit_vote', ({ targetId }, callback) => {
      const roomCode = socket.data.roomCode;
      const room = getRoom(roomCode);

      if (!room || room.phase !== 'voting') return callback?.({ success: false, error: 'Not in voting phase' });
      if (targetId === socket.id) return callback?.({ success: false, error: 'Cannot vote for yourself' });
      if (!room.players.find((p) => p.id === targetId)) return callback?.({ success: false, error: 'Invalid target' });

      room.votes[socket.id] = targetId;

      const votedCount = Object.keys(room.votes).length;
      const totalPlayers = room.players.length;

      io.to(roomCode).emit('vote_updated', { votedCount, totalPlayers });

      if (votedCount >= totalPlayers) {
        // Tally
        const tally = {};
        Object.values(room.votes).forEach((id) => {
          tally[id] = (tally[id] || 0) + 1;
        });

        const maxVotes = Math.max(...Object.values(tally));
        const topCandidates = Object.keys(tally).filter((id) => tally[id] === maxVotes);
        // Tie = null (no one eliminated)
        const eliminated = topCandidates.length === 1 ? topCandidates[0] : null;
        const moleFound = eliminated === room.moleId;
        const mole = room.players.find((p) => p.id === room.moleId);

        room.phase = 'result';

        io.to(roomCode).emit('game_result', {
          moleFound,
          moleId: room.moleId,
          moleName: mole?.name,
          word: room.word,
          votes: room.votes,
          voteTally: tally,
          eliminated,
          players: room.players,
          clues: room.clues,
          totalCycles: room.totalCycles,
        });
      }

      callback?.({ success: true });
    });

    socket.on('play_again', (_, callback) => {
      const roomCode = socket.data.roomCode;
      const room = getRoom(roomCode);

      if (!room) return callback?.({ success: false, error: 'Room not found' });
      if (room.hostId !== socket.id) return callback?.({ success: false, error: 'Only the host can do this' });

      // Start a fresh game immediately — keep same players & cycle count
      room.word = getRandomWord();
      room.moleId = room.players[Math.floor(Math.random() * room.players.length)].id;
      room.phase = 'secret';
      room.clues = [];
      room.votes = {};
      room.clueOrder = [...room.players.map((p) => p.id)].sort(() => Math.random() - 0.5);
      room.currentClueIndex = 0;
      room.currentCycle = 1;
      // totalCycles carries over from the previous game

      // Send personalised secrets — same as start_game
      room.players.forEach((player) => {
        const isMole = player.id === room.moleId;
        io.to(player.id).emit('game_started', {
          isMole,
          word: isMole ? null : room.word,
        });
      });

      io.to(roomCode).emit('room_updated', { room: sanitizeRoom(room) });
      callback?.({ success: true });
    });

    socket.on('leave_room', (_, callback) => {
      const roomCode = socket.data.roomCode;
      if (!roomCode) return callback?.({ success: true });

      const room = removePlayer(roomCode, socket.id);
      socket.leave(roomCode);
      socket.data.roomCode = null;

      if (room) {
        io.to(roomCode).emit('player_left', {
          playerId: socket.id,
          playerName: socket.data.playerName,
          room: sanitizeRoom(room),
        });

        // Not enough players mid-game — reset remaining players to lobby
        if (room.phase !== 'lobby' && room.players.length < 2) {
          room.phase = 'lobby';
          io.to(roomCode).emit('room_updated', { room: sanitizeRoom(room) });
          io.to(roomCode).emit('return_to_lobby');
        }
      }

      callback?.({ success: true });
    });

    socket.on('disconnect', () => {
      const roomCode = socket.data.roomCode;
      if (!roomCode) return;

      const room = removePlayer(roomCode, socket.id);
      console.log(`- disconnected: ${socket.id} from ${roomCode}`);

      if (room) {
        io.to(roomCode).emit('player_left', {
          playerId: socket.id,
          playerName: socket.data.playerName,
          room: sanitizeRoom(room),
        });

        // Not enough players mid-game — reset to lobby
        if (room.phase !== 'lobby' && room.players.length < 2) {
          room.phase = 'lobby';
          io.to(roomCode).emit('room_updated', { room: sanitizeRoom(room) });
          io.to(roomCode).emit('return_to_lobby');
        }
      }
    });
  });
}

module.exports = { setupSocketHandlers };
