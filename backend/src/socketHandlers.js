const { createRoom, getRoom, generateRoomCode, removePlayer, sanitizeRoom } = require('./gameState');
const { getRandomWord } = require('./wordService');

function startNewGame(room, totalCycles) {
  const entry = getRandomWord(); // { word, hint }
  room.word = entry.word;
  room.moleHint = entry.hint;
  room.moleId = room.players[Math.floor(Math.random() * room.players.length)].id;
  room.phase = 'secret';
  room.clues = [];
  room.votes = {};
  room.clueOrder = [...room.players.map((p) => p.id)].sort(() => Math.random() - 0.5);
  room.currentClueIndex = 0;
  room.currentCycle = 1;
  if (totalCycles !== undefined) {
    room.totalCycles = Math.min(Math.max(parseInt(totalCycles) || 3, 1), 10);
  }
}

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

      startNewGame(room, totalCycles);

      // Send personalised secret to each player
      room.players.forEach((player) => {
        const isMole = player.id === room.moleId;
        io.to(player.id).emit('game_started', {
          isMole,
          word: isMole ? null : room.word,
          hint: isMole ? room.moleHint : null,
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
      const word = (clue || '').trim().split(/\s+/)[0];
      if (!word) return callback?.({ success: false, error: 'Empty clue' });

      // Duplicate check — case-insensitive, across all cycles
      const lower = word.toLowerCase();
      const duplicate = room.clues.find((c) => c.clue.toLowerCase() === lower);
      if (duplicate) {
        return callback?.({
          success: false,
          error: `"${duplicate.clue}" was already used by ${duplicate.playerName}. Try something else!`,
        });
      }

      room.clues.push({ playerId: socket.id, playerName: player.name, clue: word, cycle: room.currentCycle });
      room.currentClueIndex++;

      const cycleComplete = room.currentClueIndex >= room.clueOrder.length;

      if (cycleComplete) {
        if (room.currentCycle >= room.totalCycles) {
          room.phase = 'voting';
          io.to(roomCode).emit('voting_phase_started', {
            room: sanitizeRoom(room),
          });
        } else {
          room.currentCycle++;
          room.currentClueIndex = 0;
          room.clueOrder = [...room.players.map((p) => p.id)].sort(() => Math.random() - 0.5);
          const nextPlayerId = room.clueOrder[0];
          io.to(roomCode).emit('cycle_started', {
            room: sanitizeRoom(room),
            currentPlayerId: nextPlayerId,
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
      // Mole is not allowed to vote
      if (socket.id === room.moleId) return callback?.({ success: false, error: 'Mole cannot vote' });
      if (targetId === socket.id) return callback?.({ success: false, error: 'Cannot vote for yourself' });
      if (!room.players.find((p) => p.id === targetId)) return callback?.({ success: false, error: 'Invalid target' });

      room.votes[socket.id] = targetId;

      // Only non-mole players are required to vote
      const requiredVoters = room.players.filter((p) => p.id !== room.moleId).length;
      const votedCount = Object.keys(room.votes).length;

      io.to(roomCode).emit('vote_updated', { votedCount, totalVoters: requiredVoters });

      if (votedCount >= requiredVoters) {
        // Build tally (for display)
        const tally = {};
        Object.values(room.votes).forEach((id) => {
          tally[id] = (tally[id] || 0) + 1;
        });

        // Players who correctly identified the Mole
        const correctVoterIds = Object.entries(room.votes)
          .filter(([, targetId]) => targetId === room.moleId)
          .map(([voterId]) => voterId);

        // Win condition: at least ONE correct vote
        const moleFound = correctVoterIds.length > 0;

        // Most-voted player (for display only)
        const maxVotes = Math.max(...Object.values(tally), 0);
        const topCandidates = Object.keys(tally).filter((id) => tally[id] === maxVotes);
        const eliminated = topCandidates.length === 1 ? topCandidates[0] : null;

        const mole = room.players.find((p) => p.id === room.moleId);
        room.phase = 'result';

        io.to(roomCode).emit('game_result', {
          moleFound,
          correctVoterIds,
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

      // totalCycles carries over — pass undefined so startNewGame skips overwriting it
      startNewGame(room, undefined);

      room.players.forEach((player) => {
        const isMole = player.id === room.moleId;
        io.to(player.id).emit('game_started', {
          isMole,
          word: isMole ? null : room.word,
          hint: isMole ? room.moleHint : null,
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
