import { useState, useRef } from 'react';
import { useGame } from './GameContainer';
import { parseParticipantText, parseCSV } from '../lib/utils';
import { Upload, Plus, Trash2, Users, Trophy } from 'lucide-react';
import type { Participant, Prize } from '../lib/types';

export default function SetupForm() {
  const { dispatch } = useGame();
  const [participantText, setParticipantText] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [newPrize, setNewPrize] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const parsedFromText = parseParticipantText(participantText);
  const allParticipants = participants.length > 0 ? participants : parsedFromText;
  const canStart = allParticipants.length >= 2 && prizes.length >= 1;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.endsWith('.csv')) {
      const parsed = await parseCSV(file);
      setParticipants(parsed);
      setParticipantText(parsed.map((p) => p.name).join('\n'));
    } else if (file.name.endsWith('.json')) {
      const text = await file.text();
      const data = JSON.parse(text);
      const names: string[] = Array.isArray(data)
        ? data.map((d: unknown) => (typeof d === 'string' ? d : (d as Record<string, string>).name))
        : [];
      const parsed = names.filter(Boolean).map((name, i) => ({ id: `p-${i}`, name }));
      setParticipants(parsed);
      setParticipantText(parsed.map((p) => p.name).join('\n'));
    }
  }

  function addPrize() {
    if (!newPrize.trim()) return;
    setPrizes([...prizes, { id: `prize-${Date.now()}`, name: newPrize.trim() }]);
    setNewPrize('');
  }

  function removePrize(id: string) {
    setPrizes(prizes.filter((p) => p.id !== id));
  }

  function handleStart() {
    if (!canStart) return;
    dispatch({ type: 'START_GAME', participants: allParticipants, prizes });
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="glass-card w-full max-w-4xl p-6 md:p-8">
        <h1 className="gradient-text mb-6 text-center text-3xl font-bold md:text-4xl">
          Ruleta de Premios
        </h1>
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Participants Panel */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-neon-cyan">
              <Users size={20} />
              <h2 className="text-lg font-semibold">Participantes</h2>
              {allParticipants.length > 0 && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                  {allParticipants.length}
                </span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 p-3 text-sm text-white/60 transition hover:border-neon-cyan hover:text-neon-cyan"
            >
              <Upload size={16} /> Subir CSV / JSON
            </button>
            <input ref={fileRef} type="file" accept=".csv,.json" className="hidden" onChange={handleFile} />
            <textarea
              value={participantText}
              onChange={(e) => { setParticipantText(e.target.value); setParticipants([]); }}
              placeholder="O escribe nombres, uno por línea..."
              rows={8}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-white/30 outline-none focus:border-neon-cyan"
            />
          </div>

          {/* Prizes Panel */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-neon-magenta">
              <Trophy size={20} />
              <h2 className="text-lg font-semibold">Premios</h2>
              {prizes.length > 0 && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                  {prizes.length}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={newPrize}
                onChange={(e) => setNewPrize(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPrize()}
                placeholder="Agregar un premio..."
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-neon-magenta"
              />
              <button
                onClick={addPrize}
                className="rounded-lg bg-neon-magenta/20 p-2 text-neon-magenta transition hover:bg-neon-magenta/30"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
              {prizes.map((prize) => (
                <div key={prize.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                  <span>{prize.name}</span>
                  <button onClick={() => removePrize(prize.id)} className="text-white/40 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={!canStart}
          className="neon-glow mt-6 w-full rounded-xl bg-gradient-to-r from-neon-cyan to-neon-magenta px-6 py-3 text-lg font-bold text-black transition disabled:opacity-30 disabled:shadow-none"
        >
          Iniciar Juego
        </button>
      </div>
    </div>
  );
}
