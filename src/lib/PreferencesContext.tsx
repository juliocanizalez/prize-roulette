import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import type { ThemeId, FontScale } from './themes';

export interface Preferences {
  theme: ThemeId;
  fontScale: FontScale;
  fullscreenPreferred: boolean;
}

interface PreferencesContextValue {
  preferences: Preferences;
  setTheme: (theme: ThemeId) => void;
  setFontScale: (scale: FontScale) => void;
  setFullscreenPreferred: (preferred: boolean) => void;
}

const STORAGE_KEY = 'prize-roulette-prefs';

const defaultPreferences: Preferences = {
  theme: 'slate',
  fontScale: 'medium',
  fullscreenPreferred: false,
};

function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPreferences;
    return { ...defaultPreferences, ...JSON.parse(raw) };
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

  return (
    <PreferencesContext.Provider
      value={{ preferences, setTheme, setFontScale, setFullscreenPreferred }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}
