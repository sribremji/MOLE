import { useState, useEffect } from 'react';
import { socket } from './socket';
import Home from './components/Home';
import Lobby from './components/Lobby';
import SecretCard from './components/SecretCard';
import ClueRound from './components/ClueRound';
import VotingRound from './components/VotingRound';
import ResultScreen from './components/ResultScreen';

export default function App() {
  const [phase, setPhase] = useState('home');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [room, setRoom] = useState(null);
  const [gameSecret, setGameSecret] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [clues, setClues] = useState([]);
  const [currentCluePlayerId, setCurrentCluePlayerId] = useState(null);
  const [votedCount, setVotedCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [notification, setNotification] = useState('');
  const [connected, setConnected] = useState(false);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const resetGameState = () => {
    setGameSecret(null);
    setGameResult(null);
    setClues([]);
    setVotedCount(0);
    setTotalPlayers(0);
    setCurrentCluePlayerId(null);
  };

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('room_updated', ({ room }) => setRoom(room));

    // Fired on first start AND on play_again — reset all prior game state
    socket.on('game_started', ({ isMole, word, hint }) => {
      resetGameState();
      setGameSecret({ isMole, word, hint });
      setPhase('secret');
    });

    socket.on('cycle_started', ({ room, currentPlayerId }) => {
      setRoom(room);
      setClues(room.clues);
      setCurrentCluePlayerId(currentPlayerId);
      setPhase('clue');
    });

    socket.on('clue_submitted', ({ room, clues, currentPlayerId }) => {
      setRoom(room);
      setClues(clues);
      setCurrentCluePlayerId(currentPlayerId);
    });

    // clues intentionally NOT sent here — hidden until result screen
    socket.on('voting_phase_started', ({ room }) => {
      setRoom(room);
      setVotedCount(0);
      setTotalPlayers(room.players.filter((p) => p.id !== room.hostId).length); // placeholder; overwritten by vote_updated
      setPhase('voting');
    });

    socket.on('vote_updated', ({ votedCount, totalVoters }) => {
      setVotedCount(votedCount);
      setTotalPlayers(totalVoters);
    });

    socket.on('game_result', (result) => {
      setGameResult(result);
      setPhase('result');
    });

    // Fired when too few players remain mid-game
    socket.on('return_to_lobby', () => {
      resetGameState();
      setPhase('lobby');
    });

    socket.on('player_left', ({ playerName, room }) => {
      setRoom(room);
      notify(`${playerName} left the game`);
    });

    socket.on('connect_error', () => notify('Cannot reach server — check your connection'));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room_updated');
      socket.off('game_started');
      socket.off('cycle_started');
      socket.off('clue_submitted');
      socket.off('voting_phase_started');
      socket.off('vote_updated');
      socket.off('game_result');
      socket.off('return_to_lobby');
      socket.off('player_left');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  const handleCreateRoom = (name) => {
    setPlayerName(name);
    socket.emit('create_room', { playerName: name }, ({ success, roomCode, room }) => {
      if (success) {
        setRoomCode(roomCode);
        setRoom(room);
        setPhase('lobby');
      }
    });
  };

  const handleJoinRoom = (name, code) => {
    setPlayerName(name);
    socket.emit('join_room', { playerName: name, roomCode: code }, ({ success, roomCode, room, error }) => {
      if (success) {
        setRoomCode(roomCode);
        setRoom(room);
        setPhase('lobby');
      } else {
        alert(error || 'Failed to join room');
      }
    });
  };

  const handleStartClues = () => {
    socket.emit('ready_for_clues', {});
  };

  const handleLeaveRoom = () => {
    socket.emit('leave_room', {}, () => {
      resetGameState();
      setRoom(null);
      setRoomCode('');
      setPlayerName('');
      setPhase('home');
    });
  };

  const socketId = socket.id;
  const isHost = room?.hostId === socketId;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Connection status pill */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-full px-3 py-1.5 text-xs font-medium">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
        <span className={connected ? 'text-gray-400' : 'text-red-400'}>
          {connected ? 'Connected' : 'Connecting…'}
        </span>
      </div>

      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 border border-gray-700 text-white px-6 py-3 rounded-full shadow-xl text-sm font-medium animate-fade-in">
          {notification}
        </div>
      )}

      {phase === 'home' && (
        <Home onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} connected={connected} />
      )}
      {phase === 'lobby' && (
        <Lobby room={room} roomCode={roomCode} socketId={socketId} onLeave={handleLeaveRoom} />
      )}
      {phase === 'secret' && (
        <SecretCard
          isMole={gameSecret?.isMole}
          word={gameSecret?.word}
          hint={gameSecret?.hint}
          isHost={isHost}
          onStartClues={handleStartClues}
        />
      )}
      {phase === 'clue' && (
        <ClueRound
          room={room}
          clues={clues}
          currentCluePlayerId={currentCluePlayerId}
          socketId={socketId}
          isMole={gameSecret?.isMole}
          word={gameSecret?.word}
          hint={gameSecret?.hint}
        />
      )}
      {phase === 'voting' && (
        <VotingRound
          room={room}
          socketId={socketId}
          isMole={gameSecret?.isMole}
          votedCount={votedCount}
          totalPlayers={totalPlayers}
        />
      )}
      {phase === 'result' && (
        <ResultScreen
          result={gameResult}
          socketId={socketId}
          isHost={isHost}
          onLeave={handleLeaveRoom}
        />
      )}
    </div>
  );
}
