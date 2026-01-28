import { X } from 'lucide-react';
import { usePreferences } from '../lib/PreferencesContext';
import { themes, fontScales, type ThemeId, type FontScale } from '../lib/themes';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { preferences, setTheme, setFontScale } = usePreferences();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-sm space-y-6 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white">Configuraciones</h2>

        {/* Theme Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white/60">Tema</label>
          <div className="flex gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id as ThemeId)}
                className={`flex flex-col items-center gap-2 rounded-lg p-3 transition ${
                  preferences.theme === theme.id
                    ? 'bg-white/20 ring-2 ring-primary'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex gap-1">
                  <div
                    className="size-4 rounded-full"
                    style={{ backgroundColor: theme.swatches.bg }}
                  />
                  <div
                    className="size-4 rounded-full"
                    style={{ backgroundColor: theme.swatches.primary }}
                  />
                  <div
                    className="size-4 rounded-full"
                    style={{ backgroundColor: theme.swatches.accent }}
                  />
                </div>
                <span className="text-xs text-white/80">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Scale Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white/60">
            Tamaño de Texto
          </label>
          <div className="flex gap-2">
            {fontScales.map((scale) => (
              <button
                key={scale.id}
                onClick={() => setFontScale(scale.id as FontScale)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                  preferences.fontScale === scale.id
                    ? 'bg-primary text-black'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {scale.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
