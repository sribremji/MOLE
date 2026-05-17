import { useState } from 'react';
import { socket } from '../socket';

export default function VotingRound({ room, clues, socketId, votedCount, totalPlayers }) {
  const [voted, setVoted] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleVote = (targetId) => {
    if (voted || targetId === socketId) return;
    setSelectedId(targetId);
    socket.emit('submit_vote', { targetId }, ({ success, error }) => {
      if (success) {
        setVoted(true);
      } else {
        setSelectedId(null);
        alert(error || 'Vote failed');
      }
    });
  };

  const voteProgress = totalPlayers > 0 ? (votedCount / totalPlayers) * 100 : 0;

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8">
      <div className="w-full max-w-sm space-y-5">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-white">
            <span className="text-red-500">Vote</span> Round
          </h2>
          <p className="text-gray-500 text-sm mt-1">Who is The Mole?</p>
        </div>

        {/* Vote progress */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Votes submitted</span>
            <span className="font-bold text-white">
              {votedCount}/{totalPlayers}
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-500"
              style={{ width: `${voteProgress}%` }}
            />
          </div>
        </div>

        {/* Clue recap — grouped by cycle */}
        {clues.length > 0 && (() => {
          const totalCycles = room?.totalCycles ?? 1;
          const cycles = [];
          for (let c = 1; c <= totalCycles; c++) {
            const group = clues.filter((cl) => cl.cycle === c);
            if (group.length) cycles.push({ cycle: c, group });
          }
          return cycles.map(({ cycle, group }) => (
            <div key={cycle} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">
                Cycle {cycle} / {totalCycles}
              </p>
              <div className="space-y-2">
                {group.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3"
                  >
                    <span className="text-gray-400 text-sm">{c.playerName}</span>
                    <span className="font-bold text-lg text-white">{c.clue}</span>
                  </div>
                ))}
              </div>
            </div>
          ));
        })()}

        {/* Player vote buttons */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">
            {voted ? 'Vote submitted!' : 'Tap to vote'}
          </p>
          <div className="space-y-2">
            {room?.players?.map((player) => {
              const isSelf = player.id === socketId;
              const isSelected = selectedId === player.id;
              return (
                <button
                  key={player.id}
                  onClick={() => handleVote(player.id)}
                  disabled={voted || isSelf}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-lg transition-all ${
                    isSelected
                      ? 'bg-red-600 text-white scale-[1.02]'
                      : isSelf
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : voted
                      ? 'bg-gray-800 text-gray-400'
                      : 'bg-gray-800 hover:bg-gray-700 text-white active:scale-95'
                  }`}
                >
                  <span className="truncate">{player.name}</span>
                  <div className="flex gap-2 flex-shrink-0 ml-2">
                    {isSelf && (
                      <span className="text-xs text-gray-500 font-normal">You</span>
                    )}
                    {isSelected && (
                      <span className="text-xs font-normal">✓ Voted</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {voted && (
          <div className="flex items-center justify-center gap-3 py-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <p className="text-gray-400">Waiting for others… ({votedCount}/{totalPlayers})</p>
          </div>
        )}
      </div>
    </div>
  );
}
