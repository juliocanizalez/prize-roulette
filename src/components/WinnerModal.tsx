import { useGame } from './GameContainer';
import { usePreferences } from '../lib/PreferencesContext';
import { Trophy, RotateCcw, Check } from 'lucide-react';
import { autoTextSize } from '../lib/utils';

export default function WinnerModal() {
  const { state, dispatch } = useGame();
  const { preferences } = usePreferences();
  if (state.stage !== 'AWAITING_DECISION' || !state.currentWinner) return null;

  const prize = state.prizes[state.currentPrizeIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card neon-glow w-full max-w-xl md:max-w-3xl landscape:max-w-2xl landscape:max-h-[90vh] wide:max-w-2xl wide:max-h-[90vh] space-y-4 md:space-y-6 landscape:space-y-3 wide:space-y-3 p-6 md:p-8 landscape:p-5 wide:p-5 text-center my-auto">
        <Trophy className="mx-auto text-accent hidden md:block landscape:hidden wide:hidden" size={96} />
        <Trophy className="mx-auto text-accent md:hidden landscape:hidden wide:hidden" size={48} />
        <div className="landscape:space-y-0 wide:space-y-0">
          <p className="mb-1 text-lg md:text-3xl landscape:text-lg landscape:mb-0 wide:text-lg wide:mb-0 text-white/60">{preferences.labels.winnerOf}</p>
          <p className={`font-bold text-accent landscape:text-2xl wide:text-2xl ${autoTextSize(prize.name, 'subheading')}`}>{prize.name}</p>
        </div>
        <p className={`gradient-text font-extrabold landscape:text-3xl wide:text-3xl ${autoTextSize(state.currentWinner.name, 'heading')}`}>{state.currentWinner.name}</p>
        <div className="flex gap-3 landscape:gap-3 wide:gap-3">
          <button
            onClick={() => dispatch({ type: 'REJECT_AND_SPIN' })}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-lg md:px-6 md:py-6 md:text-3xl landscape:px-4 landscape:py-3 landscape:text-lg wide:px-4 wide:py-3 wide:text-lg text-white/80 transition hover:border-white/40 hover:text-white"
          >
            <RotateCcw className="size-5 md:size-8 landscape:size-5 wide:size-5" /> Girar de Nuevo
          </button>
          <button
            onClick={() => dispatch({ type: 'ACCEPT_WINNER' })}
            className="neon-glow flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-lg md:px-6 md:py-6 md:text-3xl landscape:px-4 landscape:py-3 landscape:text-lg wide:px-4 wide:py-3 wide:text-lg font-bold text-black transition"
          >
            <Check className="size-5 md:size-8 landscape:size-5 wide:size-5" /> Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
