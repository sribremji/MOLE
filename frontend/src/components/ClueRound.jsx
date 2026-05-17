import { useState, useRef, useEffect } from 'react';
import { socket } from '../socket';

export default function ClueRound({ room, clues, currentCluePlayerId, socketId, isMole, word, hint }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const isMyTurn = currentCluePlayerId === socketId;
  const currentPlayer = room?.players?.find((p) => p.id === currentCluePlayerId);
  const currentCycle = room?.currentCycle ?? 1;
  const totalCycles = room?.totalCycles ?? 1;

  // Clues submitted in the current cycle
  const thisCycleClues = clues.filter((c) => c.cycle === currentCycle);
  // Players who've submitted this cycle
  const submittedIds = new Set(thisCycleClues.map((c) => c.playerId));
  // Clues from previous cycles grouped by cycle number
  const prevCycles = [];
  for (let c = 1; c < currentCycle; c++) {
    const group = clues.filter((cl) => cl.cycle === c);
    if (group.length) prevCycles.push({ cycle: c, group });
  }

  useEffect(() => {
    if (isMyTurn) inputRef.current?.focus();
  }, [isMyTurn, currentCycle]);

  const handleSubmit = () => {
    const clue = input.trim().split(/\s+/)[0];
    if (!clue) return;
    socket.emit('submit_clue', { clue }, ({ success, error }) => {
      if (success) setInput('');
      else alert(error || 'Failed to submit clue');
    });
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8">
      <div className="w-full max-w-sm space-y-5">

        {/* Header + word reminder */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-white">
            Clue <span className="text-red-500">Round</span>
          </h2>
          {isMole ? (
            <p className="text-red-400 text-sm mt-1">
              Your hint: <span className="text-red-300 font-bold">{hint}</span>
              <span className="text-red-500/60"> — blend in!</span>
            </p>
          ) : (
            <p className="text-gray-500 text-sm mt-1">
              Word: <span className="text-white font-bold">{word}</span>
            </p>
          )}
        </div>

        {/* Cycle indicator */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm uppercase tracking-widest">Cycle</span>
            <span className="text-2xl font-black text-white">
              {currentCycle}
              <span className="text-gray-600 font-normal text-lg"> / {totalCycles}</span>
            </span>
          </div>
          {/* Cycle dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: totalCycles }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                  i + 1 < currentCycle
                    ? 'bg-red-700'
                    : i + 1 === currentCycle
                    ? 'bg-red-500'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Turn indicator */}
        <div
          className={`rounded-2xl p-4 border text-center ${
            isMyTurn ? 'bg-red-950 border-red-500' : 'bg-gray-900 border-gray-800'
          }`}
        >
          {isMyTurn ? (
            <p className="text-red-300 font-bold text-lg">⚡ Your turn!</p>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <p className="text-gray-300 font-semibold">
                Waiting for <span className="text-white">{currentPlayer?.name ?? '…'}</span>
              </p>
            </div>
          )}
        </div>

        {/* Clue input */}
        {isMyTurn && (
          <div className="space-y-3">
            <input
              ref={inputRef}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition text-center font-bold"
              placeholder="One word…"
              value={input}
              onChange={(e) => setInput(e.target.value.split(' ')[0])}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              maxLength={30}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold text-xl py-4 rounded-xl transition-all active:scale-95 disabled:cursor-not-allowed"
            >
              Submit Clue
            </button>
          </div>
        )}

        {/* This cycle — who submitted vs. waiting */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">
            Cycle {currentCycle} — {thisCycleClues.length}/{room?.players?.length ?? 0} submitted
          </p>
          <div className="space-y-2">
            {room?.clueOrder?.map((id) => {
              const player = room.players.find((p) => p.id === id);
              const clueEntry = thisCycleClues.find((c) => c.playerId === id);
              const isCurrent = id === currentCluePlayerId;
              return (
                <div
                  key={id}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 transition ${
                    clueEntry
                      ? 'bg-gray-800'
                      : isCurrent
                      ? 'bg-red-950 border border-red-700'
                      : 'bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        clueEntry ? 'bg-green-500' : isCurrent ? 'bg-red-500 animate-pulse' : 'bg-gray-600'
                      }`}
                    />
                    <span className={`font-semibold ${clueEntry ? 'text-gray-300' : isCurrent ? 'text-red-200' : 'text-gray-500'}`}>
                      {player?.name ?? '?'}
                      {id === socketId && <span className="text-gray-600 text-xs ml-1">(you)</span>}
                    </span>
                  </div>
                  {clueEntry ? (
                    <span className="font-bold text-white">{clueEntry.clue}</span>
                  ) : isCurrent ? (
                    <span className="text-red-400 text-sm">typing…</span>
                  ) : (
                    <span className="text-gray-600 text-sm">waiting</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Previous cycles — collapsed history */}
        {prevCycles.map(({ cycle, group }) => (
          <div key={cycle} className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800/50">
            <p className="text-gray-600 text-xs uppercase tracking-widest mb-3">Cycle {cycle}</p>
            <div className="space-y-2">
              {group.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-2.5"
                >
                  <span className="text-gray-500 text-sm">{c.playerName}</span>
                  <span className="font-bold text-gray-300">{c.clue}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
