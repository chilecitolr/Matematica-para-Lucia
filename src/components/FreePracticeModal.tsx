import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Compass,
  Lightbulb,
  ListChecks,
  RefreshCw,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import type { SubjectId, VideoId } from '../types/lesson';
import {
  FREE_PRACTICE_TOPICS,
  generateFreePracticeExercise,
  getDefaultFreePracticeTopic,
  type FreePracticeExercise,
  type FreePracticeOption,
  type FreePracticeTopicId,
} from '../utils/freePracticeGenerator';
import { ColorMath } from './ColorMath';
import { playSoftFeedbackTone } from '../hooks/useNarrator';

interface FreePracticeModalProps {
  open: boolean;
  activeVideoId: VideoId;
  onClose: () => void;
}

export const FreePracticeModal: React.FC<FreePracticeModalProps> = ({
  open,
  activeVideoId,
  onClose,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<FreePracticeTopicId>(() =>
    getDefaultFreePracticeTopic(activeVideoId)
  );
  const [exercise, setExercise] = useState<FreePracticeExercise>(() =>
    generateFreePracticeExercise(getDefaultFreePracticeTopic(activeVideoId))
  );
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [exploredCount, setExploredCount] = useState(0);

  // Sync starting topic with current video when opening modal
  useEffect(() => {
    if (!open) return;
    const defaultTopic = getDefaultFreePracticeTopic(activeVideoId);
    setSelectedTopicId(defaultTopic);
    setExercise(generateFreePracticeExercise(defaultTopic));
    setSelectedOptionId(null);
    setShowHint(false);
    setShowSteps(false);
  }, [open, activeVideoId]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const currentTopicMeta = useMemo(
    () =>
      FREE_PRACTICE_TOPICS.find((t) => t.id === selectedTopicId) ||
      FREE_PRACTICE_TOPICS[0],
    [selectedTopicId]
  );

  const pickerSubject: SubjectId = currentTopicMeta.subject;

  const subjectTopics = useMemo(
    () => FREE_PRACTICE_TOPICS.filter((t) => t.subject === pickerSubject),
    [pickerSubject]
  );

  if (!open) return null;

  const isEnglish = exercise.subject === 'ingles';
  const selectedOption = exercise.options.find((o) => o.id === selectedOptionId);

  const handleSelectSubjectTab = (nextSubj: SubjectId) => {
    const firstTopic = FREE_PRACTICE_TOPICS.find((t) => t.subject === nextSubj);
    if (!firstTopic) return;
    setSelectedTopicId(firstTopic.id);
    setExercise(generateFreePracticeExercise(firstTopic.id));
    setSelectedOptionId(null);
    setShowHint(false);
    setShowSteps(false);
  };

  const handleSelectTopic = (topicId: FreePracticeTopicId) => {
    setSelectedTopicId(topicId);
    setExercise(generateFreePracticeExercise(topicId));
    setSelectedOptionId(null);
    setShowHint(false);
    setShowSteps(false);
  };

  const handleGenerateNext = () => {
    setExercise((prev) => generateFreePracticeExercise(selectedTopicId, prev.signature));
    setSelectedOptionId(null);
    setShowHint(false);
    setShowSteps(false);
  };

  const handleChooseOption = (opt: FreePracticeOption) => {
    if (selectedOptionId === null) {
      setExploredCount((c) => c + 1);
    }
    setSelectedOptionId(opt.id);
    if (opt.isCorrect) {
      playSoftFeedbackTone('success');
      setShowSteps(true);
    } else {
      playSoftFeedbackTone('gentle');
    }
  };

  const handleSpeakEnglish = (text?: string) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = 0.82;
      window.speechSynthesis.speak(utter);
    } catch {
      // Ignore speech synthesis errors
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-2 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Modo de Práctica Libre"
    >
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-start gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                <span className="font-semibold text-amber-800">Sin impacto en tu progreso</span>
                <span aria-hidden="true">·</span>
                <span>Exploración tranquila sin presiones</span>
                {exploredCount > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-math text-slate-700">
                      {exploredCount} {exploredCount === 1 ? 'ejercicio probado' : 'ejercicios probados'}
                    </span>
                  </>
                )}
              </div>
              <h2 className="font-display text-base sm:text-lg font-bold text-slate-900">
                Modo de Práctica Libre
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-200/70 text-slate-600 cursor-pointer shrink-0"
            aria-label="Cerrar Práctica Libre"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Subject Switch & Topic Chooser */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleSelectSubjectTab('matematica')}
                  className={`px-3.5 py-1.5 min-h-[38px] rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    pickerSubject === 'matematica'
                      ? 'bg-blue-800 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  Matemática (5 temas)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSubjectTab('ingles')}
                  className={`px-3.5 py-1.5 min-h-[38px] rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    pickerSubject === 'ingles'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  Inglés (4 temas)
                </button>
              </div>

              <span className="text-xs text-slate-500">
                Elegí cualquier tema para generar ejercicios nuevos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {subjectTopics.map((topic) => {
                const active = topic.id === selectedTopicId;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleSelectTopic(topic.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-colors cursor-pointer min-h-[56px] ${
                      active
                        ? pickerSubject === 'ingles'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                          : 'bg-blue-50 border-blue-500 text-blue-950'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold leading-snug">
                      {topic.title}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                      {topic.shortDesc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Generated Dynamic Exercise Stage */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <BookOpen className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                <span className="font-semibold text-slate-800">{exercise.topicTitle}</span>
                <span aria-hidden="true">·</span>
                <span>Ejercicio dinámico</span>
              </div>

              <button
                type="button"
                onClick={handleGenerateNext}
                className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer transition-colors whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4 text-blue-700" />
                <span>Generar otro ejercicio</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
              <p
                className={`text-sm sm:text-base font-semibold text-slate-900 ${
                  isEnglish ? 'font-english-accessible' : ''
                }`}
              >
                {exercise.prompt}
              </p>

              {exercise.mathExpr && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex items-center justify-center overflow-x-auto">
                  <ColorMath expr={exercise.mathExpr} size="xl" />
                </div>
              )}

              {exercise.englishHighlight && (
                <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="font-english-accessible text-base sm:text-lg font-bold text-slate-900">
                    {exercise.englishHighlight}
                  </span>
                  {exercise.speakEnglishText && (
                    <button
                      type="button"
                      onClick={() => handleSpeakEnglish(exercise.speakEnglishText)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-900 cursor-pointer shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Escuchar</span>
                    </button>
                  )}
                </div>
              )}

              {/* Answer Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {exercise.options.map((opt, idx) => {
                  const isSelected = selectedOptionId === opt.id;
                  const letter = String.fromCharCode(65 + idx);
                  let style =
                    'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-900';
                  if (isSelected && opt.isCorrect) {
                    style =
                      'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300';
                  } else if (isSelected && !opt.isCorrect) {
                    style = 'bg-amber-50 border-amber-400 text-amber-950';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleChooseOption(opt)}
                      className={`p-3.5 rounded-xl border-2 text-left transition-colors cursor-pointer min-h-[56px] flex items-center gap-3 ${style}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg font-math text-xs font-bold flex items-center justify-center shrink-0 ${
                          isSelected && opt.isCorrect
                            ? 'bg-emerald-600 text-white'
                            : isSelected && !opt.isCorrect
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 border border-slate-300 text-slate-700'
                        }`}
                      >
                        {letter}
                      </span>
                      <span
                        className={`text-sm font-semibold leading-snug ${
                          isEnglish ? 'font-english-accessible text-xs sm:text-sm' : ''
                        }`}
                      >
                        {opt.isMathExpr ? (
                          <ColorMath expr={opt.label} size="md" />
                        ) : (
                          opt.label
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Supportive Help Toggles (Always Available, Zero Pressure) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowHint((h) => !h)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                    showHint
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>{showHint ? 'Ocultar pista' : 'Ver una pista'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSteps((s) => !s)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                    showSteps
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <ListChecks className="w-4 h-4 text-blue-700" />
                  <span>{showSteps ? 'Ocultar pasos' : 'Ver explicación paso a paso'}</span>
                </button>
              </div>

              {showHint && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className={isEnglish ? 'font-english-accessible text-xs' : ''}>
                    {exercise.hint}
                  </span>
                </div>
              )}

              {selectedOption && (
                <div
                  className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed flex items-start justify-between gap-3 ${
                    selectedOption.isCorrect
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {selectedOption.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    )}
                    <span className={isEnglish ? 'font-english-accessible text-xs sm:text-sm' : ''}>
                      {selectedOption.feedback}
                    </span>
                  </div>

                  {selectedOption.isCorrect && (
                    <button
                      type="button"
                      onClick={handleGenerateNext}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0 cursor-pointer whitespace-nowrap"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Siguiente nuevo</span>
                    </button>
                  )}
                </div>
              )}

              {showSteps && (
                <div className="p-4 rounded-xl bg-white border border-blue-200 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
                    Paso a paso para entenderlo
                  </div>
                  <ol className="space-y-1.5 text-xs sm:text-sm text-slate-700 list-decimal list-inside">
                    {exercise.steps.map((step, i) => (
                      <li
                        key={i}
                        className={isEnglish ? 'font-english-accessible text-xs' : ''}
                      >
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
