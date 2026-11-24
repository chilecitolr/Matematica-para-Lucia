import React, { useEffect, useState } from 'react';
import { Grid3X3, StickyNote, Trash2, X, Check } from 'lucide-react';
import type { VideoId } from '../types/lesson';

interface FloatingNotepadProps {
  topicId: VideoId;
  topicLabel: string;
  topicTitle: string;
  showTablesButton?: boolean;
  onOpenTables?: () => void;
}

const STORAGE_KEY = 'lucia_notes_by_topic_v1';

function loadNotesMap(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export const FloatingNotepad: React.FC<FloatingNotepadProps> = ({
  topicId,
  topicLabel,
  topicTitle,
  showTablesButton = false,
  onOpenTables,
}) => {
  const [open, setOpen] = useState(false);
  const [notesByTopic, setNotesByTopic] = useState<Record<string, string>>(() => loadNotesMap());
  const [confirmClear, setConfirmClear] = useState(false);

  const currentNote = notesByTopic[topicId] || '';
  const hasNote = currentNote.trim().length > 0;

  useEffect(() => {
    setConfirmClear(false);
  }, [topicId, open]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notesByTopic));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [notesByTopic]);

  const handleChange = (value: string) => {
    setConfirmClear(false);
    setNotesByTopic((prev) => ({
      ...prev,
      [topicId]: value,
    }));
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    setNotesByTopic((prev) => {
      const next = { ...prev };
      delete next[topicId];
      return next;
    });
    setConfirmClear(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2.5">
      {open && (
        <div
          role="dialog"
          aria-label={`Apuntes de ${topicLabel}`}
          className="w-[calc(100vw-2rem)] sm:w-96 bg-white border-2 border-blue-400 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex items-start justify-between gap-3 px-4 py-3 bg-blue-50 border-b border-blue-200">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-display text-sm font-bold text-slate-900">
                <StickyNote className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="truncate">Mis apuntes · {topicLabel}</span>
              </div>
              <p className="text-xs text-slate-600 truncate mt-0.5">{topicTitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar bloc de notas"
              className="p-1.5 rounded-lg hover:bg-blue-100 text-slate-600 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 bg-[#FFFDF7]">
            <textarea
              value={currentNote}
              onChange={(e) => handleChange(e.target.value)}
              rows={6}
              placeholder="Escribí acá tus reglas, dudas o recordatorios de este tema..."
              aria-label="Apuntes rápidos del tema actual"
              className="w-full rounded-xl border border-amber-200 bg-white p-3 text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y min-h-[130px]"
            />
          </div>

          <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Guardado en tu navegador</span>
            </span>

            {hasNote && (
              <button
                type="button"
                onClick={handleClear}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                  confirmClear
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmClear ? '¿Confirmar borrar?' : 'Borrar'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {showTablesButton && onOpenTables && (
          <button
            type="button"
            onClick={onOpenTables}
            className="inline-flex items-center gap-1.5 px-3.5 py-3 min-h-[46px] rounded-full bg-blue-700 hover:bg-blue-800 text-white font-display text-xs sm:text-sm font-bold border-2 border-blue-950 shadow-lg transition-transform active:scale-95 cursor-pointer"
            title="Abrir machete con las tablas de multiplicar"
          >
            <Grid3X3 className="w-4 h-4 shrink-0" />
            <span>Tablas ×</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex items-center gap-2 px-4 py-3 min-h-[46px] rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-display text-xs sm:text-sm font-bold border-2 border-amber-700 shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          <StickyNote className="w-4 h-4 shrink-0" />
          <span>Mis apuntes</span>
          {hasNote && (
            <span
              className="w-2.5 h-2.5 rounded-full bg-blue-700 ring-2 ring-white"
              title="Tenés apuntes guardados en este tema"
            />
          )}
        </button>
      </div>
    </div>
  );
};
