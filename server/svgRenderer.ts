import type { Chapter, LessonScene, PedagogicalPhase } from '../src/types/lesson.ts';
import {
  doesSpokenTextMatchKeywords,
  splitNarrationCues,
  splitSpokenClauses,
  type SpotlightTarget,
} from '../src/utils/spotlightCues.ts';

const PHASE_LABELS: Record<PedagogicalPhase, string> = {
  concepto: 'Comprendemos la idea',
  'que-pide': '1. ¿Qué me pide el ejercicio?',
  datos: '2. ¿Qué datos tengo?',
  operacion: '3. ¿Qué operación realizo?',
  regla: '4. La regla que necesito',
  paso: '5. Un paso a la vez',
  resultado: '6. Resultado',
  comprobar: '7. Comprobamos si tiene sentido',
  practica: '8. ¡Ahora probá vos!',
  cierre: 'Resumen del recorrido',
};

const SUP_MAP: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
};

const SPANISH_WORDS = new Set([
  'Semejantes',
  'semejantes',
  'Grupo',
  'Solo',
  'Grados',
  'Ejemplos',
  'gr',
  'cte',
  'neg',
  'nulo',
  'NO',
  'son',
  'Quedan',
  'separados',
  'y',
  'Área',
  'Lado',
]);

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if (!current) {
      current = w;
    } else if (current.length + 1 + w.length <= maxChars) {
      current += ' ' + w;
    } else {
      lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Renders a math expression inside SVG with the 4-color code and enlarges tokens matching spotlight.
 */
function renderColorMathTspans(
  expr: string,
  baseFontSize: number,
  spotlight: SpotlightTarget = 'none'
): string {
  const tokens: Array<{ value: string; kind: 'num' | 'var' | 'exp' | 'neg' | 'op' | 'word' }> = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];
    if (SUP_MAP[ch]) {
      let sup = '';
      while (i < expr.length && SUP_MAP[expr[i]]) {
        sup += SUP_MAP[expr[i]];
        i++;
      }
      tokens.push({ value: sup, kind: 'exp' });
      continue;
    }
    if (/\d/.test(ch)) {
      let num = '';
      while (i < expr.length && /\d/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push({ value: num, kind: 'num' });
      continue;
    }
    if (/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(ch)) {
      let letters = '';
      while (i < expr.length && /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(expr[i])) {
        letters += expr[i];
        i++;
      }
      if (SPANISH_WORDS.has(letters) || expr[i] === ':') {
        tokens.push({ value: letters, kind: 'word' });
      } else {
        tokens.push({ value: letters, kind: 'var' });
      }
      continue;
    }
    if (ch === '-' || ch === '−') {
      tokens.push({ value: '−', kind: 'neg' });
      i++;
      continue;
    }
    tokens.push({ value: ch, kind: 'op' });
    i++;
  }

  return tokens
    .map((t) => {
      if (t.kind === 'num') {
        const hi = spotlight === 'num' || spotlight === 'base';
        const fs = hi ? Math.round(baseFontSize * 1.28) : baseFontSize;
        return `<tspan fill="#1D4ED8" font-family="JetBrains Mono, monospace" font-weight="700" font-size="${fs}">${esc(t.value)}</tspan>`;
      }
      if (t.kind === 'var') {
        const hi = spotlight === 'var';
        const fs = hi ? Math.round(baseFontSize * 1.32) : baseFontSize;
        return `<tspan fill="#15803D" font-family="JetBrains Mono, monospace" font-weight="700" font-style="${hi ? 'normal' : 'italic'}" font-size="${fs}">${esc(t.value)}</tspan>`;
      }
      if (t.kind === 'exp') {
        const hi = spotlight === 'exp';
        const fs = hi ? Math.round(baseFontSize * 0.92) : Math.round(baseFontSize * 0.65);
        const dy = Math.round(baseFontSize * 0.35);
        return `<tspan fill="#C2410C" font-family="JetBrains Mono, monospace" font-weight="700" font-size="${fs}" dy="${-dy}">${esc(t.value)}</tspan><tspan dy="${dy}" font-size="${baseFontSize}">&#8203;</tspan>`;
      }
      if (t.kind === 'neg') {
        const hi = spotlight === 'neg';
        const fs = hi ? Math.round(baseFontSize * 1.35) : baseFontSize;
        return `<tspan fill="#DC2626" font-family="JetBrains Mono, monospace" font-weight="700" font-size="${fs}">${esc(t.value)}</tspan>`;
      }
      if (t.kind === 'word') {
        return `<tspan fill="#334155" font-family="Noto Sans, sans-serif" font-weight="600" font-size="${Math.round(baseFontSize * 0.85)}">${esc(t.value)}</tspan>`;
      }
      return `<tspan fill="#475569" font-family="JetBrains Mono, monospace" font-size="${baseFontSize}">${esc(t.value)}</tspan>`;
    })
    .join('');
}

function renderVerticalFractionSvg(
  cx: number,
  cy: number,
  num: string,
  den: string,
  scale = 1,
  spotlight: SpotlightTarget = 'none'
): string {
  const hiNum = spotlight === 'numerador' || spotlight === 'num';
  const hiDen = spotlight === 'denominador' || spotlight === 'num';
  const numFs = Math.round((hiNum ? 48 : 38) * scale);
  const denFs = Math.round((hiDen ? 48 : 38) * scale);
  const w = Math.max(46, Math.max(num.length, den.length) * 24) * scale;

  return `
    ${hiNum ? `<rect x="${cx - w / 2 - 8}" y="${cy - 54 * scale}" width="${w + 16}" height="${48 * scale}" rx="10" fill="#DBEAFE" stroke="#3B82F6" stroke-width="2"/>` : ''}
    <text x="${cx}" y="${cy - 14 * scale}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="${numFs}" font-weight="700" fill="#1D4ED8">${esc(num)}</text>
    <line x1="${cx - w / 2}" y1="${cy}" x2="${cx + w / 2}" y2="${cy}" stroke="#0F172A" stroke-width="${Math.max(3, 3.5 * scale)}" stroke-linecap="round"/>
    ${hiDen ? `<rect x="${cx - w / 2 - 8}" y="${cy + 6 * scale}" width="${w + 16}" height="${48 * scale}" rx="10" fill="#DBEAFE" stroke="#3B82F6" stroke-width="2"/>` : ''}
    <text x="${cx}" y="${cy + 38 * scale}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="${denFs}" font-weight="700" fill="#1D4ED8">${esc(den)}</text>
  `;
}

function renderInlineMathWithFractionsSvg(
  expr: string,
  x: number,
  cy: number,
  fontSize: number,
  spotlight: SpotlightTarget = 'none',
  anchor: 'start' | 'middle' | 'end' = 'start'
): string {
  const fracRegex =
    /\(([^()]+)\)\s*\/\s*\(([^()]+)\)|\(([^()]+)\)\s*\/\s*([0-9a-zA-Z⁰¹²³⁴⁵⁶⁷⁸⁹]+)|([0-9a-zA-Z⁰¹²³⁴⁵⁶⁷⁸⁹]+)\/([0-9a-zA-Z⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g;

  type Seg = { kind: 'text'; value: string; w: number } | { kind: 'frac'; num: string; den: string; w: number };
  const segments: Seg[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const fracFs = Math.max(12, Math.round(fontSize * 0.72));

  while ((match = fracRegex.exec(expr)) !== null) {
    if (match.index > lastIndex) {
      const val = expr.slice(lastIndex, match.index);
      segments.push({ kind: 'text', value: val, w: val.length * fontSize * 0.56 });
    }
    const num = match[1] ?? match[3] ?? match[5];
    const den = match[2] ?? match[4] ?? match[6];
    const barW = Math.max(22, Math.max(num.length, den.length) * fracFs * 0.62 + 10);
    segments.push({ kind: 'frac', num, den, w: barW + Math.round(fontSize * 0.35) });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < expr.length) {
    const val = expr.slice(lastIndex);
    segments.push({ kind: 'text', value: val, w: val.length * fontSize * 0.56 });
  }

  const hasFrac = segments.some((s) => s.kind === 'frac');
  if (!hasFrac) {
    const anchorAttr = anchor === 'middle' ? ' text-anchor="middle"' : anchor === 'end' ? ' text-anchor="end"' : '';
    return `<text x="${x}" y="${cy + Math.round(fontSize * 0.32)}"${anchorAttr} font-size="${fontSize}">${renderColorMathTspans(expr, fontSize, spotlight)}</text>`;
  }

  const totalW = segments.reduce((acc, s) => acc + s.w, 0);
  let cursorX = anchor === 'middle' ? x - totalW / 2 : anchor === 'end' ? x - totalW : x;

  return segments
    .map((seg) => {
      if (seg.kind === 'text') {
        const tx = cursorX;
        cursorX += seg.w;
        return `<text x="${Math.round(tx)}" y="${cy + Math.round(fontSize * 0.3)}" font-size="${fontSize}">${renderColorMathTspans(seg.value, fontSize, spotlight)}</text>`;
      }
      const cx = Math.round(cursorX + seg.w / 2);
      const barW = Math.round(seg.w - fontSize * 0.35);
      cursorX += seg.w;
      return `
        <text x="${cx}" y="${cy - Math.round(fontSize * 0.25)}" text-anchor="middle" font-size="${fracFs}">${renderColorMathTspans(seg.num, fracFs, spotlight)}</text>
        <line x1="${cx - Math.round(barW / 2)}" y1="${cy}" x2="${cx + Math.round(barW / 2)}" y2="${cy}" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
        <text x="${cx}" y="${cy + Math.round(fontSize * 0.72)}" text-anchor="middle" font-size="${fracFs}">${renderColorMathTspans(seg.den, fracFs, spotlight)}</text>
      `;
    })
    .join('');
}

export interface FramePlan {
  svg: string;
  durationShare: number;
  extraPauseSeconds?: number;
}

/**
 * Generates progressive 1280x720 SVG frames synchronized with spoken spotlight cues.
 */
export function buildSceneSvgFrames(
  chapter: Chapter,
  scene: LessonScene
): FramePlan[] {
  const d = scene.diagram;

  if (d.type === 'steps-board' && d.lines.length > 1) {
    const count = d.lines.length;
    const cues = splitNarrationCues(scene.narration);
    const frames: FramePlan[] = [];
    for (let step = 1; step <= count; step++) {
      const midRatio = (step - 0.5) / count;
      const cue = cues.find((c) => midRatio >= c.startRatio && midRatio <= c.endRatio);
      frames.push({
        svg: renderSingleFrame(chapter, scene, {
          stepsReveal: step,
          spotlight: cue?.target || 'none',
          spotlightLabel: cue?.label || '',
          activeSentence: cue?.text,
        }),
        durationShare: 1 / count,
      });
    }
    return frames;
  }

  if (d.type === 'practice-challenge') {
    return [
      {
        svg: renderSingleFrame(chapter, scene, { practiceReveal: false }),
        durationShare: 0.65,
        extraPauseSeconds: 10,
      },
      {
        svg: renderSingleFrame(chapter, scene, { practiceReveal: true }),
        durationShare: 0.35,
      },
    ];
  }

  if (d.type === 'english-quiz') {
    const clauses = splitSpokenClauses(scene.narration);
    const getItemKey = (text: string) =>
      d.items
        .map((it, idx) =>
          doesSpokenTextMatchKeywords(text, it.matchPhrases || [it.prompt]) ? idx : -1
        )
        .filter((i) => i >= 0)
        .join(',');

    const grouped: Array<{ key: string; startSpeech: number; endSpeech: number; text: string }> = [];
    for (const cl of clauses) {
      const key = getItemKey(cl.text);
      const prev = grouped[grouped.length - 1];
      if (prev && (prev.key === key || grouped.length >= 12)) {
        prev.endSpeech = cl.endRatio;
        prev.text = `${prev.text} ${cl.text}`.trim();
      } else {
        grouped.push({ key, startSpeech: cl.startRatio, endSpeech: cl.endRatio, text: cl.text });
      }
    }

    if (grouped.length > 0) {
      const frames: FramePlan[] = grouped.map((seg, idx) => {
        const audioStart = idx === 0 ? 0 : 0.02 + seg.startSpeech * 0.94;
        const audioEnd = idx === grouped.length - 1 ? 1 : 0.02 + seg.endSpeech * 0.94;
        return {
          svg: renderSingleFrame(chapter, scene, {
            practiceReveal: false,
            activeSentence: seg.text,
          }),
          durationShare: Math.max(0.01, audioEnd - audioStart),
        };
      });
      // Pause to think + reveal answers cleanly afterward
      frames.push({
        svg: renderSingleFrame(chapter, scene, { practiceReveal: false }),
        durationShare: 0,
        extraPauseSeconds: 8,
      });
      frames.push({
        svg: renderSingleFrame(chapter, scene, { practiceReveal: true }),
        durationShare: 0,
        extraPauseSeconds: 4.5,
      });
      return frames;
    }

    return [
      {
        svg: renderSingleFrame(chapter, scene, { practiceReveal: false }),
        durationShare: 0.65,
        extraPauseSeconds: 10,
      },
      {
        svg: renderSingleFrame(chapter, scene, { practiceReveal: true }),
        durationShare: 0.35,
      },
    ];
  }

  if (d.type === 'english-cards') {
    const clauses = splitSpokenClauses(scene.narration);
    const cues = splitNarrationCues(scene.narration);
    const getMatchKey = (text: string) =>
      d.cards
        .map((card, idx) =>
          doesSpokenTextMatchKeywords(text, card.matchPhrases || [card.title, card.meaning || ''])
            ? idx
            : -1
        )
        .filter((i) => i >= 0)
        .join(',');

    const grouped: Array<{ key: string; startSpeech: number; endSpeech: number; text: string; sentIdx: number }> = [];
    for (const cl of clauses) {
      const key = getMatchKey(cl.text);
      const prev = grouped[grouped.length - 1];
      if (prev && (prev.key === key || grouped.length >= 14)) {
        prev.endSpeech = cl.endRatio;
        prev.text = `${prev.text} ${cl.text}`.trim();
      } else {
        grouped.push({
          key,
          startSpeech: cl.startRatio,
          endSpeech: cl.endRatio,
          text: cl.text,
          sentIdx: cl.sentenceIndex,
        });
      }
    }

    if (grouped.length > 0) {
      return grouped.map((seg, idx) => {
        const cue = cues[seg.sentIdx];
        const audioStart = idx === 0 ? 0 : 0.02 + seg.startSpeech * 0.94;
        const audioEnd = idx === grouped.length - 1 ? 1 : 0.02 + seg.endSpeech * 0.94;
        return {
          svg: renderSingleFrame(chapter, scene, {
            spotlight: cue?.target || 'none',
            spotlightLabel: '',
            activeSentence: seg.text,
          }),
          durationShare: Math.max(0.01, audioEnd - audioStart),
        };
      });
    }
  }

  // Merge consecutive spoken sentences that share the same spotlight target (cap to <= 5 frames per scene)
  const cues = splitNarrationCues(scene.narration);
  const merged: Array<{ target: SpotlightTarget; label: string; share: number; text: string }> = [];
  for (const c of cues) {
    const share = c.endRatio - c.startRatio;
    const prev = merged[merged.length - 1];
    if (prev && (prev.target === c.target || merged.length >= 5)) {
      prev.share += share;
      prev.text = c.text;
      if (prev.target === 'none' && c.target !== 'none') {
        prev.target = c.target;
        prev.label = c.label;
      }
    } else {
      merged.push({ target: c.target, label: c.label, share, text: c.text });
    }
  }

  if (merged.length <= 1) {
    const only = merged[0];
    return [
      {
        svg: renderSingleFrame(chapter, scene, {
          spotlight: only?.target || 'none',
          spotlightLabel: only?.label || '',
        }),
        durationShare: 1,
      },
    ];
  }

  return merged.map((seg) => ({
    svg: renderSingleFrame(chapter, scene, {
      spotlight: seg.target,
      spotlightLabel: seg.label,
      activeSentence: seg.text,
    }),
    durationShare: seg.share,
  }));
}

function renderSingleFrame(
  chapter: Chapter,
  scene: LessonScene,
  opts: {
    stepsReveal?: number;
    practiceReveal?: boolean;
    spotlight?: SpotlightTarget;
    spotlightLabel?: string;
    activeSentence?: string;
  }
): string {
  const spotlight = opts.spotlight || 'none';
  const keyLines = wrapText(scene.keyMessage, 74).slice(0, 2);
  const subtitleSource = opts.activeSentence || scene.narration;
  const subLines = wrapText(subtitleSource, 90).slice(0, 3);

  const diagramContent = renderDiagramSvg(scene, { ...opts, spotlight });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="1280" height="720" fill="#F8FAFC"/>
  <rect x="36" y="24" width="1208" height="572" rx="18" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>

  <!-- Top Stage Header -->
  <rect x="36" y="24" width="1208" height="54" rx="18" fill="#F1F5F9"/>
  <rect x="36" y="60" width="1208" height="18" fill="#F1F5F9"/>
  <line x1="36" y1="78" x2="1244" y2="78" stroke="#E2E8F0" stroke-width="1.5"/>

  <text x="64" y="57" font-family="Noto Sans, sans-serif" font-size="18" font-weight="700" fill="#0F172A">
    Capítulo ${chapter.number}. ${esc(chapter.title)}   ·   ${esc(chapter.activityRef)}
  </text>
  <text x="1216" y="57" text-anchor="end" font-family="Noto Sans, sans-serif" font-size="18" font-weight="700" fill="#1D4ED8">
    ${esc(PHASE_LABELS[scene.phase])}
  </text>

  <!-- Headline & Key Message -->
  <text x="68" y="124" font-family="Noto Sans, sans-serif" font-size="31" font-weight="700" fill="#0F172A">
    ${esc(scene.headline)}
  </text>
  ${
    opts.spotlightLabel
      ? `<rect x="820" y="96" width="396" height="36" rx="10" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.5"/>
         <text x="1018" y="120" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="16" font-weight="700" fill="#0F172A">${esc(opts.spotlightLabel)}</text>`
      : ''
  }
  ${keyLines
    .map(
      (line, idx) =>
        `<text x="68" y="${158 + idx * 27}" font-family="Noto Sans, sans-serif" font-size="20" fill="#334155">${esc(line)}</text>`
    )
    .join('\n  ')}

  <!-- Main Diagram Area -->
  <g transform="translate(0, 0)">
    ${diagramContent}
  </g>

  <!-- Mini 4-Color Legend Bar -->
  <g transform="translate(68, 560)">
    <rect x="0" y="0" width="14" height="14" rx="3" fill="#1D4ED8"/>
    <text x="22" y="12" font-family="Noto Sans, sans-serif" font-size="14" font-weight="${spotlight === 'num' ? '700' : '600'}" fill="${spotlight === 'num' ? '#1D4ED8' : '#475569'}">Números</text>

    <rect x="112" y="0" width="14" height="14" rx="3" fill="#15803D"/>
    <text x="134" y="12" font-family="Noto Sans, sans-serif" font-size="14" font-weight="${spotlight === 'var' ? '700' : '600'}" fill="${spotlight === 'var' ? '#15803D' : '#475569'}">Letras</text>

    <rect x="208" y="0" width="14" height="14" rx="3" fill="#C2410C"/>
    <text x="230" y="12" font-family="Noto Sans, sans-serif" font-size="14" font-weight="${spotlight === 'exp' ? '700' : '600'}" fill="${spotlight === 'exp' ? '#C2410C' : '#475569'}">Exponentes</text>

    <rect x="342" y="0" width="14" height="14" rx="3" fill="#DC2626"/>
    <text x="364" y="12" font-family="Noto Sans, sans-serif" font-size="14" font-weight="${spotlight === 'neg' ? '700' : '600'}" fill="${spotlight === 'neg' ? '#DC2626' : '#475569'}">Signos (−)</text>

    <text x="1144" y="12" text-anchor="end" font-family="Noto Sans, sans-serif" font-size="14" font-weight="600" fill="#64748B">Adaptado para Lucía · Con amor, su papá!!</text>
  </g>

  <!-- Subtitle Strip -->
  <rect x="0" y="612" width="1280" height="108" fill="#0F172A"/>
  ${subLines
    .map(
      (line, idx) =>
        `<text x="640" y="${646 + idx * 26}" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="19" fill="#F8FAFC">${esc(line)}</text>`
    )
    .join('\n  ')}
</svg>`;
}

function renderDiagramSvg(
  scene: LessonScene,
  opts: { stepsReveal?: number; practiceReveal?: boolean; spotlight: SpotlightTarget; activeSentence?: string }
): string {
  const d = scene.diagram;
  const sp = opts.spotlight;

  switch (d.type) {
    case 'fraction-intro': {
      const cx = 330;
      const cy = 365;
      const r = 115;
      const angle = 360 / d.total;
      const hiNum = sp === 'numerador';
      const hiDen = sp === 'denominador';

      const slicesSvg = Array.from({ length: d.total })
        .map((_, idx) => {
          const a1 = ((idx * angle - 90) * Math.PI) / 180;
          const a2 = (((idx + 1) * angle - 90) * Math.PI) / 180;
          const x1 = cx + r * Math.cos(a1);
          const y1 = cy + r * Math.sin(a1);
          const x2 = cx + r * Math.cos(a2);
          const y2 = cy + r * Math.sin(a2);
          const large = angle > 180 ? 1 : 0;
          const fill = idx < d.slices ? (hiNum ? '#93C5FD' : '#DBEAFE') : (hiDen ? '#E2E8F0' : '#F8FAFC');
          return `<path d="M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${fill}" stroke="${hiDen ? '#1D4ED8' : '#1E293B'}" stroke-width="${hiDen ? '4' : '3'}"/>`;
        })
        .join('\n');

      return `
        ${slicesSvg}
        <text x="${cx}" y="512" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="18" fill="#475569">${esc(d.caption)}</text>
        ${renderVerticalFractionSvg(620, 360, String(d.slices), String(d.total), 1.4, sp)}
        <rect x="692" y="302" width="510" height="44" rx="10" fill="${hiNum ? '#EFF6FF' : 'none'}" stroke="${hiNum ? '#3B82F6' : 'none'}" stroke-width="2"/>
        <text x="704" y="332" font-family="Noto Sans, sans-serif" font-size="${hiNum ? 24 : 21}" font-weight="700" fill="#1D4ED8">→ Numerador (${d.slices}): partes que tomamos</text>
        <rect x="692" y="378" width="510" height="44" rx="10" fill="${hiDen ? '#EFF6FF' : 'none'}" stroke="${hiDen ? '#3B82F6' : 'none'}" stroke-width="2"/>
        <text x="704" y="408" font-family="Noto Sans, sans-serif" font-size="${hiDen ? 24 : 21}" font-weight="700" fill="#1D4ED8">→ Denominador (${d.total}): partes iguales del entero</text>
      `;
    }

    case 'fraction-add-same': {
      const resultNum = d.op === '+' ? d.leftNum + d.rightNum : d.leftNum - d.rightNum;
      const barX = 220;
      const barW = 840;
      const cellW = barW / d.den;

      const drawBar = (y: number, filled: number, label: string, color: string) => {
        const rects = Array.from({ length: d.den })
          .map((_, i) => {
            const x = barX + i * cellW;
            return `<rect x="${x.toFixed(1)}" y="${y}" width="${(cellW - 4).toFixed(1)}" height="38" rx="6" fill="${i < filled ? color : '#F1F5F9'}" stroke="#CBD5E1" stroke-width="1.5"/>`;
          })
          .join('');
        return `<text x="120" y="${y + 26}" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700" fill="#1D4ED8">${esc(label)}</text>${rects}`;
      };

      const totalRects = Array.from({ length: d.den })
        .map((_, i) => {
          const x = barX + i * cellW;
          const color = i < d.leftNum ? '#2563EB' : i < resultNum ? '#38BDF8' : '#F1F5F9';
          return `<rect x="${x.toFixed(1)}" y="468" width="${(cellW - 4).toFixed(1)}" height="42" rx="6" fill="${color}" stroke="#CBD5E1" stroke-width="1.5"/>`;
        })
        .join('');

      return `
        ${renderVerticalFractionSvg(440, 260, String(d.leftNum), String(d.den), 1.15, sp)}
        <text x="530" y="275" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="42" font-weight="700" fill="#334155">${d.op}</text>
        ${renderVerticalFractionSvg(620, 260, String(d.rightNum), String(d.den), 1.15, sp)}
        <text x="710" y="275" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="42" font-weight="700" fill="#334155">=</text>
        <rect x="765" y="198" width="110" height="122" rx="14" fill="#EFF6FF" stroke="#93C5FD" stroke-width="2"/>
        ${renderVerticalFractionSvg(820, 260, String(resultNum), String(d.den), 1.15, sp)}

        ${drawBar(360, d.leftNum, `${d.leftNum}/${d.den}`, '#2563EB')}
        ${drawBar(412, d.rightNum, `${d.rightNum}/${d.den}`, '#38BDF8')}
        <text x="120" y="496" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700" fill="#1E40AF">${resultNum}/${d.den}</text>
        ${totalRects}
      `;
    }

    case 'fraction-common-denom': {
      const [ln, ld] = d.left;
      const [rn, rd] = d.right;
      const multL = d.commonDen / ld;
      const multR = d.commonDen / rd;
      const eqL = ln * multL;
      const eqR = rn * multR;
      const sum = d.op === '+' ? eqL + eqR : eqL - eqR;

      return `
        ${renderVerticalFractionSvg(250, 320, String(ln), String(ld), 1.25, sp)}
        <text x="340" y="335" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="44" font-weight="700" fill="#334155">${d.op}</text>
        ${renderVerticalFractionSvg(430, 320, String(rn), String(rd), 1.25, sp)}

        ${
          d.stage !== 'original'
            ? `
          <text x="530" y="335" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="40" fill="#64748B">→</text>
          <rect x="580" y="250" width="320" height="140" rx="16" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
          ${renderVerticalFractionSvg(655, 320, String(eqL), String(d.commonDen), 1.2, sp)}
          <text x="740" y="335" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="40" font-weight="700" fill="#334155">${d.op}</text>
          ${renderVerticalFractionSvg(825, 320, String(eqR), String(d.commonDen), 1.2, sp)}
          <text x="250" y="420" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="18" font-weight="600" fill="#475569">× ${multL} arriba y abajo</text>
          <text x="430" y="420" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="18" font-weight="600" fill="#475569">× ${multR} arriba y abajo</text>
        `
            : ''
        }

        ${
          d.stage === 'solved'
            ? `
          <text x="955" y="335" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="44" font-weight="700" fill="#334155">=</text>
          <rect x="1005" y="250" width="130" height="140" rx="16" fill="#EFF6FF" stroke="#93C5FD" stroke-width="2.5"/>
          ${renderVerticalFractionSvg(1070, 320, String(sum), String(d.commonDen), 1.25, sp)}
        `
            : ''
        }

        <rect x="140" y="458" width="1000" height="58" rx="12" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="1.5"/>
        <text x="640" y="494" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="21" font-weight="600" fill="#1E293B">
          ${
            d.stage === 'original'
              ? `Los denominadores ${ld} y ${rd} son distintos. Buscamos denominador común: ${d.commonDen}.`
              : d.stage === 'converted'
                ? `Ahora ambas fracciones tienen el mismo denominador (${d.commonDen}).`
                : `Dejamos el ${d.commonDen} abajo y sumamos ${eqL} + ${eqR} = ${sum} arriba.`
          }
        </text>
      `;
    }

    case 'fraction-flip': {
      const hiFlip = sp === 'flip';
      return `
        ${renderInlineMathWithFractionsSvg(d.first, 260, 325, 42, sp, 'middle')}
        <text x="360" y="340" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="44" font-weight="700" fill="#64748B">÷</text>
        ${renderVerticalFractionSvg(465, 325, d.secondNum, d.secondDen, 1.2, sp)}

        <text x="580" y="340" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="44" font-weight="700" fill="#1D4ED8">→</text>

        <rect x="640" y="226" width="450" height="196" rx="18" fill="${hiFlip ? '#DBEAFE' : '#EFF6FF'}" stroke="${hiFlip ? '#2563EB' : '#93C5FD'}" stroke-width="${hiFlip ? '4' : '2.5'}"/>
        ${renderInlineMathWithFractionsSvg(d.first, 745, 325, 42, sp, 'middle')}
        <text x="855" y="340" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="44" font-weight="700" fill="#1D4ED8">×</text>
        ${renderVerticalFractionSvg(975, 320, d.secondDen, d.secondNum, hiFlip ? 1.38 : 1.2, sp)}
        <text x="975" y="405" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="18" font-weight="700" fill="#1D4ED8">Se dio vuelta</text>

        ${
          d.signNote
            ? `<text x="420" y="486" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="22" font-weight="700" fill="${sp === 'neg' ? '#DC2626' : '#334155'}">Signos: ${esc(d.signNote)}</text>`
            : ''
        }
        ${
          d.result
            ? renderInlineMathWithFractionsSvg(d.result, 820, 480, 26, sp, 'middle')
            : ''
        }
      `;
    }

    case 'power-visual': {
      const baseNum = Number(d.base);
      const count = !Number.isNaN(baseNum) && baseNum <= 5 ? baseNum : 3;
      const hiBase = sp === 'base' || sp === 'num';
      const hiExp = sp === 'exp';

      const gridCells: string[] = [];
      const startX = 780;
      const startY = 235;
      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          gridCells.push(
            `<rect x="${startX + c * 46}" y="${startY + r * 46}" width="38" height="38" rx="6" fill="#2563EB"/>`
          );
        }
      }

      return `
        ${hiBase ? `<rect x="215" y="230" width="110" height="110" rx="16" fill="#DBEAFE" stroke="#3B82F6" stroke-width="3"/>` : ''}
        <text x="275" y="325" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="${hiBase ? 114 : 96}" font-weight="700" fill="#1D4ED8">${esc(d.base)}</text>

        ${hiExp ? `<rect x="315" y="210" width="70" height="72" rx="12" fill="#FFEDD5" stroke="#EA580C" stroke-width="3"/>` : ''}
        <text x="345" y="265" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="${hiExp ? 64 : 50}" font-weight="700" fill="#C2410C">${d.exp}</text>

        <text x="300" y="388" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="${hiBase ? 24 : 21}" font-weight="700" fill="#1D4ED8">Base (${esc(d.base)}): se repite</text>
        <text x="300" y="422" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="${hiExp ? 24 : 21}" font-weight="700" fill="#C2410C">Exponente (${d.exp}): cuántas veces se multiplica</text>

        <rect x="520" y="212" width="590" height="218" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
        <text x="645" y="330" text-anchor="middle" font-size="36">${renderColorMathTspans(`${d.expanded} = ${d.result}`, 36, sp)}</text>
        ${gridCells.join('')}

        ${
          d.warningCompare
            ? `<rect x="520" y="452" width="590" height="54" rx="12" fill="#FEF2F2" stroke="#FECACA" stroke-width="2"/>
               <text x="815" y="486" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="20" font-weight="700" fill="#991B1B">${esc(d.warningCompare)}</text>`
            : ''
        }
      `;
    }

    case 'root-visual': {
      if (d.kind === 'square') {
        const n = d.rootNum;
        const cells: string[] = [];
        const sx = 720;
        const sy = 230;
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            const isEdge = r === 0 || c === 0;
            cells.push(
              `<rect x="${sx + c * 42}" y="${sy + r * 42}" width="36" height="36" rx="6" fill="${isEdge ? '#2563EB' : '#BFDBFE'}"/>`
            );
          }
        }
        return `
          <text x="360" y="335" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="68" font-weight="700" fill="#0F172A">
            √<tspan fill="#1D4ED8">${d.radicandNum}</tspan> = <tspan fill="#1D4ED8" font-size="${sp === 'num' ? 84 : 68}">${d.rootNum}</tspan>
          </text>
          <text x="360" y="395" text-anchor="middle" font-size="26">
            <tspan font-family="Noto Sans, sans-serif" fill="#334155">Porque </tspan>${renderColorMathTspans(`${d.rootNum} × ${d.rootNum} = ${d.radicandNum}`, 26, sp)}
          </text>
          <rect x="696" y="210" width="${n * 42 + 42}" height="${n * 42 + 42}" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
          ${cells.join('')}
          <text x="${720 + (n * 42) / 2}" y="${258 + n * 42}" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="18" fill="#475569">Cuadrado de ${n} × ${n} = ${d.radicandNum}</text>
        `;
      }

      return `
        <text x="360" y="335" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="68" font-weight="700" fill="#0F172A">
          <tspan fill="#C2410C" font-size="${sp === 'exp' ? 46 : 36}" dy="-24">3</tspan><tspan dy="24">√</tspan><tspan fill="#1D4ED8">${d.radicandNum}</tspan> = <tspan fill="#1D4ED8" font-size="${sp === 'num' ? 84 : 68}">${d.rootNum}</tspan>
        </text>
        <text x="360" y="398" text-anchor="middle" font-size="25">
          <tspan font-family="Noto Sans, sans-serif" fill="#334155">Porque </tspan>${renderColorMathTspans(`${d.rootNum} × ${d.rootNum} × ${d.rootNum} = ${d.radicandNum}`, 25, sp)}
        </text>
        <g transform="translate(730, 200) scale(1.25)">
          <polygon points="110,20 185,60 110,100 35,60" fill="#DBEAFE" stroke="#1E293B" stroke-width="2"/>
          <polygon points="35,60 110,100 110,185 35,145" fill="#93C5FD" stroke="#1E293B" stroke-width="2"/>
          <polygon points="185,60 110,100 110,185 185,145" fill="#60A5FA" stroke="#1E293B" stroke-width="2"/>
          <line x1="60" y1="47" x2="135" y2="87" stroke="#1E293B" stroke-width="1.2"/>
          <line x1="85" y1="33" x2="160" y2="73" stroke="#1E293B" stroke-width="1.2"/>
          <line x1="135" y1="33" x2="60" y2="73" stroke="#1E293B" stroke-width="1.2"/>
          <line x1="160" y1="47" x2="85" y2="87" stroke="#1E293B" stroke-width="1.2"/>
          <line x1="60" y1="73" x2="60" y2="158" stroke="#1E293B" stroke-width="1.2"/>
          <line x1="85" y1="87" x2="85" y2="172" stroke="#1E293B" stroke-width="1.2"/>
          <line x1="35" y1="88" x2="110" y2="128" stroke="#1E293B" stroke-width="1.2"/>
          <line x1="35" y1="116" x2="110" y2="156" stroke="#1E293B" stroke-width="1.2"/>
          <line x1="135" y1="87" x2="135" y2="172" stroke="#1E293B" stroke-width="1.2"/>
          <line x1="160" y1="73" x2="160" y2="158" stroke="#1E293B" stroke-width="1.2"/>
          <line x1="110" y1="128" x2="185" y2="88" stroke="#1E293B" stroke-width="1.2"/>
          <line x1="110" y1="156" x2="185" y2="116" stroke="#1E293B" stroke-width="1.2"/>
        </g>
        <text x="868" y="485" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="18" fill="#475569">Cubo de 3 × 3 × 3 = 27 cubitos</text>
      `;
    }

    case 'order-checklist': {
      const steps = [
        '1. PARÉ — miro el ejercicio completo',
        '2. MIRO los paréntesis y corchetes',
        '3. RESUELVO multiplicaciones y divisiones',
        '4. RESUELVO sumas y restas',
        '5. REVISO signos y simplificación',
      ];
      const listSvg = steps
        .map((st, idx) => {
          const active = idx + 1 === d.activeStep;
          const y = 215 + idx * 58;
          return `
            <rect x="88" y="${y}" width="520" height="46" rx="10" fill="${active ? '#EFF6FF' : '#F8FAFC'}" stroke="${active ? '#3B82F6' : '#E2E8F0'}" stroke-width="${active ? '3' : '2'}"/>
            <text x="112" y="${y + 30}" font-family="Noto Sans, sans-serif" font-size="19" font-weight="${active ? '700' : '500'}" fill="${active ? '#1E3A8A' : '#475569'}">${esc(st)}</text>
          `;
        })
        .join('');

      const noteLines = wrapText(d.stepNote, 42).slice(0, 2);

      return `
        ${listSvg}
        <rect x="645" y="235" width="540" height="225" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
        ${renderInlineMathWithFractionsSvg(d.expression, 915, 315, 26, sp, 'middle')}
        ${noteLines
          .map(
            (l, i) =>
              `<text x="915" y="${380 + i * 28}" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="19" fill="#475569">${esc(l)}</text>`
          )
          .join('')}
      `;
    }

    case 'monomio-parts': {
      const expr = `${d.sign || ''}${d.coeff}${d.vars.map((v) => v.letter + (v.exp && v.exp !== '1' ? toSup(Number(v.exp)) : '')).join('')}`;
      const litText = d.vars.map((v) => `${v.letter}${v.exp && v.exp !== '1' ? `^${v.exp}` : ''}`).join('');
      const hiNum = sp === 'num';
      const hiVar = sp === 'var';
      const hiExp = sp === 'exp';
      const hiNeg = sp === 'neg';

      return `
        <rect x="340" y="204" width="600" height="132" rx="18" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
        <text x="640" y="294" text-anchor="middle" font-size="78">${renderColorMathTspans(expr, 78, sp)}</text>

        <rect x="210" y="365" width="260" height="100" rx="14" fill="${hiNum || hiNeg ? '#DBEAFE' : '#EFF6FF'}" stroke="${hiNum || hiNeg ? '#2563EB' : '#BFDBFE'}" stroke-width="${hiNum || hiNeg ? '3.5' : '2'}"/>
        <text x="340" y="404" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="18" font-weight="700" fill="#1E3A8A">Coeficiente</text>
        <text x="340" y="444" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="${hiNum ? 36 : 30}" font-weight="700" fill="#1D4ED8">${esc((d.sign || '') + d.coeff)}</text>

        <rect x="510" y="365" width="260" height="100" rx="14" fill="${hiVar ? '#D1FAE5' : '#ECFDF5'}" stroke="${hiVar ? '#15803D' : '#A7F3D0'}" stroke-width="${hiVar ? '3.5' : '2'}"/>
        <text x="640" y="404" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="18" font-weight="700" fill="#065F46">Parte literal</text>
        <text x="640" y="444" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="${hiVar ? 36 : 30}" font-weight="700" fill="#15803D">${esc(litText)}</text>

        <rect x="810" y="365" width="260" height="100" rx="14" fill="${hiExp ? '#FFEDD5' : '#FFF7ED'}" stroke="${hiExp ? '#EA580C' : '#FED7AA'}" stroke-width="${hiExp ? '3.5' : '2'}"/>
        <text x="940" y="404" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="18" font-weight="700" fill="#9A3412">Grado absoluto</text>
        <text x="940" y="444" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="${hiExp ? 36 : 30}" font-weight="700" fill="#C2410C">${d.degree}</text>

        ${
          d.note
            ? `<text x="640" y="510" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="19" fill="#475569">${esc(d.note)}</text>`
            : ''
        }
      `;
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
      const rowsSvg = rows
        .map((r, idx) => {
          const y = 264 + idx * 44;
          return `
            <rect x="140" y="${y}" width="1000" height="44" fill="${idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'}" stroke="#E2E8F0" stroke-width="1"/>
            <text x="180" y="${y + 30}" font-size="22">${renderColorMathTspans(r.monomio, 22, sp)}</text>
            <text x="440" y="${y + 30}" font-family="JetBrains Mono, monospace" font-size="${sp === 'num' ? 26 : 22}" font-weight="700" fill="#1D4ED8">${esc(r.coef)}</text>
            <text x="670" y="${y + 30}" font-family="JetBrains Mono, monospace" font-size="${sp === 'var' ? 26 : 22}" font-weight="700" fill="#15803D">${esc(r.literal)}</text>
            <text x="920" y="${y + 30}" font-family="JetBrains Mono, monospace" font-size="${sp === 'exp' ? 26 : 22}" font-weight="700" fill="#C2410C">${esc(r.grado)}</text>
          `;
        })
        .join('');

      return `
        <rect x="140" y="216" width="1000" height="48" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.5"/>
        <text x="180" y="247" font-family="Noto Sans, sans-serif" font-size="19" font-weight="700" fill="#334155">Monomio</text>
        <text x="440" y="247" font-family="Noto Sans, sans-serif" font-size="19" font-weight="700" fill="#1D4ED8">Coeficiente</text>
        <text x="670" y="247" font-family="Noto Sans, sans-serif" font-size="19" font-weight="700" fill="#15803D">Parte literal</text>
        <text x="920" y="247" font-family="Noto Sans, sans-serif" font-size="19" font-weight="700" fill="#C2410C">Grado absoluto</text>
        ${rowsSvg}
      `;
    }

    case 'apples-pears': {
      return `
        <rect x="160" y="250" width="210" height="160" rx="16" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="2"/>
        <rect x="235" y="274" width="60" height="50" rx="10" fill="#15803D"/>
        <text x="265" y="306" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="20" font-weight="700" fill="#FFFFFF">x²</text>
        <text x="265" y="378" text-anchor="middle" font-size="40">${renderColorMathTspans(d.leftLabel, 40, sp)}</text>

        <text x="415" y="345" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="44" font-weight="700" fill="#334155">+</text>

        <rect x="460" y="250" width="210" height="160" rx="16" fill="${d.sameFamily ? '#ECFDF5' : '#FFF7ED'}" stroke="${d.sameFamily ? '#A7F3D0' : '#FED7AA'}" stroke-width="2"/>
        <rect x="535" y="274" width="60" height="50" rx="${d.sameFamily ? '10' : '25'}" fill="${d.sameFamily ? '#15803D' : '#EA580C'}"/>
        <text x="565" y="306" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="20" font-weight="700" fill="#FFFFFF">${d.sameFamily ? 'x²' : 'x³'}</text>
        <text x="565" y="378" text-anchor="middle" font-size="40">${renderColorMathTspans(d.rightLabel, 40, sp)}</text>

        <text x="720" y="345" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="40" fill="#64748B">→</text>

        <rect x="770" y="268" width="350" height="124" rx="16" fill="${d.sameFamily ? '#EFF6FF' : '#FEF2F2'}" stroke="${d.sameFamily ? '#93C5FD' : '#FECACA'}" stroke-width="2"/>
        <text x="945" y="345" text-anchor="middle" font-size="34">${renderColorMathTspans(d.resultLabel, 34, sp)}</text>

        <text x="640" y="476" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="22" font-weight="600" fill="#334155">
          ${
            d.sameFamily
              ? 'Tienen la misma forma (mismas letras y exponentes) → ¡Se pueden juntar!'
              : 'Tienen distinta forma (cambia el exponente) → No se pueden mezclar.'
          }
        </text>
      `;
    }

    case 'exponent-flow': {
      const isMul = d.mode === 'multiply';
      const resultExp = isMul ? d.expA + d.expB : d.expA - d.expB;
      const opSymbol = isMul ? '×' : '÷';
      const expOpSymbol = isMul ? '+' : '−';
      const eq = `${d.coeffA}${d.baseVar}${toSup(d.expA)} ${opSymbol} ${d.coeffB}${d.baseVar}${toSup(d.expB)} = ${d.coeffResult}${d.baseVar}${toSup(resultExp)}`;
      const hiNum = sp === 'num';
      const hiExp = sp === 'exp';

      return `
        <text x="640" y="265" text-anchor="middle" font-size="46">${renderColorMathTspans(eq, 46, sp)}</text>

        <rect x="160" y="315" width="450" height="115" rx="14" fill="${hiNum ? '#DBEAFE' : '#EFF6FF'}" stroke="${hiNum ? '#2563EB' : '#BFDBFE'}" stroke-width="${hiNum ? '3.5' : '2'}"/>
        <text x="190" y="355" font-family="Noto Sans, sans-serif" font-size="20" font-weight="700" fill="#1E3A8A">Paso 1 · Números (coeficientes)</text>
        <text x="190" y="400" font-family="JetBrains Mono, monospace" font-size="${hiNum ? 34 : 30}" font-weight="700" fill="#1D4ED8">${esc(d.coeffA)} ${opSymbol} ${esc(d.coeffB)} = ${esc(d.coeffResult)}</text>

        <rect x="670" y="315" width="450" height="115" rx="14" fill="${hiExp ? '#FFEDD5' : '#FFF7ED'}" stroke="${hiExp ? '#EA580C' : '#FED7AA'}" stroke-width="${hiExp ? '3.5' : '2'}"/>
        <text x="700" y="355" font-family="Noto Sans, sans-serif" font-size="20" font-weight="700" fill="#9A3412">Paso 2 · Exponentes de ${esc(d.baseVar)}</text>
        <text x="700" y="400" font-family="JetBrains Mono, monospace" font-size="${hiExp ? 34 : 30}" font-weight="700" fill="#C2410C">${d.expA} ${expOpSymbol} ${d.expB} = ${resultExp}</text>

        <text x="640" y="492" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="21" font-weight="600" fill="#475569">
          ${
            isMul
              ? `Multiplicar letras iguales suma sus exponentes: ${d.expA} + ${d.expB} = ${resultExp}.`
              : `Dividir letras iguales resta sus exponentes: ${d.expA} − ${d.expB} = ${resultExp}.`
          }
        </text>
      `;
    }

    case 'rectangle-area': {
      const hiArea = sp === 'area';
      return `
        <text x="360" y="242" text-anchor="middle" font-size="28">${renderColorMathTspans(`Lado = ${d.widthLabel}`, 28, sp)}</text>
        <text x="160" y="365" text-anchor="end" font-size="28">${renderColorMathTspans(d.heightLabel, 28, sp)}</text>
        <rect x="180" y="265" width="360" height="185" rx="16" fill="${hiArea ? '#DBEAFE' : '#EFF6FF'}" stroke="#2563EB" stroke-width="${hiArea ? '5' : '3.5'}"/>
        <text x="360" y="340" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="22" font-weight="600" fill="#475569">Área del rectángulo</text>
        <text x="360" y="395" text-anchor="middle" font-size="${hiArea ? 50 : 44}">${renderColorMathTspans(d.areaLabel, hiArea ? 50 : 44, sp)}</text>

        <rect x="640" y="245" width="510" height="225" rx="16" fill="#F8FAFC" stroke="${hiArea ? '#3B82F6' : '#E2E8F0'}" stroke-width="${hiArea ? '3' : '2'}"/>
        <text x="675" y="295" font-family="Noto Sans, sans-serif" font-size="22" font-weight="700" fill="#334155">Regla: Área = lado × lado</text>
        <text x="675" y="345" font-size="28">${renderColorMathTspans(`Área = ${d.widthLabel} × ${d.heightLabel}`, 28, sp)}</text>
        <text x="675" y="390" font-family="Noto Sans, sans-serif" font-size="20" fill="#475569">3 × 2 = 6   ·   x² × x¹ = x³</text>
        <text x="675" y="442" font-size="34">${renderColorMathTspans(`Área = ${d.areaLabel}`, 34, sp)}</text>
      `;
    }

    case 'steps-board': {
      const revealCount = opts.stepsReveal ?? d.lines.length;
      const visibleLines = d.lines.slice(0, revealCount);
      const rowH = Math.min(58, Math.floor(325 / Math.max(1, d.lines.length)));

      const rowsSvg = visibleLines
        .map((line, idx) => {
          const y = 224 + idx * (rowH + 6);
          const cy = y + Math.round(rowH * 0.5);
          const isNewest = idx === visibleLines.length - 1;
          return `
            <rect x="88" y="${y}" width="1104" height="${rowH}" rx="12" fill="${line.focus || isNewest ? '#EFF6FF' : '#F8FAFC'}" stroke="${line.focus || isNewest ? '#3B82F6' : '#E2E8F0'}" stroke-width="${isNewest ? '2.5' : '1.5'}"/>
            ${
              line.label
                ? `<text x="114" y="${cy + 6}" font-family="Noto Sans, sans-serif" font-size="19" font-weight="700" fill="#334155">${esc(line.label)}</text>`
                : ''
            }
            ${renderInlineMathWithFractionsSvg(line.math, line.label ? 208 : 114, cy, 21, isNewest ? sp : 'none', 'start')}
            ${
              line.note
                ? `<text x="1168" y="${cy + 6}" text-anchor="end" font-family="Noto Sans, sans-serif" font-size="16" fill="#475569">${esc(line.note)}</text>`
                : ''
            }
          `;
        })
        .join('');

      return `
        <text x="88" y="210" font-family="Noto Sans, sans-serif" font-size="16" font-weight="700" fill="#64748B">${esc(d.exerciseTag.toUpperCase())}</text>
        ${rowsSvg}
      `;
    }

    case 'practice-challenge': {
      const revealed = Boolean(opts.practiceReveal);
      if (!revealed) {
        return `
          <rect x="140" y="218" width="1000" height="125" rx="16" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
          <text x="180" y="255" font-family="Noto Sans, sans-serif" font-size="18" font-weight="700" fill="#1D4ED8">PAUSA PARA PENSAR (10 SEGUNDOS)</text>
          ${renderInlineMathWithFractionsSvg(d.promptMath, 640, 304, 38, sp, 'middle')}

          <text x="640" y="405" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="24" font-weight="600" fill="#0F172A">${esc(d.question)}</text>
          <rect x="240" y="445" width="800" height="58" rx="12" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5"/>
          <text x="640" y="482" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="20" fill="#1E3A8A">Pista: ${esc(d.hint)}</text>
        `;
      }

      const solSvg = d.solutionSteps
        .map(
          (st, idx) =>
            `<text x="180" y="${330 + idx * 44}" font-family="Noto Sans, sans-serif" font-size="24" font-weight="600" fill="#0F172A">${esc(st)}</text>`
        )
        .join('');

      return `
        <rect x="140" y="218" width="1000" height="280" rx="16" fill="#ECFDF5" stroke="#6EE7B7" stroke-width="2"/>
        <text x="180" y="268" font-family="Noto Sans, sans-serif" font-size="22" font-weight="700" fill="#065F46">SOLUCIÓN PASO A PASO</text>
        ${solSvg}
      `;
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

      const cards = items
        .map((it, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const x = 90 + col * 560;
          const y = 205 + row * 52;
          return `
            <rect x="${x}" y="${y}" width="530" height="42" rx="10" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1.5"/>
            <text x="${x + 20}" y="${y + 27}" font-family="Noto Sans, sans-serif" font-size="18" font-weight="600" fill="#065F46">✓  ${esc(it)}</text>
          `;
        })
        .join('');

      return `
        ${cards}
        <rect x="90" y="426" width="1090" height="106" rx="14" fill="#EFF6FF" stroke="#93C5FD" stroke-width="2"/>
        <text x="635" y="468" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="21" font-weight="700" fill="#1E3A8A">
          “Matemática no se aprende todo de una vez. Se aprende practicando, paso a paso.”
        </text>
        <text x="635" y="504" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="21" font-weight="700" fill="#1E3A8A">
          “No importa cuánto tardes. Lo importante es que cada día comprendas un poquito más. ¡Vos podés!”
        </text>
      `;
    }

    case 'english-cards': {
      const cols = d.layout === '3col' ? 3 : d.layout === 'rows' ? 1 : 2;
      const startY = d.banner ? 248 : 196;
      const availH = (d.footerTip ? 488 : 525) - startY;
      const rows = Math.ceil(d.cards.length / cols);
      const cardGap = 16;
      const totalW = 1100;
      const cardW = Math.floor((totalW - cardGap * (cols - 1)) / cols);
      const cardH = Math.min(132, Math.floor((availH - cardGap * (rows - 1)) / Math.max(1, rows)));

      const TONE_FILL: Record<string, [string, string]> = {
        blue: ['#EFF6FF', '#BFDBFE'],
        mint: ['#ECFDF5', '#A7F3D0'],
        peach: ['#FFFBEB', '#FDE68A'],
        lilac: ['#F5F3FF', '#DDD6FE'],
        slate: ['#F8FAFC', '#CBD5E1'],
      };

      const bannerSvg = d.banner
        ? `
          <rect x="90" y="190" width="1100" height="44" rx="12" fill="#E0F2FE" stroke="#7DD3FC" stroke-width="2"/>
          <text x="640" y="219" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="22" font-weight="700" fill="#0F172A">${esc(d.banner)}</text>
        `
        : '';

      const activeText = opts.activeSentence || '';
      const matchedFlags = d.cards.map((c) =>
        doesSpokenTextMatchKeywords(activeText, c.matchPhrases || [c.title, c.meaning || ''])
      );
      const anyMatched = matchedFlags.some(Boolean);

      const cardsSvg = d.cards
        .map((c, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const x = 90 + col * (cardW + cardGap);
          const y = startY + row * (cardH + cardGap);
          const isHit = anyMatched && matchedFlags[idx];
          const [baseFill, baseStroke] = TONE_FILL[c.tone || 'blue'] || TONE_FILL.blue;
          const fill = isHit ? '#FEF3C7' : baseFill;
          const stroke = isHit ? '#D97706' : baseStroke;
          const sw = isHit ? 4 : 2;
          const opacityAttr = anyMatched && !isHit ? ' opacity="0.62"' : '';
          const textX = x + 22;
          const titleY = y + (cardH > 95 ? 36 : 30);

          return `
            <g${opacityAttr}>
              <rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
              <text x="${textX}" y="${titleY}" font-family="Noto Sans, sans-serif" font-size="${cardH > 95 ? 24 : 20}" font-weight="700" fill="#0F172A">${esc(c.title)}</text>
              ${
                c.subtitle
                  ? `<text x="${textX}" y="${titleY + 26}" font-family="Noto Sans, sans-serif" font-size="18" font-weight="700" fill="#1E3A8A">${esc(c.subtitle)}</text>`
                  : ''
              }
              ${
                c.meaning
                  ? `<text x="${textX}" y="${titleY + (c.subtitle ? 52 : 28)}" font-family="Noto Sans, sans-serif" font-size="18" font-weight="600" fill="#334155">${esc(c.meaning)}</text>`
                  : ''
              }
            </g>
          `;
        })
        .join('');

      const footerSvg = d.footerTip
        ? `<text x="640" y="520" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="19" font-weight="700" fill="#047857">${esc(d.footerTip)}</text>`
        : '';

      return `${bannerSvg}${cardsSvg}${footerSvg}`;
    }

    case 'english-quiz': {
      const revealed = Boolean(opts.practiceReveal);
      const cols = d.items.length >= 6 ? 3 : 2;
      const rows = Math.ceil(d.items.length / cols);
      const gap = 16;
      const cardW = Math.floor((1100 - gap * (cols - 1)) / cols);
      const cardH = Math.min(138, Math.floor((275 - gap * (rows - 1)) / Math.max(1, rows)));
      const activeText = !revealed ? opts.activeSentence || '' : '';
      const matchedFlags = d.items.map((it) =>
        doesSpokenTextMatchKeywords(activeText, it.matchPhrases || [it.prompt])
      );
      const anyMatched = !revealed && matchedFlags.some(Boolean);

      const cardsSvg = d.items
        .map((it, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const x = 90 + col * (cardW + gap);
          const y = 235 + row * (cardH + gap);
          const isHit = anyMatched && matchedFlags[idx];
          const fill = revealed ? '#ECFDF5' : isHit ? '#FEF3C7' : '#F8FAFC';
          const stroke = revealed ? '#34D399' : isHit ? '#D97706' : '#CBD5E1';
          const sw = isHit ? 4 : 2;
          const opacityAttr = anyMatched && !isHit ? ' opacity="0.62"' : '';
          const optsText = revealed ? `✓ ${it.correctOption}` : it.options.join('   /   ');

          return `
            <g${opacityAttr}>
              <rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
              <text x="${x + 22}" y="${y + 40}" font-family="Noto Sans, sans-serif" font-size="22" font-weight="700" fill="#0F172A">${esc(it.prompt)}</text>
              ${
                it.subLabel
                  ? `<text x="${x + 22}" y="${y + 68}" font-family="Noto Sans, sans-serif" font-size="16" fill="#64748B">${esc(it.subLabel)}</text>`
                  : ''
              }
              <text x="${x + 22}" y="${y + cardH - 22}" font-family="Noto Sans, sans-serif" font-size="20" font-weight="700" fill="${revealed ? '#047857' : '#1D4ED8'}">${esc(optsText)}</text>
            </g>
          `;
        })
        .join('');

      return `
        <text x="90" y="216" font-family="Noto Sans, sans-serif" font-size="20" font-weight="700" fill="${revealed ? '#047857' : '#1D4ED8'}">
          ${revealed ? 'RESPUESTAS PARA REVISAR JUNTAS' : 'PAUSA PARA PENSAR (10 SEGUNDOS)'}
        </text>
        ${cardsSvg}
        <text x="640" y="530" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="18" fill="#1E3A8A">Pista: ${esc(d.hint)}</text>
      `;
    }
  }
}

function toSup(n: number): string {
  const sups = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  return String(n)
    .split('')
    .map((d) => sups[Number(d)] ?? d)
    .join('');
}
