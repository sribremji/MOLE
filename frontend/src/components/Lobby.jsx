import { useState } from 'react';
import { socket } from '../socket';

export default function Lobby({ room, roomCode, socketId, onLeave }) {
  const [copying, setCopying] = useState(false);
  const [cycles, setCycles] = useState(3);
  const isHost = room?.hostId === socketId;
  const playerCount = room?.players?.length ?? 0;
  const canStart = playerCount >= 3;

  const handleStart = () => {
    socket.emit('start_game', { totalCycles: cycles }, ({ success, error }) => {
      if (!success) alert(error || 'Could not start game');
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopying(true);
      setTimeout(() => setCopying(false), 1500);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-sm space-y-5">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-white">
            THE <span className="text-red-500">MOLE</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Lobby</p>
        </div>

        {/* Room code card */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center shadow-xl">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Room Code</p>
          <button
            onClick={handleCopy}
            className="text-6xl font-black font-mono tracking-[0.2em] text-white hover:text-red-400 transition select-all"
            title="Tap to copy"
          >
            {roomCode}
          </button>
          <p className="text-gray-600 text-xs mt-2">
            {copying ? '✓ Copied!' : 'Tap to copy · Share with friends'}
          </p>
        </div>

        {/* Players list */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 shadow-xl">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">
            Players {playerCount}/10
          </p>
          <div className="space-y-2">
            {room?.players?.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3"
              >
                <span className="font-semibold text-lg truncate">{player.name}</span>
                <div className="flex gap-2 flex-shrink-0 ml-2">
                  {player.id === socketId && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-medium">
                      You
                    </span>
                  )}
                  {player.isHost && (
                    <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full font-medium">
                      Host
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {isHost ? (
          <div className="space-y-3">
            {/* Cycle picker */}
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-white">Clue Cycles</p>
                  <p className="text-gray-500 text-xs mt-0.5">Each player gives one clue per cycle</p>
                </div>
                <span className="text-3xl font-black text-red-400 w-10 text-center">{cycles}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={cycles}
                onChange={(e) => setCycles(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
              <div className="flex justify-between text-gray-600 text-xs mt-1">
                <span>1 (quick)</span>
                <span>5 (balanced)</span>
                <span>10 (intense)</span>
              </div>
            </div>

            {!canStart && (
              <p className="text-gray-600 text-sm text-center">
                Need at least 3 players to start
              </p>
            )}
            <button
              onClick={handleStart}
              disabled={!canStart}
              className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold text-xl py-4 rounded-xl transition-all active:scale-95 disabled:cursor-not-allowed"
            >
              Start Game · {cycles} {cycles === 1 ? 'Cycle' : 'Cycles'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3 py-4">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <p className="text-gray-400">Waiting for host to start…</p>
            </div>
          </div>
        )}

        <button
          onClick={onLeave}
          className="w-full bg-transparent border border-gray-800 hover:border-gray-600 text-gray-500 hover:text-gray-300 font-semibold py-3 rounded-xl transition-all active:scale-95"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}
