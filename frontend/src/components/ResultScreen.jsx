import { socket } from '../socket';

/* ── Confetti ─────────────────────────────────────────────────────────── */
const CONFETTI_COLORS = [
  '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#a855f7', '#ec4899',
];

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2.5 + Math.random() * 2.5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.floor(Math.random() * 8),
    isCircle: Math.random() > 0.5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: 0,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          <div
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.isCircle ? '50%' : '2px',
              transform: 'rotate(45deg)',
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function ResultScreen({ result, socketId, isHost, onLeave }) {
  if (!result) return null;

  const {
    moleFound, moleName, moleId, word,
    votes, voteTally, eliminated,
    players, clues,
  } = result;
  const totalCycles = result.totalCycles ?? 1;

  // Players who correctly voted for the Mole (excludes the Mole themselves)
  const correctGuessers = players.filter(
    (p) => p.id !== moleId && votes?.[p.id] === moleId
  );

  // Vote tally sorted high → low
  const sortedByVotes = [...players].sort(
    (a, b) => (voteTally?.[b.id] ?? 0) - (voteTally?.[a.id] ?? 0)
  );
  const maxVotes = Math.max(...Object.values(voteTally ?? { _: 0 }));

  // Clues grouped by cycle number
  const cycleGroups = Array.from({ length: totalCycles }, (_, i) => {
    const n = i + 1;
    return { cycle: n, clues: (clues ?? []).filter((c) => c.cycle === n) };
  }).filter((g) => g.clues.length > 0);

  const handlePlayAgain = () => {
    socket.emit('play_again', {}, ({ success, error }) => {
      if (!success) alert(error || 'Could not restart');
    });
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8">
      {moleFound && <Confetti />}

      <div className="w-full max-w-sm space-y-4 relative z-20 pb-8">

        {/* ── A. Winner Banner ─────────────────────────────────────────── */}
        <div className="text-center py-4">
          <div className="text-7xl mb-3 select-none">
            {moleFound ? '🎉' : '🕵️'}
          </div>
          <h1
            className={`text-5xl font-black ${
              moleFound ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {moleFound ? 'Players Win!' : 'Mole Wins!'}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {moleFound
              ? 'The detectives cracked the case!'
              : 'The Mole stayed hidden…'}
          </p>
        </div>

        {/* ── B. Vote Results ──────────────────────────────────────────── */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">
            Vote Results
          </p>
          <div className="space-y-2">
            {sortedByVotes.map((player) => {
              const count = voteTally?.[player.id] ?? 0;
              const isMole = player.id === moleId;
              const isEliminated = player.id === eliminated;
              const barPct = maxVotes > 0 ? (count / maxVotes) * 100 : 0;
              return (
                <div
                  key={player.id}
                  className={`rounded-xl px-4 py-3 ${
                    isMole
                      ? 'bg-red-950 border border-red-700'
                      : 'bg-gray-800'
                  }`}
                  style={
                    isMole
                      ? { boxShadow: '0 0 14px rgba(239,68,68,0.35)' }
                      : {}
                  }
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{player.name}</span>
                      {isMole && (
                        <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                          MOLE 🕵️
                        </span>
                      )}
                      {isEliminated && !isMole && (
                        <span className="text-xs bg-orange-700 text-white px-2 py-0.5 rounded-full">
                          Eliminated
                        </span>
                      )}
                      {player.id === socketId && (
                        <span className="text-xs text-gray-500">you</span>
                      )}
                    </div>
                    <span
                      className={`font-bold text-sm flex-shrink-0 ml-2 ${
                        isMole ? 'text-red-400' : 'text-gray-400'
                      }`}
                    >
                      {count} vote{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isMole ? 'bg-red-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── C. Correct Guessers / Consolation ───────────────────────── */}
        {moleFound && correctGuessers.length > 0 && (
          <div
            className="bg-green-950 rounded-2xl p-5 border border-green-700"
            style={{ boxShadow: '0 0 20px rgba(34,197,94,0.2)' }}
          >
            <p className="text-green-400 font-black text-xl mb-1">
              🎉 Sharp Detectives!
            </p>
            <p className="text-green-300/60 text-sm mb-4">
              These players correctly identified the Mole:
            </p>
            <div className="space-y-2">
              {correctGuessers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 bg-green-900/40 rounded-xl px-4 py-3"
                >
                  <span className="text-green-400 font-black text-xl">✓</span>
                  <span className="font-semibold text-green-200 text-lg">
                    {p.name}
                    {p.id === socketId && (
                      <span className="text-green-500/70 text-sm ml-2">
                        (you)
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!moleFound && (
          <div className="bg-red-950/40 rounded-2xl p-4 border border-red-800/40 text-center">
            <p className="text-red-300 font-semibold text-lg">
              🕵️ The Mole fooled everyone!
            </p>
            <p className="text-red-400/60 text-sm mt-1">
              {eliminated
                ? `Players voted out ${
                    players.find((p) => p.id === eliminated)?.name
                  } by mistake`
                : 'Vote was tied — no one was eliminated'}
            </p>
          </div>
        )}

        {/* ── D. Mole Reveal ───────────────────────────────────────────── */}
        <div
          className="bg-red-950 rounded-2xl p-6 border-2 border-red-500 text-center"
          style={{ boxShadow: '0 0 28px rgba(239,68,68,0.45)' }}
        >
          <p className="text-red-300/60 text-xs uppercase tracking-widest mb-2">
            The Mole was
          </p>
          <p className="text-5xl font-black text-white">{moleName}</p>
          <p className="text-red-400/50 text-xs mt-3">
            🕵️ Better luck spotting them next time!
          </p>
        </div>

        {/* ── E. Secret Word Reveal ────────────────────────────────────── */}
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">
            The secret word was
          </p>
          <p className="text-4xl font-black text-white">{word}</p>
          <p className="text-gray-600 text-xs mt-2">
            The Mole had to fake knowing this word
          </p>
        </div>

        {/* ── F. Full Clue History ─────────────────────────────────────── */}
        <div className="space-y-3">
          <p className="text-gray-500 text-xs uppercase tracking-widest px-1">
            Full Clue History
          </p>
          {cycleGroups.map(({ cycle, clues: group }) => (
            <div
              key={cycle}
              className="bg-gray-900 rounded-2xl p-4 border border-gray-800"
            >
              <p className="text-gray-400 text-sm font-bold mb-3">
                Cycle {cycle}
                <span className="text-gray-600 font-normal"> / {totalCycles}</span>
              </p>
              <div className="space-y-2">
                {group.map((c, i) => {
                  const isMoleClue = c.playerId === moleId;
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                        isMoleClue
                          ? 'bg-red-950/70 border border-red-800/60'
                          : 'bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isMoleClue && (
                          <span className="text-red-500 text-xs">🕵️</span>
                        )}
                        <span
                          className={`text-sm font-medium ${
                            isMoleClue ? 'text-red-300' : 'text-gray-400'
                          }`}
                        >
                          {c.playerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-xs">→</span>
                        <span
                          className={`font-bold text-lg ${
                            isMoleClue ? 'text-red-200' : 'text-white'
                          }`}
                        >
                          {c.clue}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="space-y-3 pt-2">
          {isHost ? (
            <>
              <button
                onClick={handlePlayAgain}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xl py-4 rounded-xl transition-all active:scale-95"
              >
                🔄 Play Again — Same Room
              </button>
              <p className="text-center text-gray-600 text-xs">
                New word · New mole · Same players · Same cycles
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center gap-3 py-4 bg-gray-900 rounded-2xl border border-gray-800">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <p className="text-gray-400">Waiting for host to start again…</p>
            </div>
          )}

          <button
            onClick={onLeave}
            className="w-full border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white font-semibold text-lg py-3 rounded-xl transition-all active:scale-95"
          >
            Leave Room
          </button>
        </div>

      </div>
    </div>
  );
}
