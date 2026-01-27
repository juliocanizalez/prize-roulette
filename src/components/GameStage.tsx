import { useEffect, useState, useCallback } from 'react';
import { useGame } from './GameContainer';
import Wheel from './Wheel';
import WinnerModal from './WinnerModal';
import Confetti from './Confetti';
import { Maximize2, Minimize2 } from 'lucide-react';
import type { Participant } from '../lib/types';

function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  };

  return { isFullscreen, toggle };
}

export default function GameStage() {
  const { state, dispatch } = useGame();
  const { isFullscreen, toggle } = useFullscreen();
  const [showConfetti, setShowConfetti] = useState(false);

  const prize = state.prizes[state.currentPrizeIndex];
  const isSpinning = state.stage === 'SPINNING';
  const canSpin = state.stage === 'READY_TO_SPIN';
  const isPrizeAwarded = state.stage === 'PRIZE_AWARDED';

  const handleSpinComplete = useCallback(
    (winner: Participant) => {
      dispatch({ type: 'SPIN_COMPLETE', winner });
    },
    [dispatch]
  );

  useEffect(() => {
    if (isPrizeAwarded) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        dispatch({ type: 'ADVANCE_TO_NEXT_PRIZE' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isPrizeAwarded, dispatch]);

  return (
    <div className="relative flex h-full flex-col md:flex-row">
      <Confetti fire={showConfetti} />
      <WinnerModal />

      {/* Fullscreen button */}
      <button
        onClick={toggle}
        className="absolute right-4 top-4 z-20 rounded-lg bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
      >
        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>

      {/* Wheel — left / top */}
      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <Wheel
          participants={state.remainingParticipants}
          spinning={isSpinning}
          onSpinComplete={handleSpinComplete}
        />
      </div>

      {/* Controls — right / bottom */}
      <div className="flex w-full flex-col items-center justify-center gap-6 p-4 md:w-[40%] md:p-8">
        <div className="glass-card w-full max-w-sm space-y-4 p-6 text-center">
          <p className="text-sm text-white/50">Current Prize</p>
          <h2 className="gradient-text text-2xl font-bold md:text-3xl">{prize?.name}</h2>
          <p className="text-sm text-white/40">
            Prize {state.currentPrizeIndex + 1} of {state.prizes.length} &middot;{' '}
            {state.remainingParticipants.length} participants left
          </p>
        </div>

        {isPrizeAwarded && state.currentWinner && (
          <div className="glass-card w-full max-w-sm p-4 text-center">
            <p className="text-sm text-white/50">Winner</p>
            <p className="gradient-text text-xl font-bold">{state.currentWinner.name}</p>
          </div>
        )}

        <button
          onClick={() => dispatch({ type: 'START_SPIN' })}
          disabled={!canSpin}
          className="neon-glow w-full max-w-sm rounded-xl bg-gradient-to-r from-neon-cyan to-neon-magenta px-8 py-4 text-xl font-bold text-black transition hover:scale-105 active:scale-95 disabled:opacity-30 disabled:shadow-none disabled:hover:scale-100"
        >
          {isSpinning ? 'Spinning...' : isPrizeAwarded ? 'Next Prize...' : 'SPIN'}
        </button>

        {/* Winners so far */}
        {state.winners.length > 0 && (
          <div className="glass-card w-full max-w-sm p-4">
            <p className="mb-2 text-xs font-semibold text-white/40 uppercase">Winners</p>
            <div className="max-h-32 space-y-1 overflow-y-auto">
              {state.winners.map((w, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-white/70">{w.participant.name}</span>
                  <span className="text-neon-magenta">{w.prize.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
