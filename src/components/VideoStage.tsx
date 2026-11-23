import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Cloud,
  CloudLightning,
  CloudRain,
  Eye,
  Flame,
  HelpCircle,
  Mountain,
  Pause,
  RotateCcw,
  Snowflake,
  Sparkles,
  Sun,
  Tornado,
  Volume2,
  Waves,
  Wind,
} from 'lucide-react';
import type { LessonScene, PedagogicalPhase, SubjectId } from '../types/lesson';
import { ColorMath, FractionBox } from './ColorMath';
import { playSoftFeedbackTone } from '../hooks/useNarrator';
import {
  doesSpokenTextMatchKeywords,
  getActiveClauseAtProgress,
  getActiveCueAtProgress,
  splitNarrationCues,
  splitSpokenClauses,
  type SpotlightTarget,
} from '../utils/spotlightCues';

const PHASE_LABELS: Record<PedagogicalPhase, string> = {
  concepto: 'Comprendemos la idea',
  'que-pide': '1. ¿Qué me pide el ejercicio?',
  datos: '2. ¿Qué datos tengo?',
  operacion: '3. ¿Qué operación realizo?',
  regla: '4. La regla que necesito',
  paso: '5. Un paso a la vez',
  resultado: '6. Resultado',
  comprobar: '7. Comprobamos si tiene sentido',
  practica: '8. Ahora probá vos',
  cierre: 'Resumen del recorrido',
};

interface VideoStageProps {
  scene: LessonScene;
  subject?: SubjectId;
  chapterTitle: string;
  chapterNumber: number;
  activityRef: string;
  isPlaying: boolean;
  narrationProgress: number;
  manualSpotlight?: SpotlightTarget;
  showSubtitles: boolean;
}

export const VideoStage: React.FC<VideoStageProps> = ({
  scene,
  subject = 'matematica',
  chapterTitle,
  chapterNumber,
  activityRef,
  isPlaying,
  narrationProgress,
  manualSpotlight = 'none',
  showSubtitles,
}) => {
  const cues = useMemo(() => splitNarrationCues(scene.narration), [scene.narration]);
  const clauses = useMemo(() => splitSpokenClauses(scene.narration), [scene.narration]);
  const { cue: activeCue } = useMemo(
    () => getActiveCueAtProgress(cues, narrationProgress),
    [cues, narrationProgress]
  );
  const { index: activeClauseIdx, clause: activeClause } = useMemo(
    () => getActiveClauseAtProgress(clauses, narrationProgress),
    [clauses, narrationProgress]
  );

  const isNarratingOrProgressed = isPlaying || narrationProgress > 0;
  const activeSpokenText = isNarratingOrProgressed ? activeClause.text : '';

  const activeTarget: SpotlightTarget =
    manualSpotlight !== 'none'
      ? manualSpotlight
      : isNarratingOrProgressed
        ? activeCue.target
        : 'none';

  const getTargetLabel = (t: SpotlightTarget): string => {
    if (subject === 'ingles') {
      return (
        {
          num: 'Señalando: Persona / Sujeto (Azul)',
          var: 'Señalando: Verbo / Palabra clave (Verde)',
          exp: 'Señalando: Tiempo / -ED / DID (Naranja)',
          neg: 'Señalando: Negación NOT / N’T (Rojo)',
          numerador: '',
          denominador: '',
          flip: '',
          base: '',
          area: '',
          none: '',
        }[t] || ''
      );
    }
    return (
      {
        num: 'Señalando: Números / Coeficientes (Azul)',
        var: 'Señalando: Letras / Parte literal (Verde)',
        exp: 'Señalando: Exponentes / Grado (Naranja)',
        neg: 'Señalando: Signos negativos (Rojo)',
        numerador: 'Señalando: Numerador',
        denominador: 'Señalando: Denominador',
        flip: 'Señalando: Fracción invertida',
        base: 'Señalando: Base',
        area: 'Señalando: Área',
        none: '',
      }[t] || ''
    );
  };

  const activeLabel =
    manualSpotlight !== 'none'
      ? getTargetLabel(manualSpotlight)
      : activeTarget !== 'none'
        ? subject === 'ingles'
          ? getTargetLabel(activeTarget) || activeCue.label
          : activeCue.label
        : '';

  return (
    <div className="relative w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Top Stage Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm text-slate-600">
          <span className="font-semibold text-slate-900">
            {subject === 'ingles' ? 'Tema' : 'Capítulo'} {chapterNumber}. {chapterTitle}
          </span>
          <span aria-hidden="true">·</span>
          <span>{activityRef}</span>
        </div>
        <div className="text-xs sm:text-sm font-medium text-blue-700">
          {PHASE_LABELS[scene.phase]}
        </div>
      </div>

      {/* Main Accessible Stage Canvas */}
      <div className="min-h-[320px] sm:min-h-[420px] md:min-h-[480px] px-4 py-5 sm:px-6 sm:py-7 md:px-10 md:py-8 flex flex-col justify-between bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col justify-between gap-5 sm:gap-6"
          >
            {/* Scene Title, Key Takeaway & Active Spotlight Indicator */}
            <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2 max-w-3xl">
                <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {scene.headline}
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed">
                  {scene.keyMessage}
                </p>
              </div>
              {activeLabel && (
                <div className="text-xs sm:text-sm font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 shrink-0">
                  {activeLabel}
                </div>
              )}
            </div>

            {/* Central Visual Diagram Area */}
            <div className="flex-1 flex items-center justify-center py-1 sm:py-2">
              <DiagramRenderer
                scene={scene}
                highlightTarget={activeTarget}
                activeSpokenText={activeSpokenText}
                hasManualSpotlight={manualSpotlight !== 'none'}
              />
            </div>

            {/* Supportive Reassurance Line */}
            {scene.supportPhrase && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-500">
                <span>{scene.supportPhrase}</span>
                <span className="hidden sm:inline">Observá con calma</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Calm High-Contrast Subtitle Strip with Live Clause Tracking */}
      {showSubtitles && (
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-900 text-slate-50 border-t border-slate-800">
          <p className="text-sm sm:text-base md:text-[17px] leading-relaxed text-center max-w-4xl mx-auto tracking-wide">
            {clauses.map((clause, idx) => {
              const isActive = isNarratingOrProgressed && idx === activeClauseIdx;
              return (
                <span
                  key={idx}
                  className={`transition-all duration-200 ${
                    isNarratingOrProgressed
                      ? isActive
                        ? 'bg-amber-300 text-slate-950 font-bold px-1.5 py-0.5 rounded mx-0.5'
                        : 'text-slate-300 opacity-65'
                      : 'text-slate-100 opacity-100'
                  }`}
                >
                  {clause.text}{' '}
                </span>
              );
            })}
          </p>
        </div>
      )}
    </div>
  );
};

const DiagramRenderer: React.FC<{
  scene: LessonScene;
  highlightTarget: SpotlightTarget;
  activeSpokenText: string;
  hasManualSpotlight: boolean;
}> = ({ scene, highlightTarget, activeSpokenText, hasManualSpotlight }) => {
  const { diagram } = scene;

  switch (diagram.type) {
    case 'fraction-intro': {
      const anglePerSlice = 360 / diagram.total;
      const radius = 84;
      const cx = 100;
      const cy = 100;
      const hiNum = highlightTarget === 'numerador';
      const hiDen = highlightTarget === 'denominador';

      const makeSlicePath = (idx: number) => {
        const startAngle = ((idx * anglePerSlice - 90) * Math.PI) / 180;
        const endAngle = (((idx + 1) * anglePerSlice - 90) * Math.PI) / 180;
        const x1 = cx + radius * Math.cos(startAngle);
        const y1 = cy + radius * Math.sin(startAngle);
        const x2 = cx + radius * Math.cos(endAngle);
        const y2 = cy + radius * Math.sin(endAngle);
        const largeArc = anglePerSlice > 180 ? 1 : 0;
        return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      };

      return (
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="flex flex-col items-center gap-3">
            <svg
              viewBox="0 0 200 200"
              className={`w-40 h-40 sm:w-52 sm:h-52 transition-transform duration-300 ${
                hiNum || hiDen ? 'scale-105' : ''
              }`}
              role="img"
              aria-label={diagram.caption}
            >
              {Array.from({ length: diagram.total }).map((_, idx) => {
                const filled = idx < diagram.slices;
                return (
                  <motion.path
                    key={idx}
                    d={makeSlicePath(idx)}
                    initial={{ opacity: 0.4, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.14, duration: 0.35 }}
                    fill={
                      filled
                        ? hiNum
                          ? '#93C5FD'
                          : '#DBEAFE'
                        : hiDen
                          ? '#E2E8F0'
                          : '#F8FAFC'
                    }
                    stroke={hiDen ? '#1D4ED8' : '#1E293B'}
                    strokeWidth={hiDen ? '3.5' : '2.5'}
                  />
                );
              })}
            </svg>
            <span className="text-xs sm:text-sm text-slate-600 font-medium text-center">{diagram.caption}</span>
          </div>

          <div className="flex flex-col gap-4 sm:gap-5 items-center sm:items-start">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
              <FractionBox
                num={String(diagram.slices)}
                den={String(diagram.total)}
                size="xl"
                highlightTarget={highlightTarget}
              />
              <div className="space-y-2.5 sm:space-y-3 text-sm sm:text-base">
                <div
                  className={`flex items-center gap-2 p-2 rounded-lg transition-transform duration-300 ${
                    hiNum ? 'scale-105 bg-blue-50 ring-2 ring-blue-300' : ''
                  }`}
                >
                  <ArrowRight className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>
                    <strong className="text-blue-700">Numerador ({diagram.slices})</strong>:
                    partes que tomamos
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 p-2 rounded-lg transition-transform duration-300 ${
                    hiDen ? 'scale-105 bg-blue-50 ring-2 ring-blue-300' : ''
                  }`}
                >
                  <ArrowRight className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>
                    <strong className="text-blue-700">Denominador ({diagram.total})</strong>:
                    partes iguales del entero
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'fraction-add-same': {
      const resultNum =
        diagram.op === '+'
          ? diagram.leftNum + diagram.rightNum
          : diagram.leftNum - diagram.rightNum;

      const renderBar = (filled: number, total: number, colorClass: string) => (
        <div
          className="grid gap-1 w-full"
          style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-9 rounded border border-slate-300 ${
                i < filled ? colorClass : 'bg-slate-50'
              }`}
            />
          ))}
        </div>
      );

      return (
        <div className="w-full max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8">
            <FractionBox
              num={String(diagram.leftNum)}
              den={String(diagram.den)}
              size="xl"
              highlightTarget={highlightTarget}
            />
            <span className="text-3xl font-bold text-slate-700">{diagram.op}</span>
            <FractionBox
              num={String(diagram.rightNum)}
              den={String(diagram.den)}
              size="xl"
              highlightTarget={highlightTarget}
            />
            <span className="text-3xl font-bold text-slate-700">=</span>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="px-5 py-3 rounded-xl bg-blue-50 border border-blue-200"
            >
              <FractionBox
                num={String(resultNum)}
                den={String(diagram.den)}
                size="xl"
                highlightTarget={highlightTarget}
              />
            </motion.div>
          </div>

          <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-16 flex justify-center shrink-0">
                <ColorMath expr={`${diagram.leftNum}/${diagram.den}`} size="sm" highlightTarget={highlightTarget} />
              </div>
              {renderBar(diagram.leftNum, diagram.den, 'bg-blue-500')}
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 flex justify-center shrink-0">
                <ColorMath expr={`${diagram.rightNum}/${diagram.den}`} size="sm" highlightTarget={highlightTarget} />
              </div>
              {renderBar(diagram.rightNum, diagram.den, 'bg-sky-400')}
            </div>
            <div className="flex items-center gap-4 pt-2 border-t border-slate-200">
              <div className="w-16 flex items-center justify-center gap-1 shrink-0 text-xs font-bold text-blue-800">
                <span>Total</span>
                <ColorMath expr={`${resultNum}/${diagram.den}`} size="sm" highlightTarget={highlightTarget} />
              </div>
              <div
                className="grid gap-1 w-full"
                style={{ gridTemplateColumns: `repeat(${diagram.den}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: diagram.den }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-9 rounded border border-slate-300 ${
                      i < diagram.leftNum
                        ? 'bg-blue-500'
                        : i < resultNum
                          ? 'bg-sky-400'
                          : 'bg-slate-50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'fraction-common-denom': {
      const [ln, ld] = diagram.left;
      const [rn, rd] = diagram.right;
      const multL = diagram.commonDen / ld;
      const multR = diagram.commonDen / rd;
      const eqL = ln * multL;
      const eqR = rn * multR;
      const sum = diagram.op === '+' ? eqL + eqR : eqL - eqR;

      return (
        <div className="w-full max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-5">
            <div className="flex flex-col items-center gap-2">
              <FractionBox
                num={String(ln)}
                den={String(ld)}
                size="xl"
                highlightTarget={highlightTarget}
              />
              {diagram.stage !== 'original' && (
                <span className="text-sm font-medium text-slate-600">
                  × {multL} arriba y abajo
                </span>
              )}
            </div>

            <span className="text-3xl font-bold text-slate-700">{diagram.op}</span>

            <div className="flex flex-col items-center gap-2">
              <FractionBox
                num={String(rn)}
                den={String(rd)}
                size="xl"
                highlightTarget={highlightTarget}
              />
              {diagram.stage !== 'original' && (
                <span className="text-sm font-medium text-slate-600">
                  × {multR} arriba y abajo
                </span>
              )}
            </div>

            {diagram.stage !== 'original' && (
              <>
                <ArrowRight className="w-7 h-7 text-slate-400" />
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-xl border border-slate-200"
                >
                  <FractionBox
                    num={String(eqL)}
                    den={String(diagram.commonDen)}
                    size="xl"
                    highlightTarget={highlightTarget}
                  />
                  <span className="text-3xl font-bold text-slate-700">{diagram.op}</span>
                  <FractionBox
                    num={String(eqR)}
                    den={String(diagram.commonDen)}
                    size="xl"
                    highlightTarget={highlightTarget}
                  />
                </motion.div>
              </>
            )}

            {diagram.stage === 'solved' && (
              <>
                <span className="text-3xl font-bold text-slate-700">=</span>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-5 py-3 rounded-xl bg-blue-50 border border-blue-200"
                >
                  <FractionBox
                    num={String(sum)}
                    den={String(diagram.commonDen)}
                    size="xl"
                    highlightTarget={highlightTarget}
                  />
                </motion.div>
              </>
            )}
          </div>

          <div className="text-center text-base text-slate-700 bg-slate-50 py-3 px-4 rounded-xl border border-slate-200">
            {diagram.stage === 'original' &&
              `Los denominadores ${ld} y ${rd} son distintos. Buscamos un número en la tabla de ambos: ${diagram.commonDen}.`}
            {diagram.stage === 'converted' &&
              `Ahora ambas fracciones hablan de partes de ${diagram.commonDen}.`}
            {diagram.stage === 'solved' &&
              `Dejamos el ${diagram.commonDen} abajo y sumamos ${eqL} + ${eqR} = ${sum} arriba.`}
          </div>
        </div>
      );
    }

    case 'fraction-flip': {
      const hiFlip = highlightTarget === 'flip';
      return (
        <div className="w-full max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-5 md:gap-7">
            <ColorMath expr={diagram.first} size="2xl" highlightTarget={highlightTarget} />
            <span className="text-3xl font-bold text-slate-500">÷</span>
            <FractionBox
              num={diagram.secondNum}
              den={diagram.secondDen}
              sign="+"
              size="xl"
              highlightTarget={highlightTarget}
            />

            <ArrowRight className="w-8 h-8 text-blue-600" />

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={`flex items-center gap-5 px-6 py-4 rounded-xl bg-blue-50/70 border transition-transform duration-300 ${
                hiFlip ? 'scale-110 ring-4 ring-blue-300 border-blue-500' : 'border-blue-200'
              }`}
            >
              <ColorMath expr={diagram.first} size="2xl" highlightTarget={highlightTarget} />
              <span className="text-3xl font-bold text-blue-700">×</span>
              <div className="flex flex-col items-center">
                <FractionBox
                  num={diagram.secondDen}
                  den={diagram.secondNum}
                  sign="+"
                  size="xl"
                  highlightTarget={highlightTarget}
                />
                <span className="text-xs font-semibold text-blue-700 mt-1">
                  Se dio vuelta
                </span>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-base">
            {diagram.signNote && (
              <span
                className={`px-4 py-2 rounded-lg font-medium transition-transform duration-300 ${
                  highlightTarget === 'neg'
                    ? 'scale-110 bg-red-100 text-red-900 ring-2 ring-red-400'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                Signos: {diagram.signNote}
              </span>
            )}
            {diagram.result && (
              <div className="px-5 py-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                <span className="text-slate-600 font-medium">Resultado:</span>
                <ColorMath expr={diagram.result} size="lg" highlightTarget={highlightTarget} />
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'power-visual': {
      const baseNum = Number(diagram.base);
      const count = !Number.isNaN(baseNum) && baseNum <= 5 ? baseNum : 3;
      const hiBase = highlightTarget === 'base' || highlightTarget === 'num';
      const hiExp = highlightTarget === 'exp';

      return (
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-start font-math">
              <span
                className={`text-6xl font-bold text-blue-700 transition-transform duration-300 ${
                  hiBase ? 'scale-125 bg-blue-100 ring-4 ring-blue-300 rounded-xl px-3' : ''
                }`}
              >
                {diagram.base}
              </span>
              <span
                className={`text-3xl font-bold text-orange-600 -mt-1 ml-1 transition-transform duration-300 ${
                  hiExp ? 'scale-150 bg-orange-100 ring-4 ring-orange-300 rounded-lg px-2' : ''
                }`}
              >
                {diagram.exp}
              </span>
            </div>
            <div className="text-base text-slate-700 space-y-2 text-center">
              <div
                className={`px-3 py-1 rounded-lg transition-transform duration-300 ${
                  hiBase ? 'scale-105 bg-blue-50 ring-2 ring-blue-300' : ''
                }`}
              >
                <strong className="text-blue-700">Base ({diagram.base})</strong>: número que se repite
              </div>
              <div
                className={`px-3 py-1 rounded-lg transition-transform duration-300 ${
                  hiExp ? 'scale-105 bg-orange-50 ring-2 ring-orange-300' : ''
                }`}
              >
                <strong className="text-orange-600">Exponente ({diagram.exp})</strong>: cuántas veces se multiplica
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-center gap-3 text-2xl font-math">
                <ColorMath
                  expr={`${diagram.expanded} = ${diagram.result}`}
                  size="xl"
                  highlightTarget={highlightTarget}
                />
              </div>
              <div
                className="grid gap-1.5 w-36 mx-auto pt-1"
                style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: count * count }).map((_, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="h-8 rounded bg-blue-600"
                  />
                ))}
              </div>
            </div>

            {diagram.warningCompare && (
              <div
                className={`p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium text-center transition-transform duration-300 ${
                  highlightTarget === 'neg' ? 'scale-105 ring-2 ring-red-300' : ''
                }`}
              >
                {diagram.warningCompare}
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'root-visual': {
      if (diagram.kind === 'square') {
        const n = diagram.rootNum;
        return (
          <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col items-center gap-4">
              <div className="text-4xl md:text-5xl font-math font-bold text-slate-900">
                √
                <span
                  className={`inline-block text-blue-700 transition-transform duration-300 ${
                    highlightTarget === 'num' ? 'scale-115 bg-blue-100 rounded-lg px-2' : ''
                  }`}
                >
                  {diagram.radicandNum}
                </span>{' '}
                ={' '}
                <span
                  className={`inline-block text-blue-700 transition-transform duration-300 ${
                    highlightTarget === 'num' ? 'scale-125 bg-blue-100 ring-2 ring-blue-400 rounded-lg px-2' : ''
                  }`}
                >
                  {diagram.rootNum}
                </span>
              </div>
              <div className="text-lg text-slate-700 font-medium">
                Porque{' '}
                <ColorMath
                  expr={`${diagram.rootNum} × ${diagram.rootNum} = ${diagram.radicandNum}`}
                  size="md"
                  highlightTarget={highlightTarget}
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div
                className="grid gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200"
                style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: n * n }).map((_, idx) => {
                  const isEdge = idx < n || idx % n === 0;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.015 }}
                      className={`w-7 h-7 rounded ${
                        isEdge ? 'bg-blue-600' : 'bg-blue-200'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-sm text-slate-600">
                Cuadrado de {n} × {n} = {diagram.radicandNum} cuadritos
              </span>
            </div>
          </div>
        );
      }

      return (
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center gap-4">
            <div className="text-4xl md:text-5xl font-math font-bold text-slate-900">
              <sup
                className={`inline-block text-orange-600 text-2xl mr-0.5 transition-transform duration-300 ${
                  highlightTarget === 'exp' ? 'scale-150 bg-orange-100 ring-2 ring-orange-400 rounded px-1' : ''
                }`}
              >
                3
              </sup>
              √<span className="text-blue-700">{diagram.radicandNum}</span> ={' '}
              <span className="text-blue-700">{diagram.rootNum}</span>
            </div>
            <div className="text-lg text-slate-700 font-medium text-center">
              Porque{' '}
              <ColorMath
                expr={`${diagram.rootNum} × ${diagram.rootNum} × ${diagram.rootNum} = ${diagram.radicandNum}`}
                size="md"
                highlightTarget={highlightTarget}
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <svg viewBox="0 0 220 210" className="w-52 h-48" role="img" aria-label="Cubo de 3 por 3 por 3">
              <polygon points="110,20 185,60 110,100 35,60" fill="#DBEAFE" stroke="#1E293B" strokeWidth="2" />
              <polygon points="35,60 110,100 110,185 35,145" fill="#93C5FD" stroke="#1E293B" strokeWidth="2" />
              <polygon points="185,60 110,100 110,185 185,145" fill="#60A5FA" stroke="#1E293B" strokeWidth="2" />
              <line x1="60" y1="47" x2="135" y2="87" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="85" y1="33" x2="160" y2="73" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="135" y1="33" x2="60" y2="73" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="160" y1="47" x2="85" y2="87" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="60" y1="73" x2="60" y2="158" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="85" y1="87" x2="85" y2="172" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="35" y1="88" x2="110" y2="128" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="35" y1="116" x2="110" y2="156" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="135" y1="87" x2="135" y2="172" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="160" y1="73" x2="160" y2="158" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="110" y1="128" x2="185" y2="88" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="110" y1="156" x2="185" y2="116" stroke="#1E293B" strokeWidth="1.2" />
            </svg>
            <span className="text-sm text-slate-600">
              Cubo de {diagram.rootNum} × {diagram.rootNum} × {diagram.rootNum} = {diagram.radicandNum} cubitos
            </span>
          </div>
        </div>
      );
    }

    case 'order-checklist': {
      const steps = [
        { num: 1, text: '1. PARÉ — miro el ejercicio completo' },
        { num: 2, text: '2. MIRO los paréntesis y corchetes' },
        { num: 3, text: '3. RESUELVO multiplicaciones y divisiones' },
        { num: 4, text: '4. RESUELVO sumas y restas' },
        { num: 5, text: '5. REVISO signos y simplificación' },
      ];
      return (
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            {steps.map((s) => {
              const active = s.num === diagram.activeStep;
              return (
                <div
                  key={s.num}
                  className={`px-4 py-2.5 rounded-xl border text-sm md:text-base transition-transform duration-300 ${
                    active
                      ? 'scale-[1.03] bg-blue-50 border-blue-400 text-blue-900 font-semibold ring-2 ring-blue-200'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {s.text}
                </div>
              );
            })}
          </div>

          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4 text-center">
            <ColorMath
              expr={diagram.expression}
              size="lg"
              highlightTarget={highlightTarget}
            />
            <p className="text-sm text-slate-700 leading-relaxed">{diagram.stepNote}</p>
          </div>
        </div>
      );
    }

    case 'monomio-parts': {
      const hiNeg = highlightTarget === 'neg';
      const hiNum = highlightTarget === 'num';
      const hiVar = highlightTarget === 'var';
      const hiExp = highlightTarget === 'exp';

      return (
        <div className="w-full max-w-3xl flex flex-col items-center gap-5 sm:gap-6">
          <div className="flex items-baseline justify-center gap-1.5 sm:gap-2 px-5 py-5 sm:px-10 sm:py-7 rounded-2xl bg-slate-50 border border-slate-200 max-w-full overflow-x-auto">
            {diagram.sign && (
              <span
                className={`inline-block font-math text-4xl sm:text-5xl md:text-6xl font-bold text-red-600 mr-1 transition-transform duration-300 ${
                  hiNeg ? 'scale-125 bg-red-100 ring-4 ring-red-300 rounded-xl px-2' : ''
                }`}
              >
                {diagram.sign}
              </span>
            )}
            <span
              className={`inline-block font-math text-4xl sm:text-5xl md:text-6xl font-bold text-blue-700 transition-transform duration-300 ${
                hiNum ? 'scale-125 bg-blue-100 ring-4 ring-blue-300 rounded-xl px-2 sm:px-3' : ''
              }`}
            >
              {diagram.coeff}
            </span>
            {diagram.vars.map((v, idx) => (
              <span key={idx} className="inline-flex items-start ml-0.5 sm:ml-1">
                <span
                  className={`inline-block font-math text-4xl sm:text-5xl md:text-6xl font-bold italic text-emerald-700 transition-transform duration-300 ${
                    hiVar
                      ? 'scale-125 bg-emerald-100 ring-4 ring-emerald-300 rounded-xl px-2 sm:px-3 not-italic'
                      : ''
                  }`}
                >
                  {v.letter}
                </span>
                {v.exp && (
                  <span
                    className={`inline-block font-math text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 -mt-1 ml-0.5 sm:ml-1 transition-transform duration-300 ${
                      hiExp ? 'scale-150 bg-orange-100 ring-4 ring-orange-300 rounded-lg px-1.5 sm:px-2' : ''
                    }`}
                  >
                    {v.exp}
                  </span>
                )}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full text-center text-sm">
            {diagram.sign && (
              <div
                className={`p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 transition-transform duration-300 ${
                  hiNeg ? 'scale-105 ring-4 ring-red-300' : ''
                }`}
              >
                <div className="font-semibold">Signo negativo</div>
                <div className="font-math text-lg font-bold mt-1">{diagram.sign}</div>
              </div>
            )}
            <div
              className={`p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 transition-transform duration-300 ${
                hiNum ? 'scale-105 ring-4 ring-blue-300' : ''
              }`}
            >
              <div className="font-semibold">Coeficiente</div>
              <div className="font-math text-lg font-bold mt-1">
                {diagram.sign ? `${diagram.sign}${diagram.coeff}` : diagram.coeff}
              </div>
            </div>
            <div
              className={`p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 transition-transform duration-300 ${
                hiVar ? 'scale-105 ring-4 ring-emerald-300' : ''
              }`}
            >
              <div className="font-semibold">Parte literal</div>
              <div className="font-math text-lg font-bold mt-1">
                {diagram.vars
                  .map((v) => `${v.letter}${v.exp && v.exp !== '1' ? `^${v.exp}` : ''}`)
                  .join('')}
              </div>
            </div>
            <div
              className={`p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 transition-transform duration-300 ${
                hiExp ? 'scale-105 ring-4 ring-orange-300' : ''
              }`}
            >
              <div className="font-semibold">Grado absoluto</div>
              <div className="font-math text-lg font-bold mt-1">{diagram.degree}</div>
            </div>
          </div>

          {diagram.note && (
            <p className="text-sm text-slate-600 text-center">{diagram.note}</p>
          )}
        </div>
      );
    }

    case 'monomio-table': {
      const rows = [
        { monomio: '5x³', coef: '5', literal: 'x³', grado: '3' },
        { monomio: '-4a²b', coef: '-4', literal: 'a²b', grado: '3 (2+1)' },
        { monomio: '7xy²', coef: '7', literal: 'xy²', grado: '3 (1+2)' },
        { monomio: '-3mn²', coef: '-3', literal: 'mn²', grado: '3 (1+2)' },
        { monomio: '8', coef: '8', literal: 'No tiene', grado: '0' },
        { monomio: '-6p²q³r', coef: '-6', literal: 'p²q³r', grado: '6 (2+3+1)' },
      ];

      return (
        <div className="w-full max-w-3xl overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-sm md:text-base">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="py-2.5 px-4 font-semibold">Monomio</th>
                <th
                  className={`py-2.5 px-4 font-semibold text-blue-700 ${
                    highlightTarget === 'num' ? 'bg-blue-100' : ''
                  }`}
                >
                  Coeficiente
                </th>
                <th
                  className={`py-2.5 px-4 font-semibold text-emerald-700 ${
                    highlightTarget === 'var' ? 'bg-emerald-100' : ''
                  }`}
                >
                  Parte literal
                </th>
                <th
                  className={`py-2.5 px-4 font-semibold text-orange-700 ${
                    highlightTarget === 'exp' ? 'bg-orange-100' : ''
                  }`}
                >
                  Grado absoluto
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, diagram.revealedRows).map((r, i) => (
                <tr
                  key={r.monomio}
                  className={`border-b border-slate-100 last:border-b-0 ${
                    i === diagram.activeRow ? 'bg-blue-50/40' : 'bg-white'
                  }`}
                >
                  <td className="py-2.5 px-4">
                    <ColorMath
                      expr={r.monomio}
                      size="md"
                      highlightTarget={highlightTarget}
                    />
                  </td>
                  <td
                    className={`py-2.5 px-4 font-math font-semibold text-blue-700 transition-transform ${
                      highlightTarget === 'num' ? 'bg-blue-50 text-lg font-bold' : ''
                    }`}
                  >
                    {r.coef}
                  </td>
                  <td
                    className={`py-2.5 px-4 font-math font-semibold text-emerald-700 transition-transform ${
                      highlightTarget === 'var' ? 'bg-emerald-50 text-lg font-bold' : ''
                    }`}
                  >
                    {r.literal}
                  </td>
                  <td
                    className={`py-2.5 px-4 font-math font-semibold text-orange-700 transition-transform ${
                      highlightTarget === 'exp' ? 'bg-orange-50 text-lg font-bold' : ''
                    }`}
                  >
                    {r.grado}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'apples-pears': {
      return (
        <div className="w-full max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2 p-5 rounded-xl bg-emerald-50/60 border border-emerald-200 min-w-[150px]">
              <div className="w-12 h-12 rounded-lg bg-emerald-600 text-white font-math font-bold flex items-center justify-center text-sm">
                x²
              </div>
              <ColorMath
                expr={diagram.leftLabel}
                size="xl"
                highlightTarget={highlightTarget}
              />
            </div>

            <span className="text-3xl font-bold text-slate-700">+</span>

            <div
              className={`flex flex-col items-center gap-2 p-5 rounded-xl border min-w-[150px] ${
                diagram.sameFamily
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-orange-50/70 border-orange-200'
              }`}
            >
              <div
                className={`w-12 h-12 font-math font-bold flex items-center justify-center text-sm text-white ${
                  diagram.sameFamily ? 'rounded-lg bg-emerald-600' : 'rounded-full bg-orange-600'
                }`}
              >
                {diagram.sameFamily ? 'x²' : 'x³'}
              </div>
              <ColorMath
                expr={diagram.rightLabel}
                size="xl"
                highlightTarget={highlightTarget}
              />
            </div>

            <ArrowRight className="w-7 h-7 text-slate-400" />

            <div
              className={`px-6 py-4 rounded-xl border ${
                diagram.sameFamily
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <ColorMath
                expr={diagram.resultLabel}
                size="xl"
                highlightTarget={highlightTarget}
              />
            </div>
          </div>

          <p className="text-center text-base font-medium text-slate-700">
            {diagram.sameFamily
              ? 'Tienen la misma forma (mismas letras y exponentes) → ¡Se pueden juntar!'
              : 'Tienen distinta forma (cambia el exponente) → No se pueden mezclar.'}
          </p>
        </div>
      );
    }

    case 'exponent-flow': {
      const isMul = diagram.mode === 'multiply';
      const resultExp = isMul ? diagram.expA + diagram.expB : diagram.expA - diagram.expB;
      const opSymbol = isMul ? '×' : '÷';
      const expOpSymbol = isMul ? '+' : '−';
      const hiNum = highlightTarget === 'num';
      const hiExp = highlightTarget === 'exp';
      const hiVar = highlightTarget === 'var';

      return (
        <div className="w-full max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center justify-center gap-4 text-3xl">
            <ColorMath
              expr={`${diagram.coeffA}${diagram.baseVar}${toSup(diagram.expA)} ${opSymbol} ${diagram.coeffB}${diagram.baseVar}${toSup(diagram.expB)} = ${diagram.coeffResult}${diagram.baseVar}${toSup(resultExp)}`}
              size="xl"
              highlightTarget={highlightTarget}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-xl bg-blue-50 border border-blue-200 transition-transform duration-300 ${
                hiNum ? 'scale-105 ring-4 ring-blue-300' : ''
              }`}
            >
              <div className="text-sm font-semibold text-blue-900 mb-1">
                Paso 1 · Números (coeficientes)
              </div>
              <div className="font-math text-xl font-bold text-blue-700">
                {diagram.coeffA} {opSymbol} {diagram.coeffB} = {diagram.coeffResult}
              </div>
            </div>

            <div
              className={`p-4 rounded-xl bg-orange-50 border border-orange-200 transition-transform duration-300 ${
                hiExp ? 'scale-105 ring-4 ring-orange-300' : ''
              }`}
            >
              <div className="text-sm font-semibold text-orange-900 mb-1">
                Paso 2 · Exponentes de la letra {diagram.baseVar}
              </div>
              <div className="font-math text-xl font-bold text-orange-700">
                {diagram.expA} {expOpSymbol} {diagram.expB} = {resultExp}
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2 transition-transform duration-300 ${
              hiVar ? 'scale-[1.03] ring-2 ring-emerald-300' : ''
            }`}
          >
            <div className="text-sm text-slate-600 font-medium">
              {isMul
                ? `Juntamos ${diagram.expA} letras "${diagram.baseVar}" con ${diagram.expB} letras "${diagram.baseVar}": quedan ${resultExp} en total.`
                : `De ${diagram.expA} letras "${diagram.baseVar}" arriba, se simplifican ${diagram.expB} de abajo: quedan ${resultExp}.`}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {Array.from({ length: diagram.expA }).map((_, i) => {
                const canceled = !isMul && i >= diagram.expA - diagram.expB;
                return (
                  <span
                    key={`a-${i}`}
                    className={`w-9 h-9 rounded-lg font-math font-bold flex items-center justify-center border transition-transform duration-300 ${
                      canceled
                        ? 'bg-red-50 border-red-200 text-red-400 line-through'
                        : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    } ${hiVar && !canceled ? 'scale-115 ring-2 ring-emerald-400' : ''}`}
                  >
                    {diagram.baseVar}
                  </span>
                );
              })}
              {isMul && (
                <>
                  <span className="px-2 text-slate-500 font-bold">×</span>
                  {Array.from({ length: diagram.expB }).map((_, i) => (
                    <span
                      key={`b-${i}`}
                      className={`w-9 h-9 rounded-lg font-math font-bold flex items-center justify-center border bg-emerald-100 border-emerald-300 text-emerald-800 transition-transform duration-300 ${
                        hiVar ? 'scale-115 ring-2 ring-emerald-400' : ''
                      }`}
                    >
                      {diagram.baseVar}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    case 'rectangle-area': {
      const hiArea = highlightTarget === 'area';
      return (
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="flex flex-col items-center">
            <div className="mb-2">
              <ColorMath
                expr={`Lado = ${diagram.widthLabel}`}
                size="lg"
                highlightTarget={highlightTarget}
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div>
                <ColorMath
                  expr={diagram.heightLabel}
                  size="lg"
                  highlightTarget={highlightTarget}
                />
              </div>
              <div
                className={`w-48 sm:w-60 h-32 sm:h-36 rounded-xl bg-blue-50 border-2 border-blue-600 flex flex-col items-center justify-center gap-1 transition-transform duration-300 ${
                  hiArea ? 'scale-105 ring-4 ring-blue-300' : ''
                }`}
              >
                <span className="text-xs sm:text-sm font-medium text-slate-600">Área</span>
                {diagram.showResult && (
                  <ColorMath
                    expr={diagram.areaLabel}
                    size="xl"
                    highlightTarget={highlightTarget}
                  />
                )}
              </div>
            </div>
          </div>

          <div
            className={`space-y-3 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 transition-transform duration-300 ${
              hiArea ? 'scale-105 ring-2 ring-blue-300' : ''
            }`}
          >
            <div className="text-sm font-semibold text-slate-700">
              Regla: Área = lado × lado
            </div>
            <div>
              <ColorMath
                expr={`Área = ${diagram.widthLabel} × ${diagram.heightLabel}`}
                size="lg"
                highlightTarget={highlightTarget}
              />
            </div>
            <div className="text-sm text-slate-600">
              3 × 2 = 6 &nbsp;·&nbsp; x² × x¹ = x³
            </div>
            <div className="pt-2 border-t border-slate-200">
              <ColorMath
                expr={`Área = ${diagram.areaLabel}`}
                size="xl"
                highlightTarget={highlightTarget}
              />
            </div>
          </div>
        </div>
      );
    }

    case 'steps-board': {
      return (
        <div className="w-full max-w-3xl space-y-2 sm:space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 sm:mb-2">
            {diagram.exerciseTag}
          </div>
          {diagram.lines.map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-1.5 sm:gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border ${
                line.focus
                  ? 'bg-blue-50/70 border-blue-200'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                {line.label && (
                  <span className="font-semibold text-xs sm:text-sm text-slate-700 min-w-[2.4rem] sm:min-w-[3.2rem] shrink-0">
                    {line.label}
                  </span>
                )}
                <ColorMath
                  expr={line.math}
                  size="md"
                  highlightTarget={highlightTarget}
                />
              </div>
              {line.note && (
                <span className="text-xs sm:text-sm text-slate-600">{line.note}</span>
              )}
            </motion.div>
          ))}
        </div>
      );
    }

    case 'practice-challenge': {
      return (
        <PracticeChallengeView
          sceneId={scene.id}
          diagram={diagram}
          highlightTarget={highlightTarget}
        />
      );
    }

    case 'final-summary': {
      const items = [
        'Puedo resolver fracciones paso a paso.',
        'Puedo identificar una potencia.',
        'Puedo reconocer una raíz.',
        'Puedo identificar un monomio.',
        'Puedo juntar monomios semejantes.',
        'Puedo multiplicar y dividir monomios.',
        'Puedo resolver un ejercicio sin apurarme.',
      ];

      return (
        <div className="w-full max-w-3xl space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {items.map((text, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-slate-800 text-sm md:text-base"
              >
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </span>
                <span>{text}</span>
              </motion.div>
            ))}
          </div>

          <div className="p-5 rounded-xl bg-blue-50/80 border border-blue-200 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-blue-800 font-semibold">
              <Sparkles className="w-5 h-5" />
              <span>Recordá siempre</span>
            </div>
            <p className="text-base md:text-lg text-slate-800 leading-relaxed max-w-2xl mx-auto">
              “Matemática no se aprende todo de una vez. Se aprende practicando, paso a paso.
              No importa cuánto tardes. Lo importante es que cada día comprendas un poquito más.
              ¡Vos podés!”
            </p>
          </div>
        </div>
      );
    }

    case 'english-cards': {
      return (
        <EnglishCardsView
          diagram={diagram}
          highlightTarget={highlightTarget}
          activeSpokenText={activeSpokenText}
          hasManualSpotlight={hasManualSpotlight}
        />
      );
    }

    case 'english-quiz': {
      return (
        <EnglishQuizView
          key={scene.id}
          sceneId={scene.id}
          diagram={diagram}
          activeSpokenText={activeSpokenText}
        />
      );
    }
  }
};

function toSup(n: number): string {
  const sups = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  return String(n)
    .split('')
    .map((d) => sups[Number(d)] ?? d)
    .join('');
}

const PracticeChallengeView: React.FC<{
  sceneId: string;
  diagram: Extract<LessonScene['diagram'], { type: 'practice-challenge' }>;
  highlightTarget: SpotlightTarget;
}> = ({ sceneId, diagram, highlightTarget }) => {
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [timerPaused, setTimerPaused] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    setSecondsLeft(15);
    setTimerPaused(false);
    setSelectedId(null);
    setShowHint(false);
    setShowSolution(false);
  }, [sceneId]);

  useEffect(() => {
    if (timerPaused || secondsLeft <= 0 || showSolution) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerPaused, secondsLeft, showSolution]);

  const selectedOption = diagram.options.find((o) => o.id === selectedId);

  const handleSelect = (opt: (typeof diagram.options)[number]) => {
    setSelectedId(opt.id);
    if (opt.isCorrect) {
      playSoftFeedbackTone('success');
      setShowSolution(true);
    } else {
      playSoftFeedbackTone('gentle');
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">
            Pausa para pensar
          </div>
          <ColorMath
            expr={diagram.promptMath}
            size="xl"
            highlightTarget={highlightTarget}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg bg-white border border-slate-200 text-sm font-math text-slate-700">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{secondsLeft}s</span>
          </div>
          <button
            type="button"
            onClick={() => setTimerPaused((p) => !p)}
            className="px-3 py-2 min-h-[44px] rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {timerPaused ? 'Reanudar reloj' : 'Pausar reloj'}
          </button>
          <button
            type="button"
            onClick={() => setSecondsLeft((s) => s + 10)}
            className="px-3 py-2 min-h-[44px] rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
          >
            +10s
          </button>
        </div>
      </div>

      <p className="text-sm sm:text-base font-medium text-slate-800">{diagram.question}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {diagram.options.map((opt) => {
          const isSelected = selectedId === opt.id;
          let style = 'bg-white border-slate-200 hover:border-blue-400 text-slate-900';
          if (isSelected && opt.isCorrect) {
            style = 'bg-emerald-50 border-emerald-500 text-emerald-900';
          } else if (isSelected && !opt.isCorrect) {
            style = 'bg-red-50 border-red-400 text-red-900';
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`p-3.5 sm:p-4 rounded-xl border-2 text-left transition-colors cursor-pointer min-h-[56px] ${style}`}
            >
              <ColorMath
                expr={opt.label}
                size="md"
                highlightTarget={highlightTarget}
              />
            </button>
          );
        })}
      </div>

      {selectedOption && (
        <div
          className={`p-4 rounded-xl border text-sm md:text-base ${
            selectedOption.isCorrect
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          {selectedOption.feedback}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => setShowHint((h) => !h)}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>{showHint ? 'Ocultar pista' : 'Ver una pista'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSolution((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer"
        >
          {showSolution ? (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>Ocultar solución</span>
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              <span>Mostrar solución paso a paso</span>
            </>
          )}
        </button>
      </div>

      {showHint && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-950">
          <strong>Pista:</strong> {diagram.hint}
        </div>
      )}

      {showSolution && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Solución paso a paso
          </div>
          {diagram.solutionSteps.map((st, idx) => (
            <div key={idx} className="text-sm md:text-base text-slate-800 flex flex-wrap items-center gap-x-1">
              {renderProseWithFractions(st)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function renderProseWithFractions(text: string): React.ReactNode {
  const parts = text.split(/([+-]?\d+\/\d+)/g);
  return parts.map((part, idx) => {
    const m = /^([+-]?)(\d+)\/(\d+)$/.exec(part);
    if (!m) {
      return <span key={idx}>{part}</span>;
    }
    const [, sign, num, den] = m;
    return (
      <span key={idx} className="inline-flex items-center mx-0.5 align-middle font-math">
        {sign && (
          <span className={`font-bold mr-0.5 ${sign === '-' ? 'text-red-600' : 'text-slate-700'}`}>
            {sign === '-' ? '−' : '+'}
          </span>
        )}
        <span className="inline-flex flex-col items-center justify-center leading-none text-[0.82em]">
          <span className="text-blue-700 font-semibold px-1 pb-[1px]">{num}</span>
          <span className="w-full h-[1.5px] bg-slate-800 rounded-full" />
          <span className="text-blue-700 font-semibold px-1 pt-[2px]">{den}</span>
        </span>
      </span>
    );
  });
}

function speakEnglishPhrase(phrase: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(phrase);
    const voices = window.speechSynthesis.getVoices();
    const enFemale = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('en') &&
        /samantha|karen|victoria|serena|aria|jenny|zira|google us english|female/i.test(v.name)
    );
    const enAny = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    if (enFemale || enAny) u.voice = (enFemale || enAny)!;
    u.lang = (enFemale || enAny)?.lang || 'en-US';
    u.rate = 0.85;
    u.pitch = 1.02;
    window.speechSynthesis.speak(u);
  } catch {
    // Ignore speech synthesis errors
  }
}

const EnglishIcon: React.FC<{ name?: string; className?: string }> = ({
  name,
  className = 'w-6 h-6 text-slate-800',
}) => {
  switch (name) {
    case 'sun':
      return <Sun className={className} />;
    case 'cloud':
      return <Cloud className={className} />;
    case 'rain':
      return <CloudRain className={className} />;
    case 'wind':
      return <Wind className={className} />;
    case 'storm':
      return <CloudLightning className={className} />;
    case 'snow':
      return <Snowflake className={className} />;
    case 'tornado':
      return <Tornado className={className} />;
    case 'flood':
      return <Waves className={className} />;
    case 'wildfire':
      return <Flame className={className} />;
    case 'volcano':
      return <Mountain className={className} />;
    case 'eye':
      return <Eye className={className} />;
    case 'book':
      return <BookOpen className={className} />;
    case 'calendar':
      return <Calendar className={className} />;
    case 'clock':
      return <Clock className={className} />;
    case 'check':
      return <Check className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    default:
      return null;
  }
};

const TONE_BOX: Record<string, string> = {
  blue: 'bg-sky-50/90 border-sky-200',
  mint: 'bg-emerald-50/85 border-emerald-200',
  peach: 'bg-amber-50/90 border-amber-200',
  lilac: 'bg-violet-50/85 border-violet-200',
  slate: 'bg-slate-50 border-slate-200',
};

function matchesEnglishRole(
  role: 'persona' | 'verbo' | 'tiempo' | 'neg' | undefined,
  target: SpotlightTarget
): boolean {
  if (!role || target === 'none') return false;
  if (role === 'persona' && target === 'num') return true;
  if (role === 'verbo' && target === 'var') return true;
  if (role === 'tiempo' && target === 'exp') return true;
  if (role === 'neg' && target === 'neg') return true;
  return false;
}

const EnglishCardsView: React.FC<{
  diagram: Extract<LessonScene['diagram'], { type: 'english-cards' }>;
  highlightTarget: SpotlightTarget;
  activeSpokenText: string;
  hasManualSpotlight: boolean;
}> = ({ diagram, highlightTarget, activeSpokenText, hasManualSpotlight }) => {
  const gridClass =
    diagram.layout === '3col'
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
      : diagram.layout === 'rows'
        ? 'grid-cols-1'
        : 'grid-cols-1 sm:grid-cols-2';

  const cardSpokenMatches = useMemo(
    () =>
      diagram.cards.map((card) =>
        doesSpokenTextMatchKeywords(
          activeSpokenText,
          card.matchPhrases || [card.title, card.meaning || '']
        )
      ),
    [diagram.cards, activeSpokenText]
  );

  const anySpokenMatched = !hasManualSpotlight && cardSpokenMatches.some(Boolean);

  const bannerMatched =
    diagram.bannerRole &&
    diagram.bannerRole !== 'neutral' &&
    hasManualSpotlight &&
    matchesEnglishRole(diagram.bannerRole, highlightTarget);

  return (
    <div className="w-full max-w-3xl space-y-4">
      {diagram.banner && (
        <div
          className={`px-4 py-3 rounded-xl border text-center font-display text-base sm:text-lg md:text-xl font-bold tracking-wide transition-transform ${
            bannerMatched
              ? 'bg-blue-100 border-blue-500 text-slate-900 scale-[1.02] shadow-sm'
              : 'bg-sky-50 border-sky-200 text-slate-900'
          }`}
        >
          {diagram.banner}
        </div>
      )}

      <div className={`grid gap-3 ${gridClass}`}>
        {diagram.cards.map((card, idx) => {
          const toneStyle = TONE_BOX[card.tone || 'blue'] || TONE_BOX.blue;
          const spokenHit = anySpokenMatched && cardSpokenMatches[idx];
          const roleHit = hasManualSpotlight && matchesEnglishRole(card.role, highlightTarget);
          const highlighted = spokenHit || roleHit;

          return (
            <div
              key={`${card.title}-${idx}`}
              className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between gap-2 transition-all duration-300 ${
                spokenHit
                  ? 'bg-amber-100/95 border-amber-500 ring-4 ring-amber-400 scale-[1.04] shadow-md opacity-100'
                  : roleHit
                    ? `${toneStyle} ring-2 ring-blue-600 scale-[1.03] shadow-sm opacity-100`
                    : anySpokenMatched
                      ? `${toneStyle} opacity-55`
                      : toneStyle
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  {card.icon && (
                    <span
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                        spokenHit
                          ? 'bg-amber-50 border-amber-400'
                          : 'bg-white/90 border-slate-200'
                      }`}
                    >
                      <EnglishIcon name={card.icon} className="w-5 h-5 text-slate-800" />
                    </span>
                  )}
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-display text-base sm:text-lg font-bold text-slate-900 tracking-wide break-words">
                      {card.title}
                    </div>
                    {card.subtitle && (
                      <div className="text-sm sm:text-base font-semibold text-blue-900">
                        {card.subtitle}
                      </div>
                    )}
                  </div>
                </div>

                {card.speakText && (
                  <button
                    type="button"
                    onClick={() => speakEnglishPhrase(card.speakText!)}
                    title={`Escuchar en inglés: ${card.speakText}`}
                    aria-label={`Escuchar en inglés: ${card.speakText}`}
                    className="min-w-[40px] min-h-[40px] px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-blue-800 inline-flex items-center justify-center gap-1 text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Oír</span>
                  </button>
                )}
              </div>

              {card.meaning && (
                <div className="text-sm sm:text-base text-slate-800 font-medium leading-snug">
                  {card.meaning}
                </div>
              )}
              {card.extra && (
                <div className="text-xs sm:text-sm font-medium text-emerald-800 pt-0.5">
                  {card.extra}
                </div>
              )}
              {highlighted && spokenHit && (
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 pt-0.5">
                  Escuchando ahora
                </div>
              )}
            </div>
          );
        })}
      </div>

      {diagram.footerTip && (
        <div className="text-center text-xs sm:text-sm font-semibold text-emerald-800 pt-1">
          {diagram.footerTip}
        </div>
      )}
    </div>
  );
};

const EnglishQuizView: React.FC<{
  sceneId: string;
  diagram: Extract<LessonScene['diagram'], { type: 'english-quiz' }>;
  activeSpokenText: string;
}> = ({ sceneId, diagram, activeSpokenText }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  useEffect(() => {
    setAnswers({});
    setShowHint(false);
    setShowAllAnswers(false);
  }, [sceneId]);

  const itemSpokenMatches = useMemo(
    () =>
      diagram.items.map((item) =>
        doesSpokenTextMatchKeywords(
          activeSpokenText,
          item.matchPhrases || [item.prompt]
        )
      ),
    [diagram.items, activeSpokenText]
  );

  const anySpokenMatched = itemSpokenMatches.some(Boolean);

  const handleChoose = (
    item: Extract<LessonScene['diagram'], { type: 'english-quiz' }>['items'][number],
    option: string
  ) => {
    setAnswers((prev) => ({ ...prev, [item.id]: option }));
    if (option === item.correctOption) {
      playSoftFeedbackTone('success');
    } else {
      playSoftFeedbackTone('gentle');
    }
  };

  const correctCount = diagram.items.filter(
    (it) => answers[it.id] === it.correctOption
  ).length;

  return (
    <div className="w-full max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm sm:text-base font-medium text-slate-800">
          {diagram.instruction}
        </p>
        <span className="text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
          Completadas: {correctCount} de {diagram.items.length}
        </span>
      </div>

      <div
        className={`grid gap-3 ${
          diagram.items.length >= 6
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2'
        }`}
      >
        {diagram.items.map((item, idx) => {
          const chosen = answers[item.id];
          const isSolved = showAllAnswers || chosen === item.correctOption;
          const isWrong = !showAllAnswers && chosen && chosen !== item.correctOption;
          const toneStyle = TONE_BOX[item.tone || 'blue'] || TONE_BOX.blue;
          const spokenHit = anySpokenMatched && itemSpokenMatches[idx];

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 space-y-3 transition-all duration-300 ${
                spokenHit
                  ? 'bg-amber-100/95 border-amber-500 ring-4 ring-amber-400 scale-[1.04] shadow-md opacity-100'
                  : isSolved
                    ? `bg-emerald-50/90 border-emerald-400 ${anySpokenMatched ? 'opacity-65' : ''}`
                    : `${toneStyle} ${anySpokenMatched ? 'opacity-60' : ''}`
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.icon && (
                    <span
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                        spokenHit ? 'bg-amber-50 border-amber-400' : 'bg-white border-slate-200'
                      }`}
                    >
                      <EnglishIcon name={item.icon} className="w-4 h-4 text-slate-800" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="font-display text-base sm:text-lg font-bold text-slate-900">
                      {item.prompt}
                    </div>
                    {item.subLabel && (
                      <div className="text-xs font-medium text-slate-600">
                        {item.subLabel}
                      </div>
                    )}
                  </div>
                </div>

                {isSolved && item.speakAfter && (
                  <button
                    type="button"
                    onClick={() => speakEnglishPhrase(item.speakAfter!)}
                    aria-label={`Escuchar frase: ${item.speakAfter}`}
                    className="min-w-[36px] min-h-[36px] rounded-lg bg-white border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {item.options.map((opt) => {
                  const activeCorrect =
                    (showAllAnswers || chosen === opt) && opt === item.correctOption;
                  const activeWrong = !showAllAnswers && chosen === opt && opt !== item.correctOption;

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChoose(item, opt)}
                      className={`flex-1 min-w-[76px] min-h-[44px] px-3 py-2 rounded-xl border-2 text-sm sm:text-base font-bold transition-colors cursor-pointer ${
                        activeCorrect
                          ? 'bg-emerald-700 border-emerald-700 text-white'
                          : activeWrong
                            ? 'bg-red-50 border-red-400 text-red-900'
                            : 'bg-white border-slate-200 hover:border-blue-400 text-slate-900'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isWrong && (
                <div className="text-xs font-medium text-amber-900">
                  Casi. Mirá la pista y probá la otra opción.
                </div>
              )}
              {isSolved && (
                <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>¡Correcto! {item.correctOption}</span>
                </div>
              )}
              {spokenHit && (
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                  Escuchando ahora
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => setShowHint((h) => !h)}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>{showHint ? 'Ocultar pista' : 'Ver una pista'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowAllAnswers((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium cursor-pointer"
        >
          {showAllAnswers ? (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>Seguir practicando</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Revisar juntas</span>
            </>
          )}
        </button>
      </div>

      {showHint && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-950">
          <strong>Pista:</strong> {diagram.hint}
        </div>
      )}
    </div>
  );
};
