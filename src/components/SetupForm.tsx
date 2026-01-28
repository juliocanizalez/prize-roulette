import { useState, useRef, useEffect } from 'react';
import { useGame } from './GameContainer';
import { parseCSV } from '../lib/utils';
import { Upload, Plus, Trash2, Users, Trophy, ChevronUp, ChevronDown, Maximize2, Minimize2, Settings, X } from 'lucide-react';
import { useFullscreen } from '../lib/useFullscreen';
import SettingsModal from './SettingsModal';
import type { Participant, Prize } from '../lib/types';

function ParticipantTag({
  participant,
  onRemove,
  onEdit,
}: {
  participant: Participant;
  onRemove: (id: string) => void;
  onEdit: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(participant.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function handleSave() {
    const trimmed = value.trim();
    if (trimmed && trimmed !== participant.name) {
      onEdit(participant.id, trimmed);
    } else {
      setValue(participant.name);
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') { setValue(participant.name); setEditing(false); }
        }}
        className="rounded bg-white/10 px-2 py-0.5 text-sm text-white outline-none focus:ring-1 focus:ring-primary"
      />
    );
  }

  return (
    <span className="group flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-sm text-white/90 transition hover:bg-white/15">
      <span
        onClick={() => setEditing(true)}
        className="cursor-pointer"
      >
        {participant.name}
      </span>
      <button
        type="button"
        onClick={() => onRemove(participant.id)}
        className="text-white/40 transition hover:text-red-400"
      >
        <X size={14} />
      </button>
    </span>
  );
}

function TagInput({
  participants,
  onAdd,
  onRemove,
  onEdit,
}: {
  participants: Participant[];
  onAdd: (names: string[]) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, name: string) => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function addFromInput() {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onAdd([trimmed]);
      setInputValue('');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addFromInput();
    }
    if (e.key === 'Backspace' && inputValue === '' && participants.length > 0) {
      onRemove(participants[participants.length - 1].id);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text');
    if (text.includes('\n') || text.includes(',')) {
      e.preventDefault();
      const names = text
        .split(/[\n,]+/)
        .map((n) => n.trim())
        .filter(Boolean);
      if (names.length > 0) {
        onAdd(names);
      }
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="min-h-[100px] max-h-[180px] overflow-y-auto flex flex-wrap content-start gap-1.5 p-2.5 rounded-lg border border-white/10 bg-white/5 cursor-text focus-within:border-primary"
    >
      {participants.map((p) => (
        <ParticipantTag key={p.id} participant={p} onRemove={onRemove} onEdit={onEdit} />
      ))}
      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={addFromInput}
        placeholder={participants.length === 0 ? 'Escribe un nombre y presiona Enter...' : ''}
        className="flex-1 min-w-[140px] bg-transparent text-sm text-white placeholder-white/30 outline-none py-1"
      />
    </div>
  );
}

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
  const { state, dispatch } = useGame();
  const [participants, setParticipants] = useState<Participant[]>(state.participants);
  const [prizes, setPrizes] = useState<Prize[]>(state.prizes);
  const [newPrize, setNewPrize] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  const canStart = participants.length >= 2 && prizes.length >= 1;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.endsWith('.csv')) {
      const parsed = await parseCSV(file);
      setParticipants((prev) => [...prev, ...parsed.map((p, i) => ({ ...p, id: `p-${Date.now()}-${i}` }))]);
    } else if (file.name.endsWith('.json')) {
      const text = await file.text();
      const data = JSON.parse(text);
      const names: string[] = Array.isArray(data)
        ? data.map((d: unknown) => (typeof d === 'string' ? d : (d as Record<string, string>).name))
        : [];
      const parsed = names.filter(Boolean).map((name, i) => ({ id: `p-${Date.now()}-${i}`, name }));
      setParticipants((prev) => [...prev, ...parsed]);
    }
    // Reset file input so the same file can be uploaded again
    if (fileRef.current) fileRef.current.value = '';
  }

  function addParticipants(names: string[]) {
    const newParticipants = names.map((name, i) => ({
      id: `p-${Date.now()}-${i}`,
      name,
    }));
    setParticipants((prev) => [...prev, ...newParticipants]);
  }

  function removeParticipant(id: string) {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }

  function editParticipant(id: string, name: string) {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }

  function clearParticipants() {
    setParticipants([]);
  }

  function addPrize() {
    if (!newPrize.trim()) return;
    setPrizes([...prizes, { id: `prize-${Date.now()}`, name: newPrize.trim() }]);
    setNewPrize('');
  }

  function removePrize(id: string) {
    setPrizes(prizes.filter((p) => p.id !== id));
  }

  function clearPrizes() {
    setPrizes([]);
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
    dispatch({ type: 'START_GAME', participants, prizes });
  }

  return (
    <div className="mx-auto max-w-4xl wide:max-w-5xl px-4 py-6 wide:px-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="gradient-text text-3xl font-bold md:text-4xl">
          Ruleta de Privilegios
        </h1>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="rounded-lg bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
          >
            <Settings size={18} />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-lg bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />

      <div className="glass-card w-full p-6 md:p-8 wide:p-6">
        <div className="flex flex-col gap-6 md:flex-row wide:gap-8">
          {/* Participants Panel */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Users size={20} />
              <h2 className="text-lg font-semibold">Participantes</h2>
              {participants.length > 0 && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                  {participants.length}
                </span>
              )}
              {participants.length > 0 && (
                <button
                  type="button"
                  onClick={clearParticipants}
                  className="ml-auto flex items-center gap-1 text-xs text-white/40 transition hover:text-red-400"
                >
                  <Trash2 size={14} /> Borrar todo
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 p-3 text-sm text-white/60 transition hover:border-primary hover:text-primary"
            >
              <Upload size={16} /> Subir CSV / JSON
            </button>
            <input ref={fileRef} type="file" accept=".csv,.json" className="hidden" onChange={handleFile} />
            <TagInput
              participants={participants}
              onAdd={addParticipants}
              onRemove={removeParticipant}
              onEdit={editParticipant}
            />
          </div>

          {/* Prizes Panel */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <Trophy size={20} />
              <h2 className="text-lg font-semibold">Privilegios</h2>
              {prizes.length > 0 && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                  {prizes.length}
                </span>
              )}
              {prizes.length > 0 && (
                <button
                  type="button"
                  onClick={clearPrizes}
                  className="ml-auto flex items-center gap-1 text-xs text-white/40 transition hover:text-red-400"
                >
                  <Trash2 size={14} /> Borrar todo
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={newPrize}
                onChange={(e) => setNewPrize(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPrize()}
                enterKeyHint="done"
                placeholder="Agregar un privilegio..."
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={addPrize}
                className="rounded-lg bg-accent/20 p-2 text-accent transition hover:bg-accent/30"
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
        className={`mt-4 block w-full rounded-xl px-6 py-3 text-center text-lg font-bold no-underline transition ${canStart ? 'neon-glow bg-gradient-to-r from-primary to-accent text-black' : 'bg-white/10 text-white/30 pointer-events-none'}`}
      >
        {canStart
          ? 'Iniciar Juego'
          : participants.length < 2
            ? `Faltan participantes (${participants.length}/2 mín.)`
            : 'Agrega al menos 1 privilegio'}
      </a>
    </div>
  );
}
