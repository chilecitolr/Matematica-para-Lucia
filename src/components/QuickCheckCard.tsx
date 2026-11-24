import React, { useEffect, useState } from 'react';
import { Check, HelpCircle, RotateCcw, Sparkles } from 'lucide-react';
import type { SubjectId, VideoId } from '../types/lesson';
import { QUICK_CHECKS_BY_VIDEO, type QuickCheckOption } from '../data/quickChecks';
import { ColorMath } from './ColorMath';
import { playSoftFeedbackTone } from '../hooks/useNarrator';

interface QuickCheckCardProps {
  videoId: VideoId;
  videoLabel: string;
  subject: SubjectId;
}

const STORAGE_KEY = 'lucia_quick_checks_done_v1';

function loadSolvedQuickChecks(): Record<string, boolean> {
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

export const QuickCheckCard: React.FC<QuickCheckCardProps> = ({
  videoId,
  videoLabel,
  subject,
}) => {
  const item = QUICK_CHECKS_BY_VIDEO[videoId];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>(() =>
    loadSolvedQuickChecks()
  );

  useEffect(() => {
    setSelectedId(null);
  }, [videoId]);

  if (!item) return null;

  const isEnglish = subject === 'ingles';
  const alreadySolved = Boolean(solvedMap[videoId]);
  const selectedOption = item.options.find((o) => o.id === selectedId);

  const handleChoose = (opt: QuickCheckOption) => {
    setSelectedId(opt.id);
    if (opt.isCorrect) {
      playSoftFeedbackTone('success');
      setSolvedMap((prev) => {
        if (prev[videoId]) return prev;
        const next = { ...prev, [videoId]: true };
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            // Ignore storage quota errors
          }
        }
        return next;
      });
    } else {
      playSoftFeedbackTone('gentle');
    }
  };

  return (
    <section
      aria-label="Pregunta rápida del tema"
      className="bg-white border-2 border-indigo-200 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-300 text-indigo-800 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4" />
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Pregunta Rápida · {videoLabel}
            </div>
            <h3 className="font-display text-sm sm:text-base font-bold text-slate-900">
              Mini chequeo al final del video
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {alreadySolved && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800">
              <Check className="w-3.5 h-3.5" />
              <span>¡Respondida!</span>
            </span>
          )}
          {selectedId && (
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Probar otra vez</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        <p
          className={`text-sm sm:text-base font-semibold text-slate-900 ${
            isEnglish ? 'font-english-accessible text-sm sm:text-base' : ''
          }`}
        >
          {item.prompt}
        </p>

        {item.mathExpr && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 inline-block max-w-full overflow-x-auto">
            <ColorMath expr={item.mathExpr} size="md" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {item.options.map((opt, idx) => {
          const isSelected = selectedId === opt.id;
          const letter = String.fromCharCode(65 + idx);
          let style =
            'bg-slate-50/70 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-900';
          if (isSelected && opt.isCorrect) {
            style = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300';
          } else if (isSelected && !opt.isCorrect) {
            style = 'bg-amber-50 border-amber-400 text-amber-950';
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleChoose(opt)}
              className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer min-h-[54px] flex items-start gap-2.5 ${style}`}
            >
              <span
                className={`w-6 h-6 rounded-lg font-math text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected && opt.isCorrect
                    ? 'bg-emerald-600 text-white'
                    : isSelected && !opt.isCorrect
                      ? 'bg-amber-500 text-white'
                      : 'bg-white border border-slate-300 text-slate-700'
                }`}
              >
                {letter}
              </span>
              <span
                className={`text-xs sm:text-sm font-semibold leading-snug ${
                  isEnglish ? 'font-english-accessible text-xs sm:text-sm' : ''
                }`}
              >
                {opt.isMathExpr ? (
                  <ColorMath expr={opt.label} size="sm" />
                ) : (
                  opt.label
                )}
              </span>
            </button>
          );
        })}
      </div>

      {selectedOption ? (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed flex items-start gap-2.5 ${
            selectedOption.isCorrect
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <Sparkles
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              selectedOption.isCorrect ? 'text-emerald-700' : 'text-amber-700'
            }`}
          />
          <span>{selectedOption.feedback}</span>
        </div>
      ) : (
        <p
          className={`text-xs text-slate-500 ${
            isEnglish ? 'font-english-accessible text-[11px]' : ''
          }`}
        >
          {item.encouragementNote}
        </p>
      )}
    </section>
  );
};
