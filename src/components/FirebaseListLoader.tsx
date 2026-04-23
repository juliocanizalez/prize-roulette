import { useState, useRef, useEffect } from "react";
import {
  X, Lock, Database, ChevronRight, Loader2, ArrowLeft,
  Search, Pencil, Trash2, Plus, Check, Save, AlertTriangle,
} from "lucide-react";
import {
  collection, getDocs, doc, updateDoc, deleteDoc, addDoc,
} from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../lib/firebase";

const ADMIN_EMAIL = "admin@canaan.app";

type ListType = "participantes" | "privilegios";
type Step = "pin" | "lists" | "manage" | "create";
type SaveState = "idle" | "saving" | "saved";

interface FirestoreList {
  label: string;
  type?: ListType;
  names: string[];
}

interface ListInfo {
  id: string;
  label: string;
  type: ListType;
  names: string[];
}

interface FirebaseListLoaderProps {
  open: boolean;
  onClose: () => void;
  onLoad: (names: string[]) => void;
  listType: ListType;
}

export default function FirebaseListLoader({
  open,
  onClose,
  onLoad,
  listType,
}: FirebaseListLoaderProps) {
  const [step, setStep] = useState<Step>("pin");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState<ListInfo[]>([]);

  // manage step
  const [activeList, setActiveList] = useState<ListInfo | null>(null);
  const [localNames, setLocalNames] = useState<string[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [search, setSearch] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newName, setNewName] = useState("");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [confirmDeleteList, setConfirmDeleteList] = useState(false);

  // create step
  const [createLabel, setCreateLabel] = useState("");
  const [createItems, setCreateItems] = useState<string[]>([]);
  const [createInput, setCreateInput] = useState("");
  const [createSaving, setCreateSaving] = useState(false);

  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const newNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editIndex]);

  // Skip PIN if already authenticated
  useEffect(() => {
    if (!open) return;
    if (auth.currentUser) {
      setStep("lists");
      fetchLists();
    }
  }, [open]);

  if (!open) return null;

  async function fetchLists() {
    setLoading(true);
    setLoadError(false);
    try {
      const snap = await getDocs(collection(db, "lists"));
      const all: ListInfo[] = snap.docs.map((d) => {
        const data = d.data() as FirestoreList;
        return {
          id: d.id,
          label: data.label,
          type: data.type ?? "participantes",
          names: data.names ?? [],
        };
      });
      setLists(all.filter((l) => l.type === listType));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  function resetModal() {
    setStep("pin");
    setPin("");
    setPinError(false);
    setLoadError(false);
    setLoading(false);
    setLists([]);
    setActiveList(null);
    setLocalNames([]);
    setPendingCount(0);
    setSearch("");
    setEditIndex(null);
    setNewName("");
    setSaveState("idle");
    setConfirmDeleteList(false);
    setCreateLabel("");
    setCreateItems([]);
    setCreateInput("");
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    setDeleteIndex(null);
  }

  function handleClose() {
    resetModal();
    onClose();
  }

  async function handlePinSubmit() {
    if (!pin) return;
    setPinError(false);
    setLoadError(false);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, pin);
    } catch {
      setPinError(true);
      setLoading(false);
      return;
    }
    setStep("lists");
    await fetchLists();
  }

  function handleLoadList(list: ListInfo) {
    onLoad(list.names);
    handleClose();
  }

  function handleManageList(list: ListInfo) {
    setActiveList(list);
    setLocalNames([...list.names]);
    setPendingCount(0);
    setSearch("");
    setEditIndex(null);
    setNewName("");
    setSaveState("idle");
    setConfirmDeleteList(false);
    setStep("manage");
  }

  // ── Manage helpers ────────────────────────────────────────────────────────

  function startEdit(idx: number) {
    if (deleteIndex !== null) return;
    setEditIndex(idx);
    setEditValue(localNames[idx]);
  }

  function confirmEdit() {
    if (editIndex === null) return;
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== localNames[editIndex]) {
      setLocalNames((prev) =>
        prev.map((n, i) => (i === editIndex ? trimmed : n)),
      );
      setPendingCount((c) => c + 1);
    }
    setEditIndex(null);
  }

  function cancelEdit() {
    setEditIndex(null);
  }

  function startDelete(idx: number) {
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    setDeleteIndex(idx);
    deleteTimerRef.current = setTimeout(() => {
      setLocalNames((prev) => prev.filter((_, i) => i !== idx));
      setPendingCount((c) => c + 1);
      setDeleteIndex(null);
    }, 350);
  }

  function addManageName() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setLocalNames((prev) => [...prev, trimmed]);
    setPendingCount((c) => c + 1);
    setNewName("");
    newNameRef.current?.focus();
  }

  async function saveChanges() {
    if (!activeList || pendingCount === 0) return;
    setSaveState("saving");
    try {
      await updateDoc(doc(db, "lists", activeList.id), { names: localNames });
      const updated = { ...activeList, names: localNames };
      setActiveList(updated);
      setLists((prev) =>
        prev.map((l) => (l.id === activeList.id ? updated : l)),
      );
      setPendingCount(0);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("idle");
    }
  }

  async function deleteList() {
    if (!activeList) return;
    try {
      await deleteDoc(doc(db, "lists", activeList.id));
      setLists((prev) => prev.filter((l) => l.id !== activeList.id));
      setStep("lists");
    } catch {
      setConfirmDeleteList(false);
    }
  }

  // ── Create helpers ────────────────────────────────────────────────────────

  function addCreateItem() {
    const trimmed = createInput.trim();
    if (!trimmed) return;
    setCreateItems((prev) => [...prev, trimmed]);
    setCreateInput("");
  }

  function removeCreateItem(idx: number) {
    setCreateItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function saveNewList() {
    const label = createLabel.trim();
    if (!label) return;
    setCreateSaving(true);
    try {
      const docRef = await addDoc(collection(db, "lists"), {
        label,
        type: listType,
        names: createItems,
        updatedAt: new Date().toISOString(),
      });
      const newList: ListInfo = {
        id: docRef.id,
        label,
        type: listType,
        names: createItems,
      };
      setLists((prev) => [...prev, newList]);
      setStep("lists");
    } catch {
      // keep on create step
    } finally {
      setCreateSaving(false);
    }
  }

  const filteredNames = localNames
    .map((name, originalIndex) => ({ name, originalIndex }))
    .filter(({ name }) =>
      name.toLowerCase().includes(search.toLowerCase()),
    );

  const typeLabel =
    listType === "participantes" ? "Participantes" : "Privilegios";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-sm relative flex flex-col max-h-[85dvh]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between p-5 pb-0 shrink-0">
          <div className="flex items-center gap-2">
            {(step === "manage" || step === "create") && (
              <button
                onClick={() => setStep("lists")}
                className="text-white/40 hover:text-white transition mr-1"
                title="Volver"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <Database size={17} className="text-primary" />
            <h2 className="text-base font-bold text-white">
              {step === "pin"    && "Cargar Lista"}
              {step === "lists"  && typeLabel}
              {step === "manage" && (activeList?.label ?? "Gestionar")}
              {step === "create" && "Nueva Lista"}
            </h2>
            {step === "manage" && (
              <span className="text-xs text-white/40 tabular-nums">
                {localNames.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {step === "manage" && !confirmDeleteList && (
              <button
                onClick={() => setConfirmDeleteList(true)}
                className="text-white/30 hover:text-red-400 transition p-1"
                title="Eliminar lista"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-white/40 hover:text-white transition"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* ── PIN step ── */}
        {step === "pin" && (
          <div className="p-5 pt-4 space-y-4">
            <p className="text-sm text-white/50">
              Ingresa el PIN para acceder a las listas guardadas.
            </p>
            <div className="space-y-1.5">
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setPinError(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
                  placeholder="PIN"
                  autoFocus
                  className={`w-full rounded-lg border bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition ${
                    pinError
                      ? "border-red-500 focus:border-red-400"
                      : "border-white/10 focus:border-primary"
                  }`}
                />
              </div>
              {pinError && (
                <p className="text-xs text-red-400">
                  PIN incorrecto. Intenta de nuevo.
                </p>
              )}
            </div>
            <button
              onClick={handlePinSubmit}
              disabled={loading || !pin}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/90 py-2.5 text-sm font-semibold text-black transition hover:bg-primary disabled:opacity-40"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Verificando..." : "Continuar"}
            </button>
            {loadError && (
              <p className="text-xs text-red-400">
                Error al cargar las listas. Verifica las reglas de Firestore.
              </p>
            )}
          </div>
        )}

        {/* ── Lists step ── */}
        {step === "lists" && (
          <>
            <div className="flex-1 overflow-y-auto p-5 pt-4 space-y-2 min-h-0">
              {loading && (
                <div className="flex justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-white/40" />
                </div>
              )}
              {!loading && lists.length === 0 && (
                <p className="text-sm text-white/40 text-center py-8">
                  No hay listas guardadas.
                </p>
              )}
              {!loading &&
                lists.map((list) => (
                  <div
                    key={list.id}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {list.label}
                      </p>
                      <p className="text-xs text-white/40">
                        {list.names.length} elementos
                      </p>
                    </div>
                    <button
                      onClick={() => handleManageList(list)}
                      title="Gestionar"
                      className="flex items-center justify-center rounded-lg bg-white/5 p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleLoadList(list)}
                      className="flex items-center gap-1.5 rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/30"
                    >
                      Cargar <ChevronRight size={13} />
                    </button>
                  </div>
                ))}
            </div>
            <div className="px-5 pb-5 pt-2 shrink-0 border-t border-white/10">
              <button
                onClick={() => {
                  setCreateLabel("");
                  setCreateItems([]);
                  setCreateInput("");
                  setStep("create");
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 py-2.5 text-sm text-white/50 transition hover:border-primary hover:text-primary"
              >
                <Plus size={15} /> Nueva lista
              </button>
            </div>
          </>
        )}

        {/* ── Manage step ── */}
        {step === "manage" && (
          <>
            {/* Delete list confirmation */}
            {confirmDeleteList && (
              <div className="mx-5 mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2.5 shrink-0">
                <AlertTriangle size={15} className="text-red-400 shrink-0" />
                <span className="flex-1 text-xs text-red-300">
                  ¿Eliminar esta lista permanentemente?
                </span>
                <button
                  onClick={deleteList}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 transition"
                >
                  Sí
                </button>
                <span className="text-white/20 text-xs">·</span>
                <button
                  onClick={() => setConfirmDeleteList(false)}
                  className="text-xs text-white/40 hover:text-white transition"
                >
                  No
                </button>
              </div>
            )}

            {/* Search */}
            <div className="px-5 pt-3 pb-2 shrink-0">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Name list */}
            <div className="flex-1 overflow-y-auto px-5 space-y-1 min-h-0">
              {filteredNames.length === 0 && (
                <p className="text-sm text-white/30 text-center py-6">
                  {search ? "Sin resultados." : "Lista vacía."}
                </p>
              )}
              {filteredNames.map(({ name, originalIndex }) => {
                const isEditing = editIndex === originalIndex;
                const isDeleting = deleteIndex === originalIndex;
                return (
                  <div
                    key={originalIndex}
                    onClick={
                      isDeleting
                        ? () => {
                            if (deleteTimerRef.current)
                              clearTimeout(deleteTimerRef.current);
                            setDeleteIndex(null);
                          }
                        : undefined
                    }
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                      isDeleting
                        ? "bg-red-500/20 border border-red-500/50 cursor-pointer"
                        : "bg-white/5 border border-transparent hover:border-white/10"
                    }`}
                  >
                    {isEditing ? (
                      <input
                        ref={editInputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={confirmEdit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="flex-1 bg-transparent text-sm text-white outline-none border-b border-primary pb-0.5"
                      />
                    ) : (
                      <span
                        className={`flex-1 text-sm truncate ${
                          isDeleting
                            ? "text-red-300 line-through"
                            : "text-white/90"
                        }`}
                      >
                        {name}
                      </span>
                    )}
                    {!isEditing && !isDeleting && (
                      <>
                        <button
                          onClick={() => startEdit(originalIndex)}
                          className="text-white/30 hover:text-primary transition p-1"
                          title="Editar"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => startDelete(originalIndex)}
                          className="text-white/30 hover:text-red-400 transition p-1"
                          title="Eliminar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                    {isDeleting && (
                      <span className="text-xs text-red-400 shrink-0">
                        Toca para cancelar
                      </span>
                    )}
                    {isEditing && (
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          confirmEdit();
                        }}
                        className="text-primary p-1"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add row */}
            {!search && (
              <div className="px-5 pt-2 pb-2 shrink-0 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    ref={newNameRef}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addManageName()}
                    placeholder="Agregar..."
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary"
                  />
                  <button
                    onClick={addManageName}
                    disabled={!newName.trim()}
                    className="rounded-lg bg-primary/20 p-2 text-primary transition hover:bg-primary/30 disabled:opacity-30"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Save */}
            <div className="px-5 pb-5 pt-2 shrink-0">
              <button
                onClick={saveChanges}
                disabled={pendingCount === 0 || saveState === "saving"}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
                  saveState === "saved"
                    ? "bg-green-500/20 text-green-400"
                    : pendingCount > 0
                      ? "bg-primary/90 text-black hover:bg-primary"
                      : "bg-white/5 text-white/20 cursor-default"
                }`}
              >
                {saveState === "saving" && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                {saveState === "saved" && <Check size={15} />}
                {saveState === "idle" && <Save size={15} />}
                {saveState === "saving" && "Guardando..."}
                {saveState === "saved" && "Guardado"}
                {saveState === "idle" &&
                  (pendingCount > 0
                    ? `Guardar (${pendingCount} ${pendingCount === 1 ? "cambio" : "cambios"})`
                    : "Sin cambios")}
              </button>
            </div>
          </>
        )}

        {/* ── Create step ── */}
        {step === "create" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 pt-4 space-y-3 shrink-0">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">
                  Nombre de la lista
                </label>
                <input
                  type="text"
                  value={createLabel}
                  onChange={(e) => setCreateLabel(e.target.value)}
                  placeholder={
                    listType === "privilegios"
                      ? "Ej: Privilegios Vigilia"
                      : "Ej: Lista de miembros"
                  }
                  autoFocus
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <input
                  value={createInput}
                  onChange={(e) => setCreateInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCreateItem()}
                  placeholder={
                    listType === "privilegios"
                      ? "Agregar privilegio..."
                      : "Agregar participante..."
                  }
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary"
                />
                <button
                  onClick={addCreateItem}
                  disabled={!createInput.trim()}
                  className="rounded-lg bg-primary/20 p-2 text-primary transition hover:bg-primary/30 disabled:opacity-30"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Items preview */}
            <div className="flex-1 overflow-y-auto px-5 space-y-1 min-h-0">
              {createItems.length === 0 && (
                <p className="text-sm text-white/20 text-center py-4">
                  Sin elementos aún.
                </p>
              )}
              {createItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2"
                >
                  <span className="flex-1 text-sm text-white/90 truncate">
                    {item}
                  </span>
                  <button
                    onClick={() => removeCreateItem(idx)}
                    className="text-white/30 hover:text-red-400 transition p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="px-5 pb-5 pt-3 shrink-0 border-t border-white/10">
              <button
                onClick={saveNewList}
                disabled={!createLabel.trim() || createSaving}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/90 py-2.5 text-sm font-semibold text-black transition hover:bg-primary disabled:opacity-40"
              >
                {createSaving && <Loader2 size={15} className="animate-spin" />}
                {createSaving ? "Creando..." : "Crear lista"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
