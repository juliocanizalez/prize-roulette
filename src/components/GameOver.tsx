import { useState, useEffect, useCallback } from 'react';
import { useGame } from './GameContainer';
import { usePreferences } from '../lib/PreferencesContext';
import { ChevronLeft, ChevronRight, PartyPopper, RotateCcw, Trophy } from 'lucide-react';
import { autoTextSize } from '../lib/utils';

function WinnerSlide({ winner, index, total }: { winner: { participant: { name: string }; prize: { name: string } }; index: number; total: number }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      {/* Progress indicator */}
      <div className="mb-4 flex items-center gap-2 text-accent landscape:mb-6 wide:mb-6">
        <Trophy className="size-6 md:size-8 landscape:size-10 wide:size-10" />
        <span className="text-xl font-bold md:text-2xl landscape:text-3xl wide:text-3xl">
          {index + 1} / {total}
        </span>
      </div>

      {/* Decorative line */}
      <div className="mb-3 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent md:w-48 landscape:mb-4 landscape:w-64 wide:mb-4 wide:w-64" />

      {/* Prize name */}
      <p className={`text-accent font-semibold uppercase tracking-wider ${autoTextSize(winner.prize.name, 'subheading')} landscape:text-3xl wide:text-3xl`}>
        {winner.prize.name}
      </p>

      {/* Decorative line */}
      <div className="mt-3 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent md:w-48 landscape:mt-4 landscape:w-64 wide:mt-4 wide:w-64" />

      {/* Winner name */}
      <h2 className={`gradient-text mt-4 font-bold leading-tight md:mt-6 landscape:mt-8 wide:mt-8 ${autoTextSize(winner.participant.name, 'heading')} landscape:text-5xl wide:text-5xl`}>
        {winner.participant.name}
      </h2>
    </div>
  );
}

function SummarySlide({ winners, allWinnersLabel }: { winners: { participant: { name: string }; prize: { name: string } }[]; allWinnersLabel: string }) {
  return (
    <div className="flex flex-1 flex-col items-center px-4 overflow-hidden">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2 text-center landscape:mb-6 wide:mb-6">
        <PartyPopper className="size-6 text-accent md:size-8 landscape:size-10 wide:size-10" />
        <h2 className="gradient-text text-xl font-bold md:text-3xl landscape:text-3xl wide:text-3xl">
          {allWinnersLabel}
        </h2>
        <PartyPopper className="size-6 text-accent md:size-8 landscape:size-10 wide:size-10" />
      </div>

      {/* Winners list */}
      <div className="w-full max-w-4xl wide:max-w-5xl flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3 landscape:grid-cols-2 landscape:gap-3 wide:grid-cols-3 wide:gap-3">
          {winners.map((w, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-white/10 p-3 md:p-4 landscape:p-3 wide:p-3"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-black md:size-10 md:text-base landscape:size-9 wide:size-9">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-accent md:text-sm landscape:text-sm wide:text-sm">
                  {w.prize.name}
                </p>
                <p className="truncate text-sm font-bold text-white md:text-base landscape:text-base wide:text-base">
                  {w.participant.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DotIndicators({ current, total, onSelect }: { current: number; total: number; onSelect: (i: number) => void }) {
  // total here includes the summary slide (so it's winners.length + 1)
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={i === total - 1 ? 'Ver resumen' : `Ver ganador ${i + 1}`}
          className={`size-3 rounded-full transition-all md:size-4 landscape:size-3 wide:size-3 ${
            i === current
              ? 'bg-accent scale-125'
              : 'bg-white/30 hover:bg-white/50'
          }`}
        />
      ))}
    </div>
  );
}

export default function GameOver() {
  const { state, dispatch } = useGame();
  const { preferences } = usePreferences();
  const [currentIndex, setCurrentIndex] = useState(0);

  const winnersCount = state.winners.length;
  const hasSummary = winnersCount > 1;
  const totalSlides = hasSummary ? winnersCount + 1 : winnersCount;
  const showingSummary = hasSummary && currentIndex === winnersCount;

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, totalSlides - 1));
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  return (
    <div className="flex h-[100dvh] flex-col px-4 py-4 md:py-6 landscape:py-3 wide:py-4">
      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {showingSummary ? (
          <SummarySlide winners={state.winners} allWinnersLabel={preferences.labels.allWinners} />
        ) : (
          <WinnerSlide
            winner={state.winners[currentIndex]}
            index={currentIndex}
            total={winnersCount}
          />
        )}
      </div>

      {/* Navigation controls */}
      <div className="mt-4 flex flex-col items-center gap-4 landscape:mt-3 landscape:gap-3 wide:mt-4 wide:gap-3">
        {/* Arrow buttons + dots */}
        {totalSlides > 1 && (
        <div className="flex w-full max-w-md items-center justify-center gap-4 landscape:max-w-lg wide:max-w-lg">
          {/* Left arrow */}
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            aria-label="Anterior"
            className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 md:size-14 landscape:size-12 wide:size-12"
          >
            <ChevronLeft className="size-6 md:size-8 landscape:size-6 wide:size-6" />
          </button>

          {/* Dot indicators */}
          <DotIndicators
            current={currentIndex}
            total={totalSlides}
            onSelect={setCurrentIndex}
          />

          {/* Right arrow */}
          <button
            onClick={goNext}
            disabled={currentIndex === totalSlides - 1}
            aria-label="Siguiente"
            className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 md:size-14 landscape:size-12 wide:size-12"
          >
            <ChevronRight className="size-6 md:size-8 landscape:size-6 wide:size-6" />
          </button>
        </div>
        )}

        {/* Action button */}
        <a
          href="#restart"
          role="button"
          onClick={(e) => { e.preventDefault(); dispatch({ type: 'RESTART_WITH_DATA' }); }}
          className="neon-glow inline-flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-base font-bold text-black no-underline transition hover:scale-[1.02] md:px-8 md:py-4 md:text-xl landscape:max-w-lg landscape:py-2.5 landscape:text-base wide:max-w-lg wide:py-3 wide:text-lg"
        >
          <RotateCcw className="size-5 md:size-6 landscape:size-5 wide:size-5" /> Jugar de Nuevo
        </a>
      </div>
    </div>
  );
}
