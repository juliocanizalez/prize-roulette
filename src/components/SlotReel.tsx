import { useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { getSegmentColor } from '../lib/utils';
import { usePreferences } from '../lib/PreferencesContext';
import type { Participant } from '../lib/types';

interface SlotReelProps {
  participants: Participant[];
  spinning: boolean;
  onSpinComplete: (winner: Participant) => void;
}

const TILE_HEIGHT_SM = 56;
const TILE_HEIGHT_WIDE = 100;
const TILE_HEIGHT_MD = 120;
const VISIBLE_SM = 3;
const VISIBLE_WIDE = 5;
const VISIBLE_MD = 5;
const REPEATS = 10;

const mdQuery = typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)') : null;
const wideQuery = typeof window !== 'undefined' ? window.matchMedia('(min-aspect-ratio: 4/3)') : null;

function subscribe(cb: () => void) {
  mdQuery?.addEventListener('change', cb);
  wideQuery?.addEventListener('change', cb);
  return () => {
    mdQuery?.removeEventListener('change', cb);
    wideQuery?.removeEventListener('change', cb);
  };
}

function getIsMd() {
  return mdQuery?.matches ?? true;
}

function getIsWide() {
  return wideQuery?.matches ?? false;
}

export default function SlotReel({ participants, spinning, onSpinComplete }: SlotReelProps) {
  const isMd = useSyncExternalStore(subscribe, getIsMd, () => true);
  const isWide = useSyncExternalStore(subscribe, getIsWide, () => false);
  const controls = useAnimation();
  const hasSpunRef = useRef(false);
  const { preferences } = usePreferences();

  // On wide screens (16:9), use intermediate tile size
  // On desktop (non-wide), use full MD size
  // On mobile, use SM size
  const TILE_HEIGHT = isWide ? TILE_HEIGHT_WIDE : (isMd ? TILE_HEIGHT_MD : TILE_HEIGHT_SM);
  const VISIBLE_COUNT = isWide ? VISIBLE_WIDE : (isMd ? VISIBLE_MD : VISIBLE_SM);
  const n = participants.length;
  const viewportHeight = VISIBLE_COUNT * TILE_HEIGHT;
  const centerOffset = Math.floor(VISIBLE_COUNT / 2) * TILE_HEIGHT;

  const spin = useCallback(async () => {
    const idx = Math.floor(Math.random() * n);

    // Target: land so the winner tile is centered in the viewport
    // Pick a tile in the last few repeats so we scroll through most of the reel
    const targetRepeat = REPEATS - 2;
    const targetTileIndex = targetRepeat * n + idx;
    const targetY = -(targetTileIndex * TILE_HEIGHT - centerOffset);

    await controls.start({
      y: targetY,
      transition: { duration: 4.5, ease: [0.15, 0.85, 0.25, 1] },
    });

    onSpinComplete(participants[idx]);
  }, [n, controls, onSpinComplete, participants, centerOffset]);

  useEffect(() => {
    if (spinning && !hasSpunRef.current) {
      hasSpunRef.current = true;
      // Reset to top before spinning
      controls.set({ y: 0 });
      spin();
    }
    if (!spinning) {
      hasSpunRef.current = false;
    }
  }, [spinning, spin, controls]);

  // Build repeated list
  const tiles: { participant: Participant; globalIndex: number }[] = [];
  for (let r = 0; r < REPEATS; r++) {
    for (let i = 0; i < n; i++) {
      tiles.push({ participant: participants[i], globalIndex: r * n + i });
    }
  }

  return (
    <div className="relative w-full max-w-[400px] md:max-w-[600px] wide:max-w-[700px] mx-auto">
      {/* Viewport */}
      <div
        className="relative overflow-hidden rounded-xl border border-white/10"
        style={{ height: viewportHeight }}
      >
        {/* Highlight bar in center */}
        <div
          className="pointer-events-none absolute left-0 right-0 z-10 border-y-2 border-primary"
          style={{
            top: centerOffset,
            height: TILE_HEIGHT,
            boxShadow: '0 0 20px var(--color-primary), inset 0 0 20px color-mix(in srgb, var(--color-primary) 10%, transparent)',
            background: 'color-mix(in srgb, var(--color-primary) 5%, transparent)',
          }}
        />

        {/* Top/bottom fade gradients */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-bg to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-bg to-transparent" />

        {/* Scrolling column */}
        <motion.div animate={controls} style={{ y: 0 }}>
          {tiles.map((tile, i) => {
            const color = getSegmentColor(tile.participant.id ? participants.indexOf(tile.participant) : i % n, preferences.theme);
            return (
              <div
                key={i}
                className="flex items-center justify-center border-b border-white/5"
                style={{ height: TILE_HEIGHT }}
              >
                <span
                  className="text-base md:text-4xl wide:text-3xl font-bold truncate max-w-[85vw] md:max-w-[520px] wide:max-w-[620px] px-4"
                  style={{ color, textShadow: `0 0 8px ${color}66` }}
                >
                  {tile.participant.name}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
