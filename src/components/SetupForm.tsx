import { useState, useRef } from 'react';
import { useGame } from './GameContainer';
import { parseParticipantText, parseCSV } from '../lib/utils';
import { Upload, Plus, Trash2, Users, Trophy, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { useFullscreen } from '../lib/useFullscreen';
import type { Participant, Prize } from '../lib/types';

function PrizeRow({
  prize,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  prize: Prize;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onMoveUp: (i: number) => void;
  onMoveDown: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1.5 text-sm">
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          className="text-white/30 hover:text-white disabled:opacity-20"
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(index)}
          disabled={index === total - 1}
          className="text-white/30 hover:text-white disabled:opacity-20"
        >
          <ChevronDown size={14} />
        </button>
      </div>
      <span className="flex-1">{prize.name}</span>
      <button type="button" onClick={() => onRemove(prize.id)} className="text-white/40 hover:text-red-400">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function SetupForm() {
  const { dispatch } = useGame();
  const [participantText, setParticipantText] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [newPrize, setNewPrize] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

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

  function movePrize(from: number, to: number) {
    setPrizes((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function handleStart() {
    if (!canStart) return;
    dispatch({ type: 'START_GAME', participants: allParticipants, prizes });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="gradient-text text-3xl font-bold md:text-4xl">
          Ruleta de Privilegios
        </h1>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="rounded-lg bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      <div className="glass-card w-full p-6 md:p-8">
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
              type="button"
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
              rows={4}
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-white/30 outline-none focus:border-neon-cyan"
            />
          </div>

          {/* Prizes Panel */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-neon-magenta">
              <Trophy size={20} />
              <h2 className="text-lg font-semibold">Privilegios</h2>
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
                enterKeyHint="done"
                placeholder="Agregar un privilegio..."
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-neon-magenta"
              />
              <button
                type="button"
                onClick={addPrize}
                className="rounded-lg bg-neon-magenta/20 p-2 text-neon-magenta transition hover:bg-neon-magenta/30"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
              {prizes.map((prize, i) => (
                <PrizeRow
                  key={prize.id}
                  prize={prize}
                  index={i}
                  total={prizes.length}
                  onRemove={removePrize}
                  onMoveUp={(idx) => movePrize(idx, idx - 1)}
                  onMoveDown={(idx) => movePrize(idx, idx + 1)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <a
        href="#start"
        role="button"
        onClick={(e) => { e.preventDefault(); handleStart(); }}
        className={`mt-4 block w-full rounded-xl px-6 py-3 text-center text-lg font-bold no-underline transition ${canStart ? 'neon-glow bg-gradient-to-r from-neon-cyan to-neon-magenta text-black' : 'bg-white/10 text-white/30 pointer-events-none'}`}
      >
        {canStart
          ? 'Iniciar Juego'
          : allParticipants.length < 2
            ? `Faltan participantes (${allParticipants.length}/2 mín.)`
            : 'Agrega al menos 1 privilegio'}
      </a>
    </div>
  );
}
