import { useGame } from './GameContainer';
import { PartyPopper, RotateCcw } from 'lucide-react';

export default function GameOver() {
  const { state, dispatch } = useGame();

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="glass-card w-full max-w-2xl space-y-6 p-8 text-center">
        <PartyPopper className="mx-auto text-neon-yellow" size={64} />
        <h1 className="gradient-text text-5xl font-bold">All Prizes Awarded!</h1>

        <div className="space-y-2">
          {state.winners.map((w, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-4 text-xl">
              <span className="font-medium">{w.participant.name}</span>
              <span className="text-neon-magenta">{w.prize.name}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => dispatch({ type: 'RESTART' })}
          className="neon-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-magenta px-6 py-5 text-xl font-bold text-black transition hover:scale-105"
        >
          <RotateCcw size={24} /> Play Again
        </button>
      </div>
    </div>
  );
}
