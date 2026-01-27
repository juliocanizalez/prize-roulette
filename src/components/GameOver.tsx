import { useGame } from './GameContainer';
import { PartyPopper, RotateCcw } from 'lucide-react';

export default function GameOver() {
  const { state, dispatch } = useGame();

  return (
    <div className="mx-auto max-w-2xl md:max-w-4xl px-4 py-6">
      <div className="glass-card w-full space-y-4 md:space-y-6 p-6 md:p-8 text-center">
        <PartyPopper className="mx-auto text-neon-yellow hidden md:block" size={96} />
        <PartyPopper className="mx-auto text-neon-yellow md:hidden" size={48} />
        <h1 className="gradient-text text-3xl md:text-7xl font-bold">¡Todos los Privilegios Entregados!</h1>

        <div className="space-y-2">
          {state.winners.map((w, i) => (
            <div key={i} className="flex items-center justify-between gap-4 rounded-lg bg-white/5 px-4 py-3 text-lg md:px-6 md:py-5 md:text-4xl">
              <span className="font-medium">{w.participant.name}</span>
              <span className="text-neon-magenta shrink-0">{w.prize.name}</span>
            </div>
          ))}
        </div>
      </div>

      <a
        href="#restart"
        role="button"
        onClick={(e) => { e.preventDefault(); dispatch({ type: 'RESTART' }); }}
        className="neon-glow mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-magenta px-6 py-4 text-lg md:px-8 md:py-6 md:text-3xl font-bold text-black no-underline transition hover:scale-105"
      >
        <RotateCcw className="size-5 md:size-9" /> Jugar de Nuevo
      </a>
    </div>
  );
}
