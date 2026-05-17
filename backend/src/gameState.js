const rooms = new Map();

function createRoom(roomCode, hostId, hostName) {
  const room = {
    code: roomCode,
    hostId,
    players: [{ id: hostId, name: hostName, isHost: true }],
    phase: 'lobby', // lobby | secret | clue | voting | result
    word: null,
    moleHint: null,
    moleId: null,
    clues: [],
    votes: {},
    clueOrder: [],
    currentClueIndex: 0,
    currentCycle: 1,
    totalCycles: 3,
  };
  rooms.set(roomCode, room);
  return room;
}

function getRoom(roomCode) {
  return rooms.get(roomCode);
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function removePlayer(roomCode, playerId) {
  const room = rooms.get(roomCode);
  if (!room) return null;

  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    rooms.delete(roomCode);
    return null;
  }

  // Transfer host if needed
  if (room.hostId === playerId) {
    room.players[0].isHost = true;
    room.hostId = room.players[0].id;
  }

  return room;
}

function sanitizeRoom(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    players: room.players,
    phase: room.phase,
    clues: room.clues,
    clueOrder: room.clueOrder,
    currentClueIndex: room.currentClueIndex,
    currentCycle: room.currentCycle,
    totalCycles: room.totalCycles,
    votedCount: Object.keys(room.votes).length,
  };
}

module.exports = { createRoom, getRoom, generateRoomCode, removePlayer, sanitizeRoom };
