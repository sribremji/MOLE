import { useState } from 'react';

export default function Home({ onCreateRoom, onJoinRoom }) {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState(null); // null | 'create' | 'join'

  const handleCreate = () => {
    if (!name.trim()) return alert('Enter your name first');
    onCreateRoom(name.trim());
  };

  const handleJoin = () => {
    if (!name.trim()) return alert('Enter your name first');
    if (joinCode.trim().length !== 4) return alert('Enter a 4-letter room code');
    onJoinRoom(name.trim(), joinCode.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10 select-none">
          <div className="text-7xl mb-3">🕵️</div>
          <h1 className="text-6xl font-black tracking-tight text-white">
            THE <span className="text-red-500">MOLE</span>
          </h1>
          <p className="text-gray-500 mt-2 text-base">Social deduction. One word at a time.</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-800 space-y-4">
          {/* Name input — always visible */}
          <input
            className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoFocus
          />

          {/* Mode selection */}
          {!mode && (
            <div className="space-y-3 pt-1">
              <button
                onClick={() => setMode('create')}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xl py-4 rounded-xl transition-all active:scale-95"
              >
                Create Room
              </button>
              <button
                onClick={() => setMode('join')}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl py-4 rounded-xl transition-all active:scale-95"
              >
                Join Room
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-3 pt-1">
              <button
                onClick={handleCreate}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xl py-4 rounded-xl transition-all active:scale-95"
              >
                Create Room
              </button>
              <button
                onClick={() => setMode(null)}
                className="w-full text-gray-500 hover:text-gray-300 py-2 transition"
              >
                ← Back
              </button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-3 pt-1">
              <input
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-2xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 uppercase tracking-[0.3em] font-mono text-center transition"
                placeholder="CODE"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                maxLength={4}
                autoFocus
              />
              <button
                onClick={handleJoin}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xl py-4 rounded-xl transition-all active:scale-95"
              >
                Join Room
              </button>
              <button
                onClick={() => setMode(null)}
                className="w-full text-gray-500 hover:text-gray-300 py-2 transition"
              >
                ← Back
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">Minimum 3 players to start</p>
      </div>
    </div>
  );
}
