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
  const [gameSecret, setGameSecret] = useState(null); // { isMole, word }
  const [gameResult, setGameResult] = useState(null);
  const [clues, setClues] = useState([]);
  const [currentCluePlayerId, setCurrentCluePlayerId] = useState(null);
  const [votedCount, setVotedCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [notification, setNotification] = useState('');

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  useEffect(() => {
    socket.connect();

    socket.on('room_updated', ({ room }) => setRoom(room));

    socket.on('game_started', ({ isMole, word }) => {
      setGameSecret({ isMole, word });
      setPhase('secret');
    });

    // Fires for cycle 1 (from ready_for_clues) and every subsequent cycle
    socket.on('cycle_started', ({ room, currentPlayerId }) => {
      setRoom(room);
      setClues(room.clues); // accumulates across cycles
      setCurrentCluePlayerId(currentPlayerId);
      setPhase('clue');
    });

    socket.on('clue_submitted', ({ room, clues, currentPlayerId }) => {
      setRoom(room);
      setClues(clues);
      setCurrentCluePlayerId(currentPlayerId);
    });

    socket.on('voting_phase_started', ({ room, clues }) => {
      setRoom(room);
      setClues(clues);
      setVotedCount(0);
      setTotalPlayers(room.players.length);
      setPhase('voting');
    });

    socket.on('vote_updated', ({ votedCount, totalPlayers }) => {
      setVotedCount(votedCount);
      setTotalPlayers(totalPlayers);
    });

    socket.on('game_result', (result) => {
      setGameResult(result);
      setPhase('result');
    });

    socket.on('return_to_lobby', () => {
      setGameSecret(null);
      setGameResult(null);
      setClues([]);
      setVotedCount(0);
      setPhase('lobby');
    });

    socket.on('player_left', ({ playerName, room }) => {
      setRoom(room);
      notify(`${playerName} left the game`);
    });

    socket.on('connect_error', () => notify('Connection error — retrying…'));

    return () => {
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

  const socketId = socket.id;
  const isHost = room?.hostId === socketId;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 border border-gray-700 text-white px-6 py-3 rounded-full shadow-xl text-sm font-medium animate-fade-in">
          {notification}
        </div>
      )}

      {phase === 'home' && (
        <Home onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
      )}
      {phase === 'lobby' && (
        <Lobby room={room} roomCode={roomCode} socketId={socketId} />
      )}
      {phase === 'secret' && (
        <SecretCard
          isMole={gameSecret?.isMole}
          word={gameSecret?.word}
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
        />
      )}
      {phase === 'voting' && (
        <VotingRound
          room={room}
          clues={clues}
          socketId={socketId}
          votedCount={votedCount}
          totalPlayers={totalPlayers}
        />
      )}
      {phase === 'result' && (
        <ResultScreen
          result={gameResult}
          socketId={socketId}
          isHost={isHost}
        />
      )}
    </div>
  );
}
