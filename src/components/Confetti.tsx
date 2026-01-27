import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function Confetti({ fire }: { fire: boolean }) {
  useEffect(() => {
    if (!fire) return;
    const end = Date.now() + 2000;
    const colors = ['#00f0ff', '#ff00ff', '#9d00ff', '#00ff88', '#ffe600'];

    function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    }
    frame();
  }, [fire]);

  return null;
}
