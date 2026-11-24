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
  if (/\b(exponente|exponentes|naranja|naranjas|grado|al cuadrado|al cubo|a la cero|a la cuarta|a la quinta|a la sexta|e-d|did|período grande|meses|horas)\b/.test(s))
    return 'exp';
  if (/\b(parte literal|verde|verdes|letras|letra|la x|la y|la r|la a|la b|verbo|verbos|sunny|cloudy|rainy|windy|stormy|snowy)\b/.test(s))
    return 'var';
  if (/\b(signo menos|signo|signos|negativo|negativos|negativa|menos por|menos dividido|wasn’t|wasn't|weren’t|weren't|didn’t|didn't|negación)\b/.test(s))
    return 'neg';
  if (/\b(coeficiente|coeficientes|azul|azules|números de adelante|números|persona|personas|sujeto)\b/.test(s))
    return 'num';
  if (/\b(la base|base)\b/.test(s)) return 'base';
  if (/\b(área|rectángulo|lado por lado)\b/.test(s)) return 'area';

  return 'none';
}

const ENGLISH_WORD_RE =
  /\b(sunny|cloudy|rainy|windy|stormy|snowy|weather|tornado|flood|wildfire|volcano|was|were|wasn['’]t|weren['’]t|yesterday|last|played|walked|visited|watched|went|ate|saw|had|bought|did|didn['’]t|monday|friday|july|night|o['’]clock|today|happy|tired|school|pizza|football|home|she|they|you|we|he|it)\b/gi;

export function estimateSpokenWeight(text: string, isVeryEnd = false): number {
  const clean = text.trim();
  if (!clean) return 8;
  let weight = Math.max(8, clean.length);

  // Bilingual switches in Spanish sentences take slightly more articulation time
  const englishMatches = clean.match(ENGLISH_WORD_RE);
  if (englishMatches) {
    for (const m of englishMatches) {
      weight += m.length * 0.45 + 1.5;
    }
  }

  // Punctuation pauses (TTS voices pause significantly at periods/exclamations/colons)
  if (!isVeryEnd) {
    if (/[.!?]$/.test(clean)) weight += 9;
    else if (/:$/.test(clean)) weight += 5;
    else if (/[,;]$/.test(clean)) weight += 4;
  } else {
    weight += 2;
  }

  return weight;
}

export function estimateNarrationDurationMs(text: string, rate = 1): number {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return 10000;

  let totalWeight = 0;
  sentences.forEach((s, idx) => {
    totalWeight += estimateSpokenWeight(s, idx === sentences.length - 1);
  });

  // ~66ms per weighted unit at 1.0x closely matches calm Spanish + English speech
  const safeRate = Math.max(0.65, rate);
  return Math.max(4000, Math.round((totalWeight * 66) / safeRate));
}

/**
 * Accounts for ~2% WAV lead-in silence and ~4% trailing decay so
 * visual highlights align tightly with spoken words.
 */
export function mapAudioProgressToSpeech(rawProgress: number): number {
  const lead = 0.02;
  const tail = 0.04;
  if (rawProgress <= lead) return 0;
  if (rawProgress >= 1 - tail) return 0.9999;
  return (rawProgress - lead) / (1 - lead - tail);
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

  const weights = rawSentences.map((s, idx) =>
    estimateSpokenWeight(s, idx === rawSentences.length - 1)
  );
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  let cursor = 0;

  return rawSentences.map((sentence, idx) => {
    const weight = weights[idx];
    const startRatio = cursor / totalWeight;
    cursor += weight;
    const endRatio = cursor / totalWeight;
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
  const p = Math.max(0, Math.min(0.9999, mapAudioProgressToSpeech(progress)));
  const idx = cues.findIndex((c) => p >= c.startRatio && p < c.endRatio);
  const resolved = idx >= 0 ? idx : cues.length - 1;
  return { index: resolved, cue: cues[resolved] };
}

export interface SpokenClauseSegment {
  text: string;
  sentenceIndex: number;
  startRatio: number;
  endRatio: number;
}

export function normalizeSpokenText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits narration into fine spoken clauses (sentences + commas + colons)
 * synchronized with spoken prosody weights so individual cards or quiz prompts
 * light up right when the narrator speaks them (e.g. "Hay muchas nubes,").
 */
export function splitSpokenClauses(narration: string): SpokenClauseSegment[] {
  const sentences = narration
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    return [{ text: narration, sentenceIndex: 0, startRatio: 0, endRatio: 1 }];
  }

  const sentWeights = sentences.map((s, idx) =>
    estimateSpokenWeight(s, idx === sentences.length - 1)
  );
  const totalSentenceWeight = sentWeights.reduce((acc, w) => acc + w, 0);

  const clauses: SpokenClauseSegment[] = [];
  let sentCursor = 0;

  sentences.forEach((sentence, sentenceIndex) => {
    const sentWeight = sentWeights[sentenceIndex];
    const sentStart = sentCursor / totalSentenceWeight;
    sentCursor += sentWeight;
    const sentEnd = sentCursor / totalSentenceWeight;

    const rawParts = sentence
      .split(/(?<=[,;:])\s+/)
      .map((p) => p.trim())
      .filter(Boolean);

    const parts: string[] = [];
    for (const raw of rawParts) {
      const wordsCount = raw.split(/\s+/).filter(Boolean).length;
      const isTinySingleWord = wordsCount === 1 && raw.length <= 5;
      const prev = parts[parts.length - 1];
      if (isTinySingleWord && prev && prev.length < 48) {
        parts[parts.length - 1] = `${prev} ${raw}`;
      } else {
        parts.push(raw);
      }
    }

    if (parts.length <= 1) {
      clauses.push({
        text: sentence,
        sentenceIndex,
        startRatio: sentStart,
        endRatio: sentEnd,
      });
      return;
    }

    const isVeryLastSent = sentenceIndex === sentences.length - 1;
    const partWeights = parts.map((p, pIdx) =>
      estimateSpokenWeight(p, isVeryLastSent && pIdx === parts.length - 1)
    );
    const totalPartWeight = partWeights.reduce((acc, w) => acc + w, 0);
    let partCursor = 0;
    const sentSpan = sentEnd - sentStart;

    parts.forEach((part, pIdx) => {
      const pw = partWeights[pIdx];
      const startRatio = sentStart + (partCursor / totalPartWeight) * sentSpan;
      partCursor += pw;
      const endRatio = sentStart + (partCursor / totalPartWeight) * sentSpan;
      clauses.push({
        text: part,
        sentenceIndex,
        startRatio,
        endRatio,
      });
    });
  });

  return clauses;
}

export function getActiveClauseAtProgress(
  clauses: SpokenClauseSegment[],
  progress: number
): { index: number; clause: SpokenClauseSegment } {
  if (clauses.length === 0) {
    return {
      index: 0,
      clause: { text: '', sentenceIndex: 0, startRatio: 0, endRatio: 1 },
    };
  }
  const p = Math.max(0, Math.min(0.9999, mapAudioProgressToSpeech(progress)));
  const idx = clauses.findIndex((c) => p >= c.startRatio && p < c.endRatio);
  const resolved = idx >= 0 ? idx : clauses.length - 1;
  return { index: resolved, clause: clauses[resolved] };
}

export function doesSpokenTextMatchKeywords(
  spokenText: string,
  keywords?: string[]
): boolean {
  if (!spokenText || !keywords || keywords.length === 0) return false;
  const normalizedSpoken = normalizeSpokenText(spokenText);

  for (const rawKw of keywords) {
    const kw = normalizeSpokenText(rawKw);
    if (!kw) continue;
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9'])${escaped}($|[^a-z0-9'])`);
    if (regex.test(normalizedSpoken)) {
      return true;
    }
  }
  return false;
}

export interface SpokenMathFocus {
  target: SpotlightTarget;
  terms: string[];
  stepLabel?: string;
}

const NUM_WORDS: Record<string, string> = {
  cero: '0',
  un: '1',
  uno: '1',
  una: '1',
  dos: '2',
  tres: '3',
  cuatro: '4',
  cinco: '5',
  seis: '6',
  siete: '7',
  ocho: '8',
  nueve: '9',
  diez: '10',
  once: '11',
  doce: '12',
  trece: '13',
  catorce: '14',
  quince: '15',
  dieciseis: '16',
  dieciocho: '18',
  veinte: '20',
  veintiun: '21',
  veintiuno: '21',
  veintidos: '22',
  veintitres: '23',
  veinticuatro: '24',
  veinticinco: '25',
  veintisiete: '27',
  veintiocho: '28',
  treinta: '30',
  'treinta y seis': '36',
  cuarenta: '40',
  'cuarenta y cinco': '45',
  cincuenta: '50',
  sesenta: '60',
  'sesenta y tres': '63',
  ochenta: '80',
  'ochenta y uno': '81',
  cien: '100',
};

const DEN_WORDS: Record<string, string> = {
  medio: '2',
  medios: '2',
  tercio: '3',
  tercios: '3',
  cuarto: '4',
  cuartos: '4',
  quinto: '5',
  quintos: '5',
  sexto: '6',
  sextos: '6',
  septimo: '7',
  septimos: '7',
  octavo: '8',
  octavos: '8',
  noveno: '9',
  novenos: '9',
  decimo: '10',
  decimos: '10',
  doceavo: '12',
  doceavos: '12',
  dieciseisavo: '16',
  dieciseisavos: '16',
  dieciochoavo: '18',
  dieciochoavos: '18',
  veinteavo: '20',
  veinteavos: '20',
  veinticuatroavo: '24',
  veinticuatroavos: '24',
  veintiochoavo: '28',
  veintiochoavos: '28',
  'treinta y seisavo': '36',
  'treinta y seisavos': '36',
};

export function extractSpokenMathFocus(spokenText: string): SpokenMathFocus {
  if (!spokenText.trim()) {
    return { target: 'none', terms: [] };
  }

  const target = detectSentenceSpotlight(spokenText);
  const norm = normalizeSpokenText(spokenText);
  const terms = new Set<string>();

  // 1. Direct digit fractions like "7/6"
  const directFracs = norm.match(/\b\d+\/\d+\b/g);
  if (directFracs) {
    for (const f of directFracs) terms.add(f);
  }

  // 2. Spoken Spanish fractions like "siete sextos", "un tercio", "diez dieciseisavos"
  const numKeys = Object.keys(NUM_WORDS).sort((a, b) => b.length - a.length);
  const denKeys = Object.keys(DEN_WORDS).sort((a, b) => b.length - a.length);
  const fracPattern = new RegExp(
    `\\b(${numKeys.join('|')})\\s+(${denKeys.join('|')})\\b`,
    'g'
  );
  let fm: RegExpExecArray | null;
  while ((fm = fracPattern.exec(norm)) !== null) {
    const n = NUM_WORDS[fm[1]];
    const d = DEN_WORDS[fm[2]];
    if (n && d) {
      terms.add(`${n}/${d}`);
    }
  }

  // 3. Spoken signs & operations
  if (/\b(menos|negativo|negativos|negativa|resta|restamos|signo menos)\b/.test(norm)) {
    terms.add('−');
  }
  if (/\b(mas|suma|sumamos|signo mas)\b/.test(norm)) {
    terms.add('+');
  }
  if (/\b(por|multiplicamos|multiplica|multiplicacion)\b/.test(norm)) {
    terms.add('×');
  }
  if (/\b(dividido|divide|dividimos|division)\b/.test(norm)) {
    terms.add('÷');
  }
  if (/\b(igual|da|es igual)\b/.test(norm)) {
    terms.add('=');
  }

  // 4. Standalone numbers (digits or words)
  const digitMatches = norm.match(/\b\d+\b/g);
  if (digitMatches) {
    for (const dm of digitMatches) terms.add(dm);
  }
  const numWordRegex = new RegExp(`\\b(${numKeys.join('|')})\\b`, 'g');
  let nm: RegExpExecArray | null;
  while ((nm = numWordRegex.exec(norm)) !== null) {
    const val = NUM_WORDS[nm[1]];
    if (val) terms.add(val);
  }

  // 5. Variables mentioned explicitly
  for (const letter of ['x', 'y', 'a', 'b', 'm', 'n', 'p', 'q', 'r']) {
    if (new RegExp(`\\b(la ${letter}|${letter} al|${letter} por)\\b`).test(norm)) {
      terms.add(letter);
    }
  }

  // 6. Step / Exercise row hints for steps-board
  let stepLabel: string | undefined;
  if (/\bpaso (uno|1)\b/.test(norm)) stepLabel = 'paso 1';
  else if (/\bpaso (dos|2)\b/.test(norm)) stepLabel = 'paso 2';
  else if (/\bpaso (tres|3)\b/.test(norm)) stepLabel = 'paso 3';
  else if (/\bpaso (cuatro|4)\b/.test(norm)) stepLabel = 'paso 4';
  else if (/\bresultado\b/.test(norm)) stepLabel = 'resultado';
  else if (/\bbloque (uno|1)\b/.test(norm)) stepLabel = 'bloque 1';
  else if (/\bbloque (dos|2)\b/.test(norm)) stepLabel = 'bloque 2';
  else if (/\ben el b\b/.test(norm)) stepLabel = 'b)';
  else if (/\ben el c\b/.test(norm)) stepLabel = 'c)';
  else if (/\ben el d\b/.test(norm)) stepLabel = 'd)';
  else if (/\ben el e\b/.test(norm)) stepLabel = 'e)';
  else if (/\ben el f\b/.test(norm)) stepLabel = 'f)';
  else if (/\bejercicio\b/.test(norm)) stepLabel = 'ejercicio';

  return {
    target,
    terms: Array.from(terms),
    stepLabel,
  };
}

