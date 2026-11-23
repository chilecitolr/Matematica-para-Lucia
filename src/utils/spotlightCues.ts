export type SpotlightTarget =
  | 'none'
  | 'num'
  | 'var'
  | 'exp'
  | 'neg'
  | 'numerador'
  | 'denominador'
  | 'flip'
  | 'base'
  | 'area';

export interface NarrationCueSegment {
  text: string;
  target: SpotlightTarget;
  startRatio: number;
  endRatio: number;
  label: string;
}

const TARGET_LABELS: Record<SpotlightTarget, string> = {
  none: '',
  num: 'Señalando: Números / Coeficientes (Azul)',
  var: 'Señalando: Letras / Parte literal (Verde)',
  exp: 'Señalando: Exponentes / Grado (Naranja)',
  neg: 'Señalando: Signos negativos (Rojo)',
  numerador: 'Señalando: Numerador (arriba)',
  denominador: 'Señalando: Denominador (abajo)',
  flip: 'Señalando: Se da vuelta la segunda fracción',
  base: 'Señalando: La base (número que se repite)',
  area: 'Señalando: Área = lado × lado',
};

export function detectSentenceSpotlight(sentence: string): SpotlightTarget {
  const s = sentence.toLowerCase();

  if (/\b(se da vuelta|damos vuelta|invierte)\b/.test(s)) return 'flip';
  if (/\b(numerador|los de arriba|de arriba)\b/.test(s)) return 'numerador';
  if (/\b(denominador|los de abajo|de abajo|partes iguales)\b/.test(s)) return 'denominador';
  if (/\b(exponente|exponentes|naranja|naranjas|grado|al cuadrado|al cubo|a la cero|a la cuarta|a la quinta|a la sexta)\b/.test(s))
    return 'exp';
  if (/\b(parte literal|verde|verdes|letras|letra|la x|la y|la r|la a|la b)\b/.test(s))
    return 'var';
  if (/\b(signo menos|signo|signos|negativo|negativos|menos por|menos dividido)\b/.test(s))
    return 'neg';
  if (/\b(coeficiente|coeficientes|azul|azules|números de adelante|números)\b/.test(s))
    return 'num';
  if (/\b(la base|base)\b/.test(s)) return 'base';
  if (/\b(área|rectángulo|lado por lado)\b/.test(s)) return 'area';

  return 'none';
}

export function splitNarrationCues(narration: string): NarrationCueSegment[] {
  const rawSentences = narration
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (rawSentences.length === 0) {
    return [
      {
        text: narration,
        target: 'none',
        startRatio: 0,
        endRatio: 1,
        label: '',
      },
    ];
  }

  const totalChars = rawSentences.reduce((acc, s) => acc + Math.max(12, s.length), 0);
  let cursor = 0;

  return rawSentences.map((sentence) => {
    const weight = Math.max(12, sentence.length);
    const startRatio = cursor / totalChars;
    cursor += weight;
    const endRatio = cursor / totalChars;
    const target = detectSentenceSpotlight(sentence);
    return {
      text: sentence,
      target,
      startRatio,
      endRatio,
      label: TARGET_LABELS[target],
    };
  });
}

export function getActiveCueAtProgress(
  cues: NarrationCueSegment[],
  progress: number
): { index: number; cue: NarrationCueSegment } {
  if (cues.length === 0) {
    return {
      index: 0,
      cue: { text: '', target: 'none', startRatio: 0, endRatio: 1, label: '' },
    };
  }
  const p = Math.max(0, Math.min(0.9999, progress));
  const idx = cues.findIndex((c) => p >= c.startRatio && p < c.endRatio);
  const resolved = idx >= 0 ? idx : cues.length - 1;
  return { index: resolved, cue: cues[resolved] };
}
