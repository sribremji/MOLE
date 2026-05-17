import { socket } from '../socket';

export default function ResultScreen({ result, socketId, isHost }) {
  if (!result) return null;

  const { moleFound, moleName, moleId, word, voteTally, eliminated, players, clues } = result;
  const eliminatedPlayer = players?.find((p) => p.id === eliminated);

  const handlePlayAgain = () => {
    socket.emit('play_again', {}, ({ success, error }) => {
      if (!success) alert(error || 'Could not restart');
    });
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8">
      <div className="w-full max-w-sm space-y-5">
        {/* Win/Loss banner */}
        <div className="text-center space-y-2">
          <div className="text-7xl">{moleFound ? '🎉' : '🕵️'}</div>
          <h2
            className={`text-5xl font-black ${moleFound ? 'text-green-400' : 'text-red-400'}`}
          >
            {moleFound ? 'Players Win!' : 'Mole Wins!'}
          </h2>
          <p className="text-gray-500 text-sm">
            {moleFound
              ? 'You caught the Mole!'
              : 'The Mole stayed hidden!'}
          </p>
        </div>

        {/* Mole reveal */}
        <div
          className={`rounded-2xl p-6 text-center border-4 ${
            moleFound ? 'bg-green-950 border-green-500' : 'bg-red-950 border-red-500'
          }`}
        >
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">The Mole was</p>
          <p className="text-4xl font-black text-white">{moleName}</p>
          <p className="text-gray-400 mt-3 text-sm">
            The word was{' '}
            <span className="text-white font-bold">{word}</span>
          </p>
        </div>

        {/* Elimination result */}
        {eliminated && eliminatedPlayer && !moleFound && (
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
            <p className="text-gray-400 text-sm">
              Players voted out{' '}
              <span className="text-white font-bold">{eliminatedPlayer.name}</span> — wrong call!
            </p>
          </div>
        )}

        {!eliminated && !moleFound && (
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
            <p className="text-gray-400 text-sm">Vote was tied — no one was eliminated. Mole escapes!</p>
          </div>
        )}

        {/* Vote tally */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Vote Tally</p>
          <div className="space-y-2">
            {players
              ?.slice()
              .sort((a, b) => (voteTally?.[b.id] ?? 0) - (voteTally?.[a.id] ?? 0))
              .map((player) => {
                const votes = voteTally?.[player.id] ?? 0;
                const isMole = player.id === moleId;
                const maxVotes = Math.max(...Object.values(voteTally ?? {}), 0);
                const barWidth = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
                return (
                  <div key={player.id} className="bg-gray-800 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{player.name}</span>
                        {isMole && (
                          <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                            MOLE
                          </span>
                        )}
                        {player.id === socketId && (
                          <span className="text-xs text-gray-500">you</span>
                        )}
                      </div>
                      <span className="font-bold text-red-400 text-sm">{votes} vote{votes !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all duration-700"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Clues recap — grouped by cycle */}
        {clues?.length > 0 && (() => {
          const totalCycles = result.totalCycles ?? 1;
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
                {group.map((c, i) => {
                  const isMoleClue = c.playerId === moleId;
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                        isMoleClue ? 'bg-red-950 border border-red-700' : 'bg-gray-800'
                      }`}
                    >
                      <span className={`text-sm ${isMoleClue ? 'text-red-300' : 'text-gray-400'}`}>
                        {c.playerName}
                        {isMoleClue && ' 🕵️'}
                      </span>
                      <span className="font-bold text-lg text-white">{c.clue}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ));
        })()}

        {/* Play again */}
        {isHost ? (
          <button
            onClick={handlePlayAgain}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xl py-4 rounded-xl transition-all active:scale-95"
          >
            Play Again
          </button>
        ) : (
          <div className="flex items-center justify-center gap-3 py-4">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <p className="text-gray-400">Waiting for host to play again…</p>
          </div>
        )}
      </div>
    </div>
  );
}
