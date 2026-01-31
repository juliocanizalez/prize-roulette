import { useRef, useState, useCallback, useEffect } from 'react';

interface UseDragResizeOptions {
  defaultRatio: number;
  onRatioChange: (ratio: number) => void;
  enabled: boolean;
}

const MIN_RATIO = 0.2;
const MAX_RATIO = 0.8;

function clamp(value: number): number {
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, value));
}

export function useDragResize({ defaultRatio, onRatioChange, enabled }: UseDragResizeOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled || !containerRef.current) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
    },
    [enabled],
  );

  // Attach native pointermove/pointerup on the handle element so we don't
  // need to worry about stale closures around ratio — the ratio is read from
  // the container width at drag time.
  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    function onPointerMove(e: PointerEvent) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newRatio = clamp((e.clientX - rect.left) / rect.width);
      onRatioChange(newRatio);
    }

    function onPointerUp() {
      setIsDragging(false);
    }

    handle.addEventListener('pointermove', onPointerMove);
    handle.addEventListener('pointerup', onPointerUp);
    handle.addEventListener('pointercancel', onPointerUp);

    return () => {
      handle.removeEventListener('pointermove', onPointerMove);
      handle.removeEventListener('pointerup', onPointerUp);
      handle.removeEventListener('pointercancel', onPointerUp);
    };
  }, [onRatioChange]);

  const onDoubleClick = useCallback(() => {
    if (enabled) onRatioChange(defaultRatio);
  }, [enabled, defaultRatio, onRatioChange]);

  return {
    containerRef,
    handleRef,
    isDragging,
    handleProps: { onPointerDown, onDoubleClick },
  };
}
