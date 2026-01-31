import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { usePreferences, defaultLabels, type Labels } from '../lib/PreferencesContext';
import { themes, fontScales, type ThemeId, type FontScale } from '../lib/themes';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const {
    preferences,
    setTheme,
    setFontScale,
    setConfettiEnabled,
    setAppTitle,
    setLabels,
    setMinParticipants,
  } = usePreferences();

  const [labelsOpen, setLabelsOpen] = useState(false);

  if (!open) return null;

  function updateLabel(key: keyof Labels, value: string) {
    setLabels({ ...preferences.labels, [key]: value });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-sm relative flex flex-col max-h-[80dvh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-xl font-bold text-white">Configuraciones</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto p-6 pt-4 space-y-6">
          {/* === TEMA SECTION === */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Tema</h3>

            {/* Theme grid */}
            <div className="grid grid-cols-3 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id as ThemeId)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg p-2.5 transition ${
                    preferences.theme === theme.id
                      ? 'bg-white/20 ring-2 ring-primary'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex gap-1">
                    <div
                      className="size-3.5 rounded-full"
                      style={{ backgroundColor: theme.swatches.bg }}
                    />
                    <div
                      className="size-3.5 rounded-full"
                      style={{ backgroundColor: theme.swatches.primary }}
                    />
                    <div
                      className="size-3.5 rounded-full"
                      style={{ backgroundColor: theme.swatches.accent }}
                    />
                  </div>
                  <span className="text-xs text-white/80">{theme.label}</span>
                </button>
              ))}
            </div>

            {/* Font Scale */}
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

          {/* === PERSONALIZAR SECTION === */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Personalizar</h3>

            {/* App Title */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white/60">Título</label>
              <input
                type="text"
                value={preferences.appTitle}
                onChange={(e) => setAppTitle(e.target.value)}
                placeholder="Ruleta de Privilegios"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary"
              />
            </div>

            {/* Min Participants */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white/60">Mínimo de participantes</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMinParticipants(preferences.minParticipants - 1)}
                  disabled={preferences.minParticipants <= 1}
                  className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white/80 transition hover:bg-white/20 disabled:opacity-30"
                >
                  <Minus size={16} />
                </button>
                <span className="min-w-[2ch] text-center text-lg font-bold text-white">
                  {preferences.minParticipants}
                </span>
                <button
                  type="button"
                  onClick={() => setMinParticipants(preferences.minParticipants + 1)}
                  disabled={preferences.minParticipants >= 10}
                  className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white/80 transition hover:bg-white/20 disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Collapsible Labels */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setLabelsOpen(!labelsOpen)}
                className="flex w-full items-center justify-between text-sm font-medium text-white/60 hover:text-white/80 transition"
              >
                <span>Etiquetas</span>
                {labelsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {labelsOpen && (
                <div className="space-y-2 rounded-lg bg-white/5 p-3">
                  {(Object.keys(defaultLabels) as (keyof Labels)[]).map((key) => (
                    <div key={key} className="space-y-1">
                      <label className="block text-xs text-white/40">{defaultLabels[key]}</label>
                      <input
                        type="text"
                        value={preferences.labels[key]}
                        onChange={(e) => updateLabel(key, e.target.value)}
                        placeholder={defaultLabels[key]}
                        className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder-white/20 outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* === EFECTOS SECTION === */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Efectos</h3>

            {/* Confetti Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white/60">Confeti</label>
              <button
                type="button"
                onClick={() => setConfettiEnabled(!preferences.confettiEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  preferences.confettiEnabled ? 'bg-primary' : 'bg-white/20'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform ${
                    preferences.confettiEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
