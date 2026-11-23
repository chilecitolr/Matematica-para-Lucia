import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Check,
  Clock,
  HelpCircle,
  Pause,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import type { LessonScene, PedagogicalPhase } from '../types/lesson';
import { ColorMath, FractionBox } from './ColorMath';
import { playSoftFeedbackTone } from '../hooks/useNarrator';

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
  chapterTitle: string;
  chapterNumber: number;
  activityRef: string;
  isPlaying: boolean;
  showSubtitles: boolean;
  onPracticeResolved?: () => void;
}

export const VideoStage: React.FC<VideoStageProps> = ({
  scene,
  chapterTitle,
  chapterNumber,
  activityRef,
  showSubtitles,
}) => {
  return (
    <div className="relative w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Top Stage Header Bar (uncluttered, single line metadata) */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">
            Capítulo {chapterNumber}. {chapterTitle}
          </span>
          <span aria-hidden="true">·</span>
          <span>{activityRef}</span>
        </div>
        <div className="text-sm font-medium text-blue-700">
          {PHASE_LABELS[scene.phase]}
        </div>
      </div>

      {/* Main 16:9-proportioned Accessible Stage Canvas */}
      <div className="min-h-[430px] md:min-h-[480px] px-6 py-7 md:px-10 md:py-8 flex flex-col justify-between bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col justify-between gap-6"
          >
            {/* Scene Title & Key Takeaway */}
            <div className="space-y-2 max-w-3xl">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {scene.headline}
              </h2>
              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                {scene.keyMessage}
              </p>
            </div>

            {/* Central Visual Diagram Area */}
            <div className="flex-1 flex items-center justify-center py-2">
              <DiagramRenderer scene={scene} />
            </div>

            {/* Supportive Reassurance Line */}
            {scene.supportPhrase && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                <span>{scene.supportPhrase}</span>
                <span>Observá con calma</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Calm High-Contrast Subtitle Strip */}
      {showSubtitles && (
        <div className="px-6 py-4 bg-slate-900 text-slate-50 border-t border-slate-800">
          <p className="text-base md:text-[17px] leading-relaxed text-center max-w-4xl mx-auto tracking-wide">
            {scene.narration}
          </p>
        </div>
      )}
    </div>
  );
};

const DiagramRenderer: React.FC<{ scene: LessonScene }> = ({ scene }) => {
  const { diagram } = scene;

  switch (diagram.type) {
    case 'fraction-intro': {
      const anglePerSlice = 360 / diagram.total;
      const radius = 84;
      const cx = 100;
      const cy = 100;

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
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center gap-3">
            <svg viewBox="0 0 200 200" className="w-52 h-52" role="img" aria-label={diagram.caption}>
              {Array.from({ length: diagram.total }).map((_, idx) => {
                const filled = idx < diagram.slices;
                return (
                  <motion.path
                    key={idx}
                    d={makeSlicePath(idx)}
                    initial={{ opacity: 0.4, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.14, duration: 0.35 }}
                    fill={filled ? '#DBEAFE' : '#F8FAFC'}
                    stroke="#1E293B"
                    strokeWidth="2.5"
                  />
                );
              })}
            </svg>
            <span className="text-sm text-slate-600 font-medium">{diagram.caption}</span>
          </div>

          <div className="flex flex-col gap-5 items-start">
            <div className="flex items-center gap-5">
              <FractionBox
                num={String(diagram.slices)}
                den={String(diagram.total)}
                size="xl"
              />
              <div className="space-y-3 text-base">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>
                    <strong className="text-blue-700">Numerador ({diagram.slices})</strong>:
                    partes que tomamos
                  </span>
                </div>
                <div className="flex items-center gap-2">
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
        <div className="grid gap-1 w-full" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
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
            <FractionBox num={String(diagram.leftNum)} den={String(diagram.den)} size="xl" />
            <span className="text-3xl font-bold text-slate-700">{diagram.op}</span>
            <FractionBox num={String(diagram.rightNum)} den={String(diagram.den)} size="xl" />
            <span className="text-3xl font-bold text-slate-700">=</span>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="px-5 py-3 rounded-xl bg-blue-50 border border-blue-200"
            >
              <FractionBox num={String(resultNum)} den={String(diagram.den)} size="xl" />
            </motion.div>
          </div>

          <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-4">
              <span className="font-math text-sm font-semibold text-blue-700 w-14">
                {diagram.leftNum}/{diagram.den}
              </span>
              {renderBar(diagram.leftNum, diagram.den, 'bg-blue-500')}
            </div>
            <div className="flex items-center gap-4">
              <span className="font-math text-sm font-semibold text-blue-700 w-14">
                {diagram.rightNum}/{diagram.den}
              </span>
              {renderBar(diagram.rightNum, diagram.den, 'bg-sky-400')}
            </div>
            <div className="flex items-center gap-4 pt-2 border-t border-slate-200">
              <span className="font-math text-sm font-bold text-blue-800 w-14">
                Total {resultNum}/{diagram.den}
              </span>
              <div className="grid gap-1 w-full" style={{ gridTemplateColumns: `repeat(${diagram.den}, minmax(0, 1fr))` }}>
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
              <FractionBox num={String(ln)} den={String(ld)} size="xl" />
              {diagram.stage !== 'original' && (
                <span className="text-sm font-medium text-slate-600">
                  × {multL} arriba y abajo
                </span>
              )}
            </div>

            <span className="text-3xl font-bold text-slate-700">{diagram.op}</span>

            <div className="flex flex-col items-center gap-2">
              <FractionBox num={String(rn)} den={String(rd)} size="xl" />
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
                  <FractionBox num={String(eqL)} den={String(diagram.commonDen)} size="xl" />
                  <span className="text-3xl font-bold text-slate-700">{diagram.op}</span>
                  <FractionBox num={String(eqR)} den={String(diagram.commonDen)} size="xl" />
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
                  <FractionBox num={String(sum)} den={String(diagram.commonDen)} size="xl" />
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
      return (
        <div className="w-full max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-5 md:gap-7">
            <ColorMath expr={diagram.first} size="2xl" />
            <span className="text-3xl font-bold text-slate-500">÷</span>
            <FractionBox num={diagram.secondNum} den={diagram.secondDen} sign="+" size="xl" />

            <ArrowRight className="w-8 h-8 text-blue-600" />

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-5 px-6 py-4 rounded-xl bg-blue-50/70 border border-blue-200"
            >
              <ColorMath expr={diagram.first} size="2xl" />
              <span className="text-3xl font-bold text-blue-700">×</span>
              <div className="flex flex-col items-center">
                <FractionBox num={diagram.secondDen} den={diagram.secondNum} sign="+" size="xl" />
                <span className="text-xs font-semibold text-blue-700 mt-1">
                  Se dio vuelta
                </span>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-base">
            {diagram.signNote && (
              <span className="px-4 py-2 rounded-lg bg-slate-100 text-slate-800 font-medium">
                Signos: {diagram.signNote}
              </span>
            )}
            {diagram.result && (
              <div className="px-5 py-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                <span className="text-slate-600 font-medium">Resultado:</span>
                <ColorMath expr={diagram.result} size="lg" />
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'power-visual': {
      const baseNum = Number(diagram.base);
      const count = !Number.isNaN(baseNum) && baseNum <= 5 ? baseNum : 3;

      return (
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-start font-math">
              <span className="text-6xl font-bold text-blue-700">{diagram.base}</span>
              <span className="text-3xl font-bold text-orange-600 -mt-1 ml-1">
                {diagram.exp}
              </span>
            </div>
            <div className="text-base text-slate-700 space-y-1 text-center">
              <div>
                <strong className="text-blue-700">Base ({diagram.base})</strong>: número que se repite
              </div>
              <div>
                <strong className="text-orange-600">Exponente ({diagram.exp})</strong>: cuántas veces se multiplica
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-center gap-3 text-2xl font-math">
                <ColorMath expr={`${diagram.expanded} = ${diagram.result}`} size="xl" />
              </div>
              {/* Visual 3x3 square grid */}
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
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium text-center">
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
                √<span className="text-blue-700">{diagram.radicandNum}</span> ={' '}
                <span className="text-blue-700">{diagram.rootNum}</span>
              </div>
              <div className="text-lg text-slate-700 font-medium">
                Porque{' '}
                <ColorMath expr={`${diagram.rootNum} × ${diagram.rootNum} = ${diagram.radicandNum}`} size="md" />
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

      // Cube visual (3x3x3 = 27)
      return (
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center gap-4">
            <div className="text-4xl md:text-5xl font-math font-bold text-slate-900">
              <sup className="text-orange-600 text-2xl mr-0.5">3</sup>√
              <span className="text-blue-700">{diagram.radicandNum}</span> ={' '}
              <span className="text-blue-700">{diagram.rootNum}</span>
            </div>
            <div className="text-lg text-slate-700 font-medium text-center">
              Porque{' '}
              <ColorMath
                expr={`${diagram.rootNum} × ${diagram.rootNum} × ${diagram.rootNum} = ${diagram.radicandNum}`}
                size="md"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <svg viewBox="0 0 220 210" className="w-52 h-48" role="img" aria-label="Cubo de 3 por 3 por 3">
              {/* Isometric 3x3x3 cube */}
              <polygon points="110,20 185,60 110,100 35,60" fill="#DBEAFE" stroke="#1E293B" strokeWidth="2" />
              <polygon points="35,60 110,100 110,185 35,145" fill="#93C5FD" stroke="#1E293B" strokeWidth="2" />
              <polygon points="185,60 110,100 110,185 185,145" fill="#60A5FA" stroke="#1E293B" strokeWidth="2" />
              {/* 3x3 grid lines on top */}
              <line x1="60" y1="47" x2="135" y2="87" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="85" y1="33" x2="160" y2="73" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="135" y1="33" x2="60" y2="73" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="160" y1="47" x2="85" y2="87" stroke="#1E293B" strokeWidth="1.2" />
              {/* Front-left grid lines */}
              <line x1="60" y1="73" x2="60" y2="158" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="85" y1="87" x2="85" y2="172" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="35" y1="88" x2="110" y2="128" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="35" y1="116" x2="110" y2="156" stroke="#1E293B" strokeWidth="1.2" />
              {/* Front-right grid lines */}
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
                  className={`px-4 py-2.5 rounded-xl border text-sm md:text-base transition-colors ${
                    active
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {s.text}
                </div>
              );
            })}
          </div>

          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4 text-center">
            <ColorMath expr={diagram.expression} size="lg" />
            <p className="text-sm text-slate-700 leading-relaxed">{diagram.stepNote}</p>
          </div>
        </div>
      );
    }

    case 'monomio-parts': {
      return (
        <div className="w-full max-w-3xl flex flex-col items-center gap-6">
          <div className="flex items-baseline justify-center gap-1 px-8 py-6 rounded-2xl bg-slate-50 border border-slate-200">
            {diagram.sign && (
              <span className="font-math text-6xl font-bold text-red-600 mr-1">
                {diagram.sign}
              </span>
            )}
            <span className="font-math text-6xl font-bold text-blue-700">
              {diagram.coeff}
            </span>
            {diagram.vars.map((v, idx) => (
              <span key={idx} className="inline-flex items-start ml-1">
                <span className="font-math text-6xl font-bold italic text-emerald-700">
                  {v.letter}
                </span>
                {v.exp && (
                  <span className="font-math text-3xl font-bold text-orange-600 -mt-1 ml-0.5">
                    {v.exp}
                  </span>
                )}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full text-center text-sm">
            {diagram.sign && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
                <div className="font-semibold">Signo negativo</div>
                <div className="font-math text-lg font-bold mt-1">{diagram.sign}</div>
              </div>
            )}
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
              <div className="font-semibold">Coeficiente</div>
              <div className="font-math text-lg font-bold mt-1">
                {diagram.sign ? `${diagram.sign}${diagram.coeff}` : diagram.coeff}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <div className="font-semibold">Parte literal</div>
              <div className="font-math text-lg font-bold mt-1">
                {diagram.vars.map((v) => `${v.letter}${v.exp && v.exp !== '1' ? `^${v.exp}` : ''}`).join('')}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-900">
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
                <th className="py-2.5 px-4 font-semibold text-blue-700">Coeficiente</th>
                <th className="py-2.5 px-4 font-semibold text-emerald-700">Parte literal</th>
                <th className="py-2.5 px-4 font-semibold text-orange-700">Grado absoluto</th>
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
                    <ColorMath expr={r.monomio} size="md" />
                  </td>
                  <td className="py-2.5 px-4 font-math font-semibold text-blue-700">
                    {r.coef}
                  </td>
                  <td className="py-2.5 px-4 font-math font-semibold text-emerald-700">
                    {r.literal}
                  </td>
                  <td className="py-2.5 px-4 font-math font-semibold text-orange-700">
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
              <ColorMath expr={diagram.leftLabel} size="xl" />
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
              <ColorMath expr={diagram.rightLabel} size="xl" />
            </div>

            <ArrowRight className="w-7 h-7 text-slate-400" />

            <div
              className={`px-6 py-4 rounded-xl border ${
                diagram.sameFamily
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <ColorMath expr={diagram.resultLabel} size="xl" />
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

      return (
        <div className="w-full max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center justify-center gap-4 text-3xl">
            <ColorMath
              expr={`${diagram.coeffA}${diagram.baseVar}${toSup(diagram.expA)} ${opSymbol} ${diagram.coeffB}${diagram.baseVar}${toSup(diagram.expB)} = ${diagram.coeffResult}${diagram.baseVar}${toSup(resultExp)}`}
              size="xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="text-sm font-semibold text-blue-900 mb-1">
                Paso 1 · Números (coeficientes)
              </div>
              <div className="font-math text-xl font-bold text-blue-700">
                {diagram.coeffA} {opSymbol} {diagram.coeffB} = {diagram.coeffResult}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
              <div className="text-sm font-semibold text-orange-900 mb-1">
                Paso 2 · Exponentes de la letra {diagram.baseVar}
              </div>
              <div className="font-math text-xl font-bold text-orange-700">
                {diagram.expA} {expOpSymbol} {diagram.expB} = {resultExp}
              </div>
            </div>
          </div>

          {/* Visual block expansion of x's */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
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
                    className={`w-9 h-9 rounded-lg font-math font-bold flex items-center justify-center border ${
                      canceled
                        ? 'bg-red-50 border-red-200 text-red-400 line-through'
                        : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    }`}
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
                      className="w-9 h-9 rounded-lg font-math font-bold flex items-center justify-center border bg-emerald-100 border-emerald-300 text-emerald-800"
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
      return (
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center">
            <div className="mb-2">
              <ColorMath expr={`Lado = ${diagram.widthLabel}`} size="lg" />
            </div>
            <div className="flex items-center gap-3">
              <div className="-rotate-0">
                <ColorMath expr={diagram.heightLabel} size="lg" />
              </div>
              <div className="w-60 h-36 rounded-xl bg-blue-50 border-2 border-blue-600 flex flex-col items-center justify-center gap-1">
                <span className="text-sm font-medium text-slate-600">Área</span>
                {diagram.showResult && (
                  <ColorMath expr={diagram.areaLabel} size="xl" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 p-5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-sm font-semibold text-slate-700">
              Regla: Área = lado × lado
            </div>
            <div>
              <ColorMath
                expr={`Área = ${diagram.widthLabel} × ${diagram.heightLabel}`}
                size="lg"
              />
            </div>
            <div className="text-sm text-slate-600">
              3 × 2 = 6 &nbsp;·&nbsp; x² × x¹ = x³
            </div>
            <div className="pt-2 border-t border-slate-200">
              <ColorMath expr={`Área = ${diagram.areaLabel}`} size="xl" />
            </div>
          </div>
        </div>
      );
    }

    case 'steps-board': {
      return (
        <div className="w-full max-w-3xl space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            {diagram.exerciseTag}
          </div>
          {diagram.lines.map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border ${
                line.focus
                  ? 'bg-blue-50/70 border-blue-200'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-baseline gap-3">
                {line.label && (
                  <span className="font-semibold text-slate-700 min-w-[3.2rem]">
                    {line.label}
                  </span>
                )}
                <ColorMath expr={line.math} size="md" />
              </div>
              {line.note && (
                <span className="text-xs md:text-sm text-slate-600">{line.note}</span>
              )}
            </motion.div>
          ))}
        </div>
      );
    }

    case 'practice-challenge': {
      return <PracticeChallengeView sceneId={scene.id} diagram={diagram} />;
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
}> = ({ sceneId, diagram }) => {
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
    <div className="w-full max-w-3xl space-y-5">
      {/* Calm pause timer & expression */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">
            Pausa para pensar
          </div>
          <ColorMath expr={diagram.promptMath} size="xl" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-math text-slate-700">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{secondsLeft}s</span>
          </div>
          <button
            type="button"
            onClick={() => setTimerPaused((p) => !p)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {timerPaused ? 'Reanudar reloj' : 'Pausar reloj'}
          </button>
          <button
            type="button"
            onClick={() => setSecondsLeft((s) => s + 10)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
          >
            +10s
          </button>
        </div>
      </div>

      <p className="text-base font-medium text-slate-800">{diagram.question}</p>

      {/* Interactive Options */}
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
              className={`p-4 rounded-xl border-2 text-left transition-colors cursor-pointer min-h-[56px] ${style}`}
            >
              <ColorMath expr={opt.label} size="md" />
            </button>
          );
        })}
      </div>

      {/* Gentle Feedback */}
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

      {/* Action Buttons: Hint + Slow Solution Reveal */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowHint((h) => !h)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>{showHint ? 'Ocultar pista' : 'Ver una pista'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSolution((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer"
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
            <div key={idx} className="text-sm md:text-base text-slate-800">
              {st}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
