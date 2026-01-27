import { useGame } from './GameContainer';
import { Trophy, RotateCcw, Check } from 'lucide-react';

export default function WinnerModal() {
  const { state, dispatch } = useGame();
  if (state.stage !== 'AWAITING_DECISION' || !state.currentWinner) return null;

  const prize = state.prizes[state.currentPrizeIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card neon-glow mx-4 w-full max-w-md space-y-6 p-8 text-center">
        <Trophy className="mx-auto text-neon-yellow" size={48} />
        <div>
          <p className="mb-1 text-sm text-white/60">Winner for</p>
          <p className="text-xl font-bold text-neon-magenta">{prize.name}</p>
        </div>
        <p className="gradient-text text-3xl font-extrabold">{state.currentWinner.name}</p>
        <div className="flex gap-3">
          <button
            onClick={() => dispatch({ type: 'REJECT_WINNER' })}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-white/80 transition hover:border-white/40 hover:text-white"
          >
            <RotateCcw size={18} /> Spin Again
          </button>
          <button
            onClick={() => dispatch({ type: 'ACCEPT_WINNER' })}
            className="neon-glow flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-green px-4 py-3 font-bold text-black transition"
          >
            <Check size={18} /> Accept
          </button>
        </div>
      </div>
    </div>
  );
}
