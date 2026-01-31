export type ThemeId = 'slate' | 'ocean' | 'forest' | 'sunset' | 'neon' | 'midnight';
export type FontScale = 'small' | 'medium' | 'large';

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  /** Preview swatch colors */
  swatches: { bg: string; primary: string; accent: string };
}

export const themes: ThemeDefinition[] = [
  {
    id: 'slate',
    label: 'Slate',
    swatches: { bg: '#0a0a1a', primary: '#3b82f6', accent: '#8b5cf6' },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    swatches: { bg: '#0a1419', primary: '#22d3ee', accent: '#22c55e' },
  },
  {
    id: 'forest',
    label: 'Forest',
    swatches: { bg: '#0f0d0a', primary: '#22c55e', accent: '#eab308' },
  },
  {
    id: 'sunset',
    label: 'Sunset',
    swatches: { bg: '#151008', primary: '#f59e0b', accent: '#e8446a' },
  },
  {
    id: 'neon',
    label: 'Neon',
    swatches: { bg: '#0a0615', primary: '#00ffff', accent: '#ff00ff' },
  },
  {
    id: 'midnight',
    label: 'Midnight',
    swatches: { bg: '#060614', primary: '#66b3ff', accent: '#f0c030' },
  },
];

export const fontScales: { id: FontScale; label: string; value: number }[] = [
  { id: 'small', label: 'S', value: 0.85 },
  { id: 'medium', label: 'M', value: 1.0 },
  { id: 'large', label: 'L', value: 1.2 },
];

/**
 * Theme-specific color palettes for slot reel segments.
 * Each theme has 12 colors that work well with its primary/accent.
 */
export const THEME_COLORS: Record<ThemeId, string[]> = {
  slate: [
    '#3b82f6', '#8b5cf6', '#6366f1', '#a855f7',
    '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981',
    '#f59e0b', '#f97316', '#ef4444', '#ec4899',
  ],
  ocean: [
    '#22d3ee', '#22c55e', '#06b6d4', '#14b8a6',
    '#10b981', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#f59e0b', '#f97316',
  ],
  forest: [
    '#22c55e', '#eab308', '#84cc16', '#10b981',
    '#14b8a6', '#f59e0b', '#f97316', '#ef4444',
    '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6',
  ],
  sunset: [
    '#f59e0b', '#e8446a', '#f97316', '#ef4444',
    '#ec4899', '#d946ef', '#f43f5e', '#fb923c',
    '#fbbf24', '#a855f7', '#8b5cf6', '#06b6d4',
  ],
  neon: [
    '#00ffff', '#ff00ff', '#00ff88', '#ff6600',
    '#ffff00', '#ff0066', '#0088ff', '#aa00ff',
    '#00ffaa', '#ff3399', '#33ccff', '#ff9900',
  ],
  midnight: [
    '#66b3ff', '#f0c030', '#4d94ff', '#80ccff',
    '#ffd700', '#3b82f6', '#6366f1', '#8b5cf6',
    '#0ea5e9', '#06b6d4', '#f59e0b', '#f97316',
  ],
};

export function getThemeColors(themeId: ThemeId): string[] {
  return THEME_COLORS[themeId] || THEME_COLORS.slate;
}
