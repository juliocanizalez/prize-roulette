import { useEffect, useState, useCallback } from 'react';
import { useGame } from './GameContainer';
import { usePreferences } from '../lib/PreferencesContext';
import SlotReel from './SlotReel';
import WinnerModal from './WinnerModal';
import Confetti from './Confetti';
import SettingsModal from './SettingsModal';
import { Maximize2, Minimize2, RotateCcw, Settings } from 'lucide-react';
import { useFullscreen } from '../lib/useFullscreen';
import { useIsHorizontal } from '../lib/useIsHorizontal';
import { useDragResize } from '../lib/useDragResize';
import { autoTextSize } from '../lib/utils';
import type { Participant } from '../lib/types';

export default function GameStage() {
  const { state, dispatch } = useGame();
  const { preferences, setGameSplitRatio } = usePreferences();
  const { isFullscreen, toggle } = useFullscreen();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const isHorizontal = useIsHorizontal();
  const onRatioChange = useCallback((r: number) => setGameSplitRatio(r), [setGameSplitRatio]);
  const { containerRef, handleRef, isDragging, handleProps } = useDragResize({
    defaultRatio: 0.65,
    onRatioChange,
    enabled: isHorizontal,
  });

  const prize = state.prizes[state.currentPrizeIndex];
  const isSpinning = state.stage === 'SPINNING';
  const canSpin = state.stage === 'READY_TO_SPIN' && state.remainingParticipants.length > 0;
  const isPrizeAwarded = state.stage === 'PRIZE_AWARDED';

  const handleSpinComplete = useCallback(
    (winner: Participant) => {
      dispatch({ type: 'SPIN_COMPLETE', winner });
    },
    [dispatch]
  );

  useEffect(() => {
    if (isPrizeAwarded) {
      if (preferences.confettiEnabled) {
        setShowConfetti(true);
      }
      const timer = setTimeout(() => {
        setShowConfetti(false);
        dispatch({ type: 'ADVANCE_TO_NEXT_PRIZE' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isPrizeAwarded, dispatch, preferences.confettiEnabled]);
  let buttonText = 'GIRAR';
  if (isSpinning) {
    buttonText = 'Girando...';
  } else if (isPrizeAwarded) {
    buttonText = 'Siguiente...';
  }

  return (
    <div
      ref={containerRef}
      className={`flex h-dvh flex-col overflow-hidden md:flex-row wide:flex-row${isDragging ? ' select-none' : ''}`}
    >
      <Confetti fire={showConfetti} />
      <WinnerModal />

      {/* Wheel — left / top */}
      <div
        className="flex flex-1 min-w-0 items-center justify-center p-2 md:p-8 wide:p-6"
        style={isHorizontal ? { flex: `0 0 ${preferences.gameSplitRatio * 100}%` } : undefined}
      >
        <SlotReel
          participants={state.remainingParticipants}
          spinning={isSpinning}
          onSpinComplete={handleSpinComplete}
        />
      </div>

      {/* Drag Handle */}
      <div
        ref={handleRef}
        {...handleProps}
        className="hidden md:flex wide:flex items-center justify-center cursor-col-resize touch-none px-2 group"
      >
        <div className="w-1 h-8 rounded-full bg-white/20 transition group-hover:bg-white/40 group-active:bg-primary" />
      </div>

      {/* Controls — right / bottom */}
      <div className="flex w-full flex-1 min-w-0 flex-col items-center gap-2 p-2 md:gap-6 md:p-8 wide:gap-4 wide:p-6">
        {/* Fixed section: controls + prize + button */}
        <div className="w-full max-w-lg shrink-0 space-y-2 md:space-y-6 wide:space-y-3">
          {/* Controls row */}
          <div className="flex w-full items-center justify-end">
            <div className="flex gap-1.5">
              <button
                onClick={() => dispatch({ type: 'RESTART_WITH_DATA' })}
                className="rounded-lg bg-white/10 p-1.5 md:p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <RotateCcw className="size-4 md:size-8" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="rounded-lg bg-white/10 p-1.5 md:p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <Settings className="size-4 md:size-8" />
              </button>
              <button
                onClick={toggle}
                className="rounded-lg bg-white/10 p-1.5 md:p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                {isFullscreen ? <Minimize2 className="size-4 md:size-8" /> : <Maximize2 className="size-4 md:size-8" />}
              </button>
            </div>
          </div>
          <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />

          <div className="glass-card w-full space-y-1 md:space-y-2 p-3 md:p-3 wide:p-4 text-center">
            <p className="text-xs md:text-2xl wide:text-xl text-white/40">
              Privilegio
            </p>
            <h2 className={`gradient-text font-bold truncate ${autoTextSize(prize?.name ?? '', 'subheading')}`}>{prize?.name}</h2>
            <p className="text-xs md:text-2xl wide:text-xl text-white/40">
              {state.remainingParticipants.length} participantes
            </p>
          </div>

          {isPrizeAwarded && state.currentWinner && (
            <div className="glass-card w-full p-2 md:p-4 wide:p-3 text-center">
              <p className="text-xs md:text-2xl wide:text-lg text-white/50">{preferences.labels.winner}</p>
              <p className={`gradient-text font-bold ${autoTextSize(state.currentWinner.name, 'subheading')}`}>{state.currentWinner.name}</p>
            </div>
          )}

          <button
            onClick={() => dispatch({ type: 'START_SPIN' })}
            disabled={!canSpin}
            className="neon-glow w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-lg md:px-10 md:py-8 md:text-5xl wide:px-6 wide:py-4 wide:text-3xl font-bold text-black transition hover:scale-105 active:scale-95 disabled:opacity-30 disabled:shadow-none disabled:hover:scale-100"
          >
            {buttonText}
          </button>
        </div>

        {/* Scrollable section: winners list */}
        {state.winners.length > 0 && (
          <div className="glass-card w-full max-w-lg flex-1 min-h-0 overflow-hidden flex flex-col p-2 md:p-4 wide:p-3">
            <p className="mb-1 text-xs md:text-xl wide:text-base font-semibold text-white/40 uppercase shrink-0">{preferences.labels.winners}</p>
            <div className="flex-1 overflow-y-auto space-y-1">
              {state.winners.map((w, i) => (
                <div key={i} className="flex justify-between gap-2 rounded-lg bg-white/5 px-2 py-1 text-sm md:px-3 md:py-2 md:text-2xl wide:px-2 wide:py-1 wide:text-lg">
                  <span className={`text-white/70 ${autoTextSize(w.participant.name, 'row')}`}>{w.participant.name}</span>
                  <span className={`text-accent shrink-0 ${autoTextSize(w.prize.name, 'row')}`}>{w.prize.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
