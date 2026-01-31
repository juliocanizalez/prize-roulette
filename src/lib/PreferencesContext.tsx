import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import type { ThemeId, FontScale } from './themes';

export interface Labels {
  winnerOf: string;
  allWinners: string;
  winner: string;
  winners: string;
}

export const defaultLabels: Labels = {
  winnerOf: 'Ganador de',
  allWinners: 'Todos los Ganadores',
  winner: 'Ganador',
  winners: 'Ganadores',
};

export interface Preferences {
  theme: ThemeId;
  fontScale: FontScale;
  fullscreenPreferred: boolean;
  confettiEnabled: boolean;
  appTitle: string;
  labels: Labels;
  minParticipants: number;
  setupSplitRatio: number;
  gameSplitRatio: number;
}

interface PreferencesContextValue {
  preferences: Preferences;
  setTheme: (theme: ThemeId) => void;
  setFontScale: (scale: FontScale) => void;
  setFullscreenPreferred: (preferred: boolean) => void;
  setConfettiEnabled: (enabled: boolean) => void;
  setAppTitle: (title: string) => void;
  setLabels: (labels: Labels) => void;
  setMinParticipants: (min: number) => void;
  setSetupSplitRatio: (ratio: number) => void;
  setGameSplitRatio: (ratio: number) => void;
}

const STORAGE_KEY = 'prize-roulette-prefs';

const defaultPreferences: Preferences = {
  theme: 'slate',
  fontScale: 'medium',
  fullscreenPreferred: false,
  confettiEnabled: true,
  appTitle: 'Ruleta de Privilegios',
  labels: { ...defaultLabels },
  minParticipants: 2,
  setupSplitRatio: 0.5,
  gameSplitRatio: 0.65,
};

function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw);
    return {
      ...defaultPreferences,
      ...parsed,
      labels: { ...defaultLabels, ...(parsed.labels ?? {}) },
    };
  } catch {
    return defaultPreferences;
  }
}

function savePreferences(prefs: Preferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors
  }
}

function applyPreferences(prefs: Preferences): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', prefs.theme);
  root.setAttribute('data-font-scale', prefs.fontScale);
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return ctx;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const isFirstMount = useRef(true);

  // Load preferences from localStorage on mount (SSR-safe)
  useEffect(() => {
    const loaded = loadPreferences();
    setPreferences(loaded);
    applyPreferences(loaded);
  }, []);

  // Save and apply on subsequent changes (not initial mount)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    applyPreferences(preferences);
    savePreferences(preferences);
  }, [preferences]);

  const setTheme = (theme: ThemeId) => {
    setPreferences((prev) => ({ ...prev, theme }));
  };

  const setFontScale = (fontScale: FontScale) => {
    setPreferences((prev) => ({ ...prev, fontScale }));
  };

  const setFullscreenPreferred = (fullscreenPreferred: boolean) => {
    setPreferences((prev) => ({ ...prev, fullscreenPreferred }));
  };

  const setConfettiEnabled = (confettiEnabled: boolean) => {
    setPreferences((prev) => ({ ...prev, confettiEnabled }));
  };

  const setAppTitle = (appTitle: string) => {
    setPreferences((prev) => ({ ...prev, appTitle }));
  };

  const setLabels = (labels: Labels) => {
    setPreferences((prev) => ({ ...prev, labels }));
  };

  const setMinParticipants = (minParticipants: number) => {
    setPreferences((prev) => ({ ...prev, minParticipants: Math.max(1, Math.min(10, minParticipants)) }));
  };

  const setSetupSplitRatio = (setupSplitRatio: number) => {
    setPreferences((prev) => ({ ...prev, setupSplitRatio }));
  };

  const setGameSplitRatio = (gameSplitRatio: number) => {
    setPreferences((prev) => ({ ...prev, gameSplitRatio }));
  };

  return (
    <PreferencesContext.Provider
      value={{ preferences, setTheme, setFontScale, setFullscreenPreferred, setConfettiEnabled, setAppTitle, setLabels, setMinParticipants, setSetupSplitRatio, setGameSplitRatio }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}
