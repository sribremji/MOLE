import { useState } from 'react';

export default function SecretCard({ isMole, word, hint, isHost, onStartClues }) {
  const [revealed, setRevealed] = useState(false);
  const [flipping, setFlipping] = useState(false);

  const handleReveal = () => {
    if (flipping || revealed) return;
    setFlipping(true);
    setTimeout(() => {
      setRevealed(true);
      setFlipping(false);
    }, 400);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400">Your Secret Role</h2>
          {!revealed && (
            <p className="text-gray-600 text-sm mt-1">Don't show your screen to others!</p>
          )}
        </div>

        {/* Card */}
        <div
          className="relative mx-auto"
          style={{ width: 260, height: 360, perspective: 800 }}
        >
          <div
            onClick={!revealed ? handleReveal : undefined}
            className="absolute inset-0 transition-transform duration-500 cursor-pointer"
            style={{
              transformStyle: 'preserve-3d',
              transform: revealed ? 'rotateY(180deg)' : flipping ? 'rotateY(90deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Card back */}
            <div
              className="absolute inset-0 rounded-3xl bg-gray-800 border-4 border-red-600 flex flex-col items-center justify-center shadow-2xl"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-7xl mb-4 select-none">🃏</div>
              <p className="text-gray-400 font-semibold text-lg">Tap to reveal</p>
              <p className="text-gray-600 text-sm mt-1">Make sure you're alone!</p>
            </div>

            {/* Card front */}
            <div
              className={`absolute inset-0 rounded-3xl flex flex-col items-center justify-center shadow-2xl border-4 px-6 py-8 text-center ${
                isMole
                  ? 'bg-red-950 border-red-500'
                  : 'bg-gray-900 border-green-500'
              }`}
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              {isMole ? (
                <>
                  <div className="text-6xl mb-3 select-none">🕵️</div>
                  <p className="text-red-400/70 text-xs uppercase tracking-widest mb-1">
                    You Are The Mole
                  </p>
                  <p className="text-red-300/60 text-xs mb-4 leading-relaxed px-2">
                    You don't know the real word — use this hint to blend in!
                  </p>
                  <p className="text-gray-400/70 text-xs uppercase tracking-widest">
                    Your Hint
                  </p>
                  <p className="text-4xl font-black text-red-300 mt-1">{hint}</p>
                  <p className="text-red-400/40 text-xs mt-4 leading-relaxed">
                    Give clues that sound related. Don't get caught!
                  </p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-4 select-none">🔑</div>
                  <p className="text-gray-400 font-semibold uppercase tracking-widest text-sm">
                    The word is
                  </p>
                  <p className="text-5xl font-black text-green-300 mt-2 break-words">
                    {word}
                  </p>
                  <p className="text-gray-500 text-sm mt-4 leading-relaxed">
                    Give clues that prove you know — but don't make it too obvious!
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {revealed && (
          <div className="space-y-3">
            {isHost ? (
              <button
                onClick={onStartClues}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xl py-4 rounded-xl transition-all active:scale-95"
              >
                Everyone's Ready → Start Clues
              </button>
            ) : (
              <div className="flex items-center justify-center gap-3 py-4">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <p className="text-gray-400">Waiting for host to start clue round…</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
