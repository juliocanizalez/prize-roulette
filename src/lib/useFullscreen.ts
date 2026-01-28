import { useEffect, useState, useCallback } from 'react';
import { usePreferences } from './PreferencesContext';

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { preferences, setFullscreenPreferred } = usePreferences();

  useEffect(() => {
    // Initialize fullscreen state on mount (SSR-safe)
    setIsFullscreen(!!document.fullscreenElement);

    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setFullscreenPreferred(false);
    } else {
      document.documentElement.requestFullscreen?.();
      setFullscreenPreferred(true);
    }
  }, [setFullscreenPreferred]);

  // Restore fullscreen preference on mount (user gesture required)
  const restoreFullscreen = useCallback(() => {
    if (preferences.fullscreenPreferred && !document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {
        // Ignore errors - fullscreen requires user gesture
      });
    }
  }, [preferences.fullscreenPreferred]);

  return { isFullscreen, toggle, restoreFullscreen };
}
