import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Papa from 'papaparse';
import type { Participant } from './types';
import { getThemeColors, type ThemeId } from './themes';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSegmentColor(index: number, themeId: ThemeId = 'slate'): string {
  const colors = getThemeColors(themeId);
  return colors[index % colors.length];
}

export function parseParticipantText(text: string): Participant[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name, i) => ({ id: `p-${i}`, name }));
}

/**
 * Returns responsive Tailwind text-size classes that shrink for longer strings.
 * `base` is an array of size tiers from largest to smallest, each with a max-length threshold.
 * Example: autoTextSize('short', 'heading') → 'text-3xl md:text-7xl'
 *          autoTextSize('a very long prize name here', 'heading') → 'text-xl md:text-4xl'
 */
type Tier = { maxLen: number; mobile: string; desktop: string };
const TIERS: Record<string, Tier[]> = {
  heading: [
    { maxLen: 10, mobile: 'text-3xl', desktop: 'md:text-7xl' },
    { maxLen: 20, mobile: 'text-2xl', desktop: 'md:text-5xl' },
    { maxLen: 35, mobile: 'text-xl',  desktop: 'md:text-4xl' },
    { maxLen: Infinity, mobile: 'text-lg', desktop: 'md:text-3xl' },
  ],
  subheading: [
    { maxLen: 15, mobile: 'text-lg', desktop: 'md:text-5xl' },
    { maxLen: 30, mobile: 'text-base', desktop: 'md:text-3xl' },
    { maxLen: Infinity, mobile: 'text-sm', desktop: 'md:text-2xl' },
  ],
  row: [
    { maxLen: 20, mobile: 'text-lg', desktop: 'md:text-4xl' },
    { maxLen: 40, mobile: 'text-base', desktop: 'md:text-2xl' },
    { maxLen: Infinity, mobile: 'text-sm', desktop: 'md:text-xl' },
  ],
};

export function autoTextSize(text: string, variant: keyof typeof TIERS = 'heading'): string {
  const tiers = TIERS[variant];
  const tier = tiers.find((t) => text.length <= t.maxLen) || tiers[tiers.length - 1];
  return `${tier.mobile} ${tier.desktop}`;
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
