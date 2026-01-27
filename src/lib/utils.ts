import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Papa from 'papaparse';
import type { Participant } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const NEON_COLORS = [
  '#00f0ff', '#ff00ff', '#bf5fff', '#00ff88',
  '#ffe600', '#ff6600', '#ff0066', '#4d94ff',
  '#00ccff', '#ff3399', '#66ff00', '#ff9900',
];

export function getSegmentColor(index: number): string {
  return NEON_COLORS[index % NEON_COLORS.length];
}

export function parseParticipantText(text: string): Participant[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name, i) => ({ id: `p-${i}`, name }));
}

export function parseCSV(file: File): Promise<Participant[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const rows = results.data as Record<string, string>[];
        const nameKey = Object.keys(rows[0] || {}).find(
          (k) => k.toLowerCase().includes('name')
        ) || Object.keys(rows[0] || {})[0];
        if (!nameKey) { resolve([]); return; }
        const participants = rows
          .map((row, i) => ({ id: `p-${i}`, name: (row[nameKey] || '').trim() }))
          .filter((p) => p.name);
        resolve(participants);
      },
      error: reject,
    });
  });
}

export function calculateTargetRotation(
  winnerIndex: number,
  totalSegments: number
): number {
  const segmentAngle = 360 / totalSegments;
  const segmentCenter = segmentAngle * winnerIndex + segmentAngle / 2;
  const fullSpins = (5 + Math.random() * 3) * 360;
  // Pointer is at top (0°/360°), wheel rotates clockwise
  // To land on segment, the segment center needs to be at the top
  return fullSpins + (360 - segmentCenter);
}
