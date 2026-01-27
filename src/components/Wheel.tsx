import { useRef, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { getSegmentColor, calculateTargetRotation } from '../lib/utils';
import type { Participant } from '../lib/types';

interface WheelProps {
  participants: Participant[];
  spinning: boolean;
  onSpinComplete: (winner: Participant) => void;
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function Wheel({ participants, spinning, onSpinComplete }: WheelProps) {
  const controls = useAnimation();
  const rotationRef = useRef(0);
  const hasSpunRef = useRef(false);

  const n = participants.length;
  const segAngle = 360 / n;

  const spin = useCallback(async () => {
    const winnerIndex = Math.floor(Math.random() * n);
    const target = calculateTargetRotation(winnerIndex, n);
    const totalRotation = rotationRef.current + target;

    await controls.start({
      rotate: totalRotation,
      transition: { duration: 4.5, ease: [0.15, 0.85, 0.25, 1] },
    });

    rotationRef.current = totalRotation;
    onSpinComplete(participants[winnerIndex]);
  }, [n, controls, onSpinComplete, participants]);

  useEffect(() => {
    if (spinning && !hasSpunRef.current) {
      hasSpunRef.current = true;
      spin();
    }
    if (!spinning) {
      hasSpunRef.current = false;
    }
  }, [spinning, spin]);

  return (
    <div className="relative aspect-square w-full max-w-[500px]">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1">
        <div className="h-0 w-0 border-x-[14px] border-t-[28px] border-x-transparent border-t-neon-cyan drop-shadow-[0_0_8px_var(--color-neon-cyan)]" />
      </div>

      <motion.svg
        viewBox="0 0 400 400"
        className="h-full w-full"
        animate={controls}
        style={{ rotate: rotationRef.current }}
      >
        {participants.map((p, i) => {
          const startAngle = i * segAngle;
          const endAngle = startAngle + segAngle;
          const midAngle = startAngle + segAngle / 2;
          const labelPos = polarToCartesian(200, 200, 140, midAngle);
          const color = getSegmentColor(i);

          return (
            <g key={p.id}>
              <path
                d={describeArc(200, 200, 190, startAngle, endAngle)}
                fill={color + '33'}
                stroke={color}
                strokeWidth={1.5}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                fill="white"
                fontSize={n > 20 ? 8 : n > 12 ? 10 : 12}
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})`}
                className="pointer-events-none select-none"
              >
                {p.name.length > 14 ? p.name.slice(0, 12) + '…' : p.name}
              </text>
            </g>
          );
        })}
        {/* Center circle */}
        <circle cx={200} cy={200} r={40} fill="#0a0a0f" stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
        <circle cx={200} cy={200} r={36} fill="none" stroke="rgba(0,240,255,0.3)" strokeWidth={1} />
      </motion.svg>
    </div>
  );
}
