import { useGame } from './GameContainer';
import { Trophy, RotateCcw, Check } from 'lucide-react';
import { autoTextSize } from '../lib/utils';

export default function WinnerModal() {
  const { state, dispatch } = useGame();
  if (state.stage !== 'AWAITING_DECISION' || !state.currentWinner) return null;

  const prize = state.prizes[state.currentPrizeIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card neon-glow w-full max-w-xl md:max-w-3xl space-y-4 md:space-y-6 p-6 md:p-8 text-center my-auto">
        <Trophy className="mx-auto text-neon-yellow hidden md:block" size={96} />
        <Trophy className="mx-auto text-neon-yellow md:hidden" size={48} />
        <div>
          <p className="mb-1 text-lg md:text-3xl text-white/60">Ganador de</p>
          <p className={`font-bold text-neon-magenta ${autoTextSize(prize.name, 'subheading')}`}>{prize.name}</p>
        </div>
        <p className={`gradient-text font-extrabold ${autoTextSize(state.currentWinner.name, 'heading')}`}>{state.currentWinner.name}</p>
        <div className="flex gap-3">
          <button
            onClick={() => dispatch({ type: 'REJECT_WINNER' })}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-lg md:px-6 md:py-6 md:text-3xl text-white/80 transition hover:border-white/40 hover:text-white"
          >
            <RotateCcw className="size-5 md:size-8" /> Girar de Nuevo
          </button>
          <button
            onClick={() => dispatch({ type: 'ACCEPT_WINNER' })}
            className="neon-glow flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-green px-4 py-3 text-lg md:px-6 md:py-6 md:text-3xl font-bold text-black transition"
          >
            <Check className="size-5 md:size-8" /> Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
