import { useEffect, useState, useCallback } from 'react';
import { useGame } from './GameContainer';
import SlotReel from './SlotReel';
import WinnerModal from './WinnerModal';
import Confetti from './Confetti';
import { Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { useFullscreen } from '../lib/useFullscreen';
import { autoTextSize } from '../lib/utils';
import type { Participant } from '../lib/types';

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
    <div className="flex h-dvh flex-col overflow-hidden md:flex-row">
      <Confetti fire={showConfetti} />
      <WinnerModal />

      {/* Wheel — left / top */}
      <div className="flex flex-1 items-center justify-center p-2 md:p-8">
        <SlotReel
          participants={state.remainingParticipants}
          spinning={isSpinning}
          onSpinComplete={handleSpinComplete}
        />
      </div>

      {/* Controls — right / bottom */}
      <div className="flex w-full flex-col items-center gap-2 overflow-y-auto p-2 md:w-[40%] md:gap-6 md:justify-center md:p-8">
        {/* Controls row */}
        <div className="flex w-full max-w-lg items-center justify-between">
          <div className="text-xs md:text-2xl text-white/50">Privilegio Actual</div>
          <div className="flex gap-1.5">
            <button
              onClick={() => dispatch({ type: 'RESTART' })}
              className="rounded-lg bg-white/10 p-1.5 md:p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
            >
              <RotateCcw className="size-4 md:size-8" />
            </button>
            <button
              onClick={toggle}
              className="rounded-lg bg-white/10 p-1.5 md:p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
            >
              {isFullscreen ? <Minimize2 className="size-4 md:size-8" /> : <Maximize2 className="size-4 md:size-8" />}
            </button>
          </div>
        </div>

        <div className="glass-card w-full max-w-lg space-y-1 md:space-y-4 p-3 md:p-6 text-center">
          <h2 className={`gradient-text font-bold ${autoTextSize(prize?.name ?? '', 'heading')}`}>{prize?.name}</h2>
          <p className="text-xs md:text-2xl text-white/40">
            Privilegio {state.currentPrizeIndex + 1} de {state.prizes.length} &middot;{' '}
            {state.remainingParticipants.length} participantes
          </p>
        </div>

        {isPrizeAwarded && state.currentWinner && (
          <div className="glass-card w-full max-w-lg p-2 md:p-4 text-center">
            <p className="text-xs md:text-2xl text-white/50">Ganador</p>
            <p className={`gradient-text font-bold ${autoTextSize(state.currentWinner.name, 'subheading')}`}>{state.currentWinner.name}</p>
          </div>
        )}

        <button
          onClick={() => dispatch({ type: 'START_SPIN' })}
          disabled={!canSpin}
          className="neon-glow w-full max-w-lg rounded-xl bg-gradient-to-r from-neon-cyan to-neon-magenta px-4 py-3 text-lg md:px-10 md:py-8 md:text-5xl font-bold text-black transition hover:scale-105 active:scale-95 disabled:opacity-30 disabled:shadow-none disabled:hover:scale-100"
        >
          {isSpinning ? 'Girando...' : isPrizeAwarded ? 'Siguiente...' : 'GIRAR'}
        </button>

        {/* Winners so far */}
        {state.winners.length > 0 && (
          <div className="glass-card w-full max-w-lg p-2 md:p-4">
            <p className="mb-1 text-xs md:text-xl font-semibold text-white/40 uppercase">Ganadores</p>
            <div className="max-h-32 md:max-h-72 space-y-1 overflow-y-auto">
              {state.winners.map((w, i) => (
                <div key={i} className="flex justify-between gap-2 rounded-lg bg-white/5 px-2 py-1 text-sm md:px-3 md:py-2 md:text-2xl">
                  <span className={`text-white/70 ${autoTextSize(w.participant.name, 'row')}`}>{w.participant.name}</span>
                  <span className={`text-neon-magenta shrink-0 ${autoTextSize(w.prize.name, 'row')}`}>{w.prize.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
