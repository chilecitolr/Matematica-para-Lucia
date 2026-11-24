import type { SubjectId, VideoId } from '../types/lesson';

export type FreePracticeTopicId =
  | 'fracciones-suma-resta'
  | 'fracciones-mult-div'
  | 'potencias-raices'
  | 'monomios-semejantes'
  | 'monomios-mult-div'
  | 'ingles-weather'
  | 'ingles-was-were'
  | 'ingles-past-simple'
  | 'ingles-in-on-at';

export interface FreePracticeTopicMeta {
  id: FreePracticeTopicId;
  subject: SubjectId;
  title: string;
  shortDesc: string;
}

export interface FreePracticeOption {
  id: string;
  label: string;
  isMathExpr?: boolean;
  isCorrect: boolean;
  feedback: string;
}

export interface FreePracticeExercise {
  id: string;
  signature: string;
  topicId: FreePracticeTopicId;
  topicTitle: string;
  subject: SubjectId;
  prompt: string;
  mathExpr?: string;
  englishHighlight?: string;
  speakEnglishText?: string;
  hint: string;
  steps: string[];
  options: FreePracticeOption[];
}

export const FREE_PRACTICE_TOPICS: FreePracticeTopicMeta[] = [
  {
    id: 'fracciones-suma-resta',
    subject: 'matematica',
    title: 'Fracciones · Suma y resta',
    shortDesc: 'Mismo o distinto denominador y simplificación',
  },
  {
    id: 'fracciones-mult-div',
    subject: 'matematica',
    title: 'Fracciones · × y ÷',
    shortDesc: 'Multiplicar derecho, dar vuelta al dividir y signos',
  },
  {
    id: 'potencias-raices',
    subject: 'matematica',
    title: 'Potencias y raíces',
    shortDesc: 'Paréntesis, signos, cuadrados, cubos y fracciones',
  },
  {
    id: 'monomios-semejantes',
    subject: 'matematica',
    title: 'Monomios · Partes y suma',
    shortDesc: 'Grado, semejantes y juntar cada familia',
  },
  {
    id: 'monomios-mult-div',
    subject: 'matematica',
    title: 'Monomios · × y ÷',
    shortDesc: 'Operar números adelante y sumar o restar exponentes',
  },
  {
    id: 'ingles-weather',
    subject: 'ingles',
    title: 'Weather · El clima',
    shortDesc: 'Clima, desastres naturales y frases cortas',
  },
  {
    id: 'ingles-was-were',
    subject: 'ingles',
    title: 'WAS y WERE',
    shortDesc: 'Afirmativa, negativa y preguntas en pasado',
  },
  {
    id: 'ingles-past-simple',
    subject: 'ingles',
    title: 'Past Simple y DID',
    shortDesc: 'Regulares con -ED, irregulares y DID / DIDN’T',
  },
  {
    id: 'ingles-in-on-at',
    subject: 'ingles',
    title: 'IN / ON / AT',
    shortDesc: 'Meses y años (IN), días (ON) y horas (AT)',
  },
];

export function getDefaultFreePracticeTopic(videoId: VideoId): FreePracticeTopicId {
  switch (videoId) {
    case 'video-1':
      return 'fracciones-suma-resta';
    case 'video-2':
      return 'potencias-raices';
    case 'video-3':
      return 'monomios-semejantes';
    case 'video-4':
      return 'monomios-mult-div';
    case 'english-1':
      return 'ingles-weather';
    case 'english-2':
      return 'ingles-was-were';
    case 'english-3':
      return 'ingles-past-simple';
    case 'english-4':
      return 'ingles-in-on-at';
  }
}

const SUP_DIGITS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

function toSup(n: number): string {
  return String(n)
    .split('')
    .map((ch) => SUP_DIGITS[ch] ?? ch)
    .join('');
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

function simplifyFraction(num: number, den: number): [number, number] {
  if (num === 0) return [0, 1];
  const sign = den < 0 ? -1 : 1;
  const n = num * sign;
  const d = Math.abs(den);
  const g = gcd(n, d);
  return [n / g, d / g];
}

function formatFraction(num: number, den: number, showPlus = false): string {
  const [n, d] = simplifyFraction(num, den);
  if (n === 0) return '0';
  const signStr = n < 0 ? '-' : showPlus ? '+' : '';
  const absN = Math.abs(n);
  return d === 1 ? `${signStr}${absN}` : `${signStr}${absN}/${d}`;
}

function formatRawFraction(num: number, den: number): string {
  if (den === 1) return String(num);
  if (num < 0) return `-${Math.abs(num)}/${den}`;
  return `${num}/${den}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildOptions(
  prefix: string,
  correct: { label: string; isMathExpr?: boolean; feedback: string },
  distractors: Array<{ label: string; isMathExpr?: boolean; feedback: string }>
): FreePracticeOption[] {
  const seen = new Set<string>([correct.label]);
  const chosenDistractors: typeof distractors = [];
  for (const d of distractors) {
    if (!seen.has(d.label)) {
      seen.add(d.label);
      chosenDistractors.push(d);
    }
    if (chosenDistractors.length === 2) break;
  }

  return shuffle([
    {
      id: `${prefix}-ok`,
      label: correct.label,
      isMathExpr: correct.isMathExpr,
      isCorrect: true,
      feedback: correct.feedback,
    },
    ...chosenDistractors.map((d, idx) => ({
      id: `${prefix}-d${idx}`,
      label: d.label,
      isMathExpr: d.isMathExpr,
      isCorrect: false,
      feedback: d.feedback,
    })),
  ]);
}

// ---------- MATH GENERATORS ----------

function genFraccionesSumaResta(): Omit<FreePracticeExercise, 'id'> {
  const sameDen = Math.random() < 0.35;
  const op: '+' | '-' = Math.random() < 0.5 ? '+' : '-';

  if (sameDen) {
    const den = pickRandom([4, 5, 6, 7, 8, 9, 10, 12]);
    let a = randomInt(2, den + 2);
    let b = randomInt(1, den - 1);
    if (op === '-' && a <= b) {
      a = b + randomInt(1, Math.max(2, den - 2));
    }
    const rawNum = op === '+' ? a + b : a - b;
    const ans = formatFraction(rawNum, den);
    const expr = `${a}/${den} ${op} ${b}/${den} = ?`;

    const wrongDen = formatRawFraction(rawNum, op === '+' ? den * 2 : Math.max(1, den - 1));
    const wrongOpNum = op === '+' ? Math.abs(a - b) : a + b;
    const wrongOp = formatFraction(wrongOpNum, den);
    const altAns = formatFraction(rawNum + 1, den);

    return {
      signature: `fsr-same-${a}-${den}-${op}-${b}`,
      topicId: 'fracciones-suma-resta',
      topicTitle: 'Fracciones · Suma y resta',
      subject: 'matematica',
      prompt: 'Resolvé esta operación con igual denominador y simplificá si hace falta:',
      mathExpr: expr,
      hint: 'Cuando el número de abajo es igual, se mantiene igual y solo operás los de arriba.',
      steps: [
        `Como ambas fracciones tienen denominador ${den}, abajo queda ${den}.`,
        `Arriba hacemos ${a} ${op} ${b} = ${rawNum}.`,
        ans === formatRawFraction(rawNum, den)
          ? `Resultado final: ${ans}.`
          : `Simplificamos ${rawNum}/${den} y obtenemos ${ans}.`,
      ],
      options: buildOptions(
        'fsr',
        {
          label: ans,
          isMathExpr: true,
          feedback: `¡Excelente, Lucía! Como abajo es ${den}, operamos arriba (${a} ${op} ${b} = ${rawNum}) y queda ${ans}.`,
        },
        [
          {
            label: wrongDen,
            isMathExpr: true,
            feedback: `¡Ojo! El denominador (${den}) no se suma ni se resta cuando ya es igual en las dos fracciones.`,
          },
          {
            label: wrongOp !== ans ? wrongOp : altAns,
            isMathExpr: true,
            feedback: `¡Revisá el signo de la cuenta! Acá tenemos ${op === '+' ? 'una suma (+)' : 'una resta (−)'} entre los numeradores.`,
          },
          {
            label: altAns,
            isMathExpr: true,
            feedback: `¡Casi! Volvé a contar ${a} ${op} ${b} arriba manteniendo el ${den} abajo.`,
          },
        ]
      ),
    };
  }

  // Different denominators where one often divides or shares small LCM
  const pairs: Array<[number, number]> = [
    [2, 3],
    [2, 5],
    [3, 4],
    [3, 6],
    [4, 8],
    [2, 6],
    [3, 5],
    [4, 6],
    [5, 10],
    [4, 5],
  ];
  const [d1, d2] = pickRandom(pairs);
  const common = lcm(d1, d2);
  let n1 = randomInt(1, d1 - 1);
  let n2 = randomInt(1, d2 - 1);

  const m1 = common / d1;
  const m2 = common / d2;
  let c1 = n1 * m1;
  let c2 = n2 * m2;

  if (op === '-' && c1 <= c2) {
    n1 = d1 + randomInt(1, d1 - 1);
    c1 = n1 * m1;
  }

  const rawNum = op === '+' ? c1 + c2 : c1 - c2;
  const ans = formatFraction(rawNum, common);
  const expr = `${n1}/${d1} ${op} ${n2}/${d2} = ?`;

  const naiveNum = op === '+' ? n1 + n2 : Math.abs(n1 - n2);
  const naiveDen = op === '+' ? d1 + d2 : Math.max(2, Math.abs(d1 - d2));
  const naiveLabel = `${naiveNum}/${naiveDen}`;
  const forgotConvert = formatFraction(op === '+' ? n1 + n2 : Math.abs(n1 - n2), common);
  const offByOne = formatFraction(rawNum + 1, common);

  return {
    signature: `fsr-diff-${n1}-${d1}-${op}-${n2}-${d2}`,
    topicId: 'fracciones-suma-resta',
    topicTitle: 'Fracciones · Suma y resta',
    subject: 'matematica',
    prompt: 'Buscá el denominador común, convertí las fracciones y resolvé:',
    mathExpr: expr,
    hint: `Probá llevar las dos fracciones al denominador común ${common}.`,
    steps: [
      `Buscamos un denominador común para ${d1} y ${d2}: es ${common}.`,
      m1 > 1
        ? `Convertimos ${n1}/${d1} multiplicando × ${m1} arriba y abajo → ${c1}/${common}.`
        : `${n1}/${d1} ya tiene denominador ${common}.`,
      m2 > 1
        ? `Convertimos ${n2}/${d2} multiplicando × ${m2} arriba y abajo → ${c2}/${common}.`
        : `${n2}/${d2} ya tiene denominador ${common}.`,
      `Ahora operamos arriba: ${c1} ${op} ${c2} = ${rawNum}, sobre ${common} → ${ans}.`,
    ],
    options: buildOptions(
      'fsrd',
      {
        label: ans,
        isMathExpr: true,
        feedback: `¡Muy bien, Lucía! Al pasar ambas a denominador ${common} (${c1}/${common} ${op} ${c2}/${common}) el resultado exacto es ${ans}.`,
      },
      [
        {
          label: naiveLabel,
          isMathExpr: true,
          feedback:
            '¡Cuidado! No se pueden sumar o restar directo arriba y abajo cuando los denominadores son distintos.',
        },
        {
          label: forgotConvert,
          isMathExpr: true,
          feedback: `¡Casi! Al cambiar abajo a ${common}, acordate también de multiplicar arriba por el mismo número.`,
        },
        {
          label: offByOne,
          isMathExpr: true,
          feedback: `¡Estuviste cerca! Revisá la cuenta arriba después de llevar todo a denominador ${common}.`,
        },
      ]
    ),
  };
}

function genFraccionesMultDiv(): Omit<FreePracticeExercise, 'id'> {
  const isDiv = Math.random() < 0.5;
  const n1 = randomInt(1, 5);
  const d1 = pickRandom([2, 3, 4, 5, 6].filter((d) => gcd(n1, d) === 1));
  const n2 = randomInt(1, 5);
  const d2 = pickRandom([2, 3, 4, 5, 6].filter((d) => gcd(n2, d) === 1));

  const neg1 = Math.random() < 0.5 ? -1 : 1;
  const neg2 = Math.random() < 0.45 ? -1 : 1;
  const s1 = neg1 * n1;
  const s2 = neg2 * n2;

  const leftStr = neg1 < 0 ? `(-${n1}/${d1})` : `${n1}/${d1}`;
  const rightStr = neg2 < 0 ? `(-${n2}/${d2})` : `${n2}/${d2}`;
  const opSym = isDiv ? '÷' : '×';

  const resultNum = isDiv ? s1 * d2 : s1 * s2;
  const resultDen = isDiv ? d1 * Math.abs(s2) * (s2 < 0 ? -1 : 1) : d1 * d2;
  const ans = formatFraction(resultNum, resultDen);

  const wrongSign = formatFraction(-resultNum, resultDen);
  const forgotFlip = isDiv
    ? formatFraction(s1 * s2, d1 * d2)
    : formatFraction(s1 * d2, d1 * s2);
  const flippedFirst = formatFraction(d1 * s2, s1 * d2);

  return {
    signature: `fmd-${s1}-${d1}-${opSym}-${s2}-${d2}`,
    topicId: 'fracciones-mult-div',
    topicTitle: 'Fracciones · × y ÷',
    subject: 'matematica',
    prompt: isDiv
      ? 'Resolvé esta división de fracciones cuidando los signos:'
      : 'Resolvé esta multiplicación de fracciones cuidando los signos:',
    mathExpr: `${leftStr} ${opSym} ${rightStr} = ?`,
    hint: isDiv
      ? 'Para dividir, mantené la primera fracción igual, da vuelta la segunda y multiplicá derecho.'
      : 'Multiplicá derecho arriba con arriba y abajo con abajo. Después revisá la regla de los signos.',
    steps: isDiv
      ? [
          `Regla de signos: ${neg1 < 0 ? '(−)' : '(+)'} ÷ ${neg2 < 0 ? '(−)' : '(+)'} = ${neg1 * neg2 > 0 ? '(+)' : '(−)'}.`,
          `Damos vuelta la segunda fracción (${n2}/${d2} pasa a ${d2}/${n2}) y multiplicamos.`,
          `Multiplicamos derecho: (${n1} × ${d2}) / (${d1} × ${n2}) = ${n1 * d2}/${d1 * n2}.`,
          `Con el signo y simplificando queda: ${ans}.`,
        ]
      : [
          `Regla de signos: ${neg1 < 0 ? '(−)' : '(+)'} × ${neg2 < 0 ? '(−)' : '(+)'} = ${neg1 * neg2 > 0 ? '(+)' : '(−)'}.`,
          `Multiplicamos derecho: (${n1} × ${n2}) / (${d1} × ${d2}) = ${n1 * n2}/${d1 * d2}.`,
          `Con el signo y simplificando queda: ${ans}.`,
        ],
    options: buildOptions(
      'fmd',
      {
        label: ans,
        isMathExpr: true,
        feedback: `¡Genial, Lucía! ${isDiv ? 'Diste vuelta la segunda fracción, multiplicaste derecho y aplicaste bien el signo' : 'Multiplicaste derecho y aplicaste perfecto la regla de signos'}: ${ans}.`,
      },
      [
        {
          label: wrongSign,
          isMathExpr: true,
          feedback: `¡El número está bien, pero revisá el signo! Acordate: signos iguales dan (+) y signos distintos dan (−).`,
        },
        {
          label: forgotFlip,
          isMathExpr: true,
          feedback: isDiv
            ? '¡Ojo! En la división hace falta dar vuelta la segunda fracción antes de multiplicar.'
            : '¡Cuidado! En la multiplicación no se da vuelta ninguna fracción, se multiplica derecho.',
        },
        {
          label: flippedFirst,
          isMathExpr: true,
          feedback: '¡Casi! Si dividís, la que se da vuelta es siempre la segunda fracción, no la primera.',
        },
      ]
    ),
  };
}

function genPotenciasRaices(): Omit<FreePracticeExercise, 'id'> {
  const variant = randomInt(1, 5);

  if (variant === 1) {
    // (-a)^2 or (-a)^3
    const base = randomInt(2, 5);
    const exp = pickRandom([2, 3]);
    const val = exp === 2 ? base * base : -(base * base * base);
    const ans = val > 0 ? `+${val}` : String(val);
    const wrongSign = val > 0 ? `-${val}` : `+${Math.abs(val)}`;
    const multInstead = `-${base * exp}`;

    return {
      signature: `pr-neg-${base}-${exp}`,
      topicId: 'potencias-raices',
      topicTitle: 'Potencias y raíces',
      subject: 'matematica',
      prompt: 'Calculá esta potencia mirando bien el paréntesis y el exponente:',
      mathExpr: `(-${base})${toSup(exp)} = ?`,
      hint: `El paréntesis indica que el (−${base}) se multiplica ${exp} veces por sí mismo.`,
      steps: [
        `Repetimos la base (−${base}) multiplicando ${exp} veces.`,
        exp === 2
          ? `(−${base}) × (−${base}): exponente par da (+), ${base} × ${base} = ${val}.`
          : `(−${base}) × (−${base}) × (−${base}): tres signos menos dan (−), ${base}×${base}×${base} = ${Math.abs(val)}.`,
        `Resultado: ${ans}.`,
      ],
      options: buildOptions(
        'pr1',
        {
          label: ans,
          isMathExpr: true,
          feedback: `¡Brillante, Lucía! Exponente ${exp === 2 ? 'par' : 'impar'} con paréntesis da ${ans}.`,
        },
        [
          {
            label: wrongSign,
            isMathExpr: true,
            feedback: `¡El número coincide, pero ojo con el signo! Contá cuántas veces se multiplica el signo menos.`,
          },
          {
            label: multInstead,
            isMathExpr: true,
            feedback: `¡Cuidado! No es ${base} × ${exp}. Una potencia repite la base multiplicándola por sí misma.`,
          },
          {
            label: String(base * base + 1),
            isMathExpr: true,
            feedback: 'Volvé a multiplicar paso a paso la base por sí misma.',
          },
        ]
      ),
    };
  }

  if (variant === 2) {
    // (a/b)^2 or (a/b)^0
    const a = randomInt(1, 5);
    const b = pickRandom([2, 3, 4, 5, 7].filter((d) => gcd(a, d) === 1));
    const isZero = Math.random() < 0.3;

    if (isZero) {
      return {
        signature: `pr-zero-${a}-${b}`,
        topicId: 'potencias-raices',
        topicTitle: 'Potencias y raíces',
        subject: 'matematica',
        prompt: '¿Cuánto da cualquier fracción distinta de cero elevada a la 0?',
        mathExpr: `(${a}/${b})⁰ = ?`,
        hint: 'Hay una regla especial para el exponente 0.',
        steps: [
          'Regla clave: todo número o fracción distinta de cero elevada a la 0 vale siempre 1.',
          `(${a}/${b})⁰ = 1.`,
        ],
        options: buildOptions(
          'pr0',
          {
            label: '1',
            isMathExpr: true,
            feedback: '¡Exacto, Lucía! Cualquier número distinto de cero elevado a la 0 da siempre 1.',
          },
          [
            {
              label: '0',
              isMathExpr: true,
              feedback: '¡Es una trampa muy común! Elevar a la 0 no da 0, siempre da 1.',
            },
            {
              label: `${a}/${b}`,
              isMathExpr: true,
              feedback: `Daría ${a}/${b} si el exponente fuera 1, pero acá el exponente es 0.`,
            },
          ]
        ),
      };
    }

    const ans = `${a * a}/${b * b}`;
    return {
      signature: `pr-frac2-${a}-${b}`,
      topicId: 'potencias-raices',
      topicTitle: 'Potencias y raíces',
      subject: 'matematica',
      prompt: 'Elevá al cuadrado esta fracción:',
      mathExpr: `(${a}/${b})² = ?`,
      hint: 'Multiplicá arriba por sí mismo y abajo por sí mismo.',
      steps: [
        `Elevamos arriba: ${a}² = ${a} × ${a} = ${a * a}.`,
        `Elevamos abajo: ${b}² = ${b} × ${b} = ${b * b}.`,
        `Resultado: ${ans}.`,
      ],
      options: buildOptions(
        'pr2',
        {
          label: ans,
          isMathExpr: true,
          feedback: `¡Perfecto, Lucía! Se eleva tanto arriba (${a}²=${a * a}) como abajo (${b}²=${b * b}): ${ans}.`,
        },
        [
          {
            label: `${a * a}/${b}`,
            isMathExpr: true,
            feedback: `¡Faltó elevar el de abajo! El cuadrado afecta tanto al ${a} como al ${b}.`,
          },
          {
            label: `${a * 2}/${b * 2}`,
            isMathExpr: true,
            feedback: '¡Ojo! Elevar al cuadrado es multiplicar cada número por sí mismo, no por 2.',
          },
          {
            label: `${a}/${b * b}`,
            isMathExpr: true,
            feedback: `También hay que elevar al cuadrado el número de arriba (${a}).`,
          },
        ]
      ),
    };
  }

  if (variant === 3) {
    // Square root of fraction: √(n²/d²)
    const n = randomInt(2, 9);
    const d = pickRandom([3, 4, 5, 7, 10, 11, 13].filter((x) => gcd(n, x) === 1));
    const n2 = n * n;
    const d2 = d * d;
    const ans = `${n}/${d}`;

    return {
      signature: `pr-sqrt-${n}-${d}`,
      topicId: 'potencias-raices',
      topicTitle: 'Potencias y raíces',
      subject: 'matematica',
      prompt: 'Calculá la raíz cuadrada de esta fracción:',
      mathExpr: `√(${n2}/${d2}) = ?`,
      hint: 'Buscá por separado qué número al cuadrado da el de arriba y cuál da el de abajo.',
      steps: [
        `Arriba: √${n2} = ${n} porque ${n} × ${n} = ${n2}.`,
        `Abajo: √${d2} = ${d} porque ${d} × ${d} = ${d2}.`,
        `Resultado: ${ans}.`,
      ],
      options: buildOptions(
        'pr3',
        {
          label: ans,
          isMathExpr: true,
          feedback: `¡Excelente, Lucía! √${n2} = ${n} y √${d2} = ${d}, así que da ${ans}.`,
        },
        [
          {
            label: `${n2 / 2 > 1 ? Math.round(n2 / 2) : n + 1}/${d}`,
            isMathExpr: true,
            feedback: `No dividimos por 2: buscamos un número que multiplicado por sí mismo dé ${n2}.`,
          },
          {
            label: `${n}/${d2}`,
            isMathExpr: true,
            feedback: `¡Acordate de calcular también la raíz cuadrada del número de abajo (${d2})!`,
          },
          {
            label: `${n + 1}/${d}`,
            isMathExpr: true,
            feedback: `Probá multiplicar ${n} × ${n} para comprobar cuánto da arriba.`,
          },
        ]
      ),
    };
  }

  // variant 4 or 5: Cube root (positive or negative)
  const isNeg = variant === 5;
  const n = randomInt(2, 4);
  const d = pickRandom([3, 5].filter((x) => x !== n));
  const n3 = n * n * n;
  const d3 = d * d * d;
  const signStr = isNeg ? '-' : '';
  const ans = `${signStr}${n}/${d}`;

  return {
    signature: `pr-cbrt-${signStr}${n}-${d}`,
    topicId: 'potencias-raices',
    topicTitle: 'Potencias y raíces',
    subject: 'matematica',
    prompt: 'Calculá esta raíz cúbica paso a paso:',
    mathExpr: `∛(${signStr}${n3}/${d3}) = ?`,
    hint: `Buscá qué número multiplicado 3 veces por sí mismo da ${n3} arriba y ${d3} abajo.${isNeg ? ' En raíz cúbica el signo menos se conserva.' : ''}`,
    steps: [
      `Arriba: ${n} × ${n} × ${n} = ${n3} → ∛${n3} = ${n}.`,
      `Abajo: ${d} × ${d} × ${d} = ${d3} → ∛${d3} = ${d}.`,
      isNeg ? `Como el índice es impar (3), el signo (−) se mantiene → ${ans}.` : `Resultado: ${ans}.`,
    ],
    options: buildOptions(
      'pr4',
      {
        label: ans,
        isMathExpr: true,
        feedback: `¡Muy bien, Lucía! ${n}³=${n3} y ${d}³=${d3}${isNeg ? ', y en raíz cúbica se conserva el signo menos' : ''}: ${ans}.`,
      },
      [
        {
          label: isNeg ? `+${n}/${d}` : `-${n}/${d}`,
          isMathExpr: true,
          feedback: isNeg
            ? '¡Cuidado con el signo! En raíces cúbicas (índice impar), un número negativo conserva el (−).'
            : 'Como adentro es positivo, el resultado es positivo.',
        },
        {
          label: `${signStr}${n + 1}/${d}`,
          isMathExpr: true,
          feedback: `Multiplicá ${n} × ${n} × ${n} para verificar el número de arriba.`,
        },
        {
          label: `${signStr}${n}/${d * d}`,
          isMathExpr: true,
          feedback: `¡También hay que calcular la raíz cúbica de ${d3} abajo!`,
        },
      ]
    ),
  };
}

function genMonomiosSemejantes(): Omit<FreePracticeExercise, 'id'> {
  const mode = randomInt(1, 3);

  if (mode === 1) {
    // Combine like terms
    const letter = pickRandom(['x', 'y', 'a', 'm', 'xy', 'a²b', 'x²']);
    const c1 = randomInt(3, 9);
    const c2 = randomInt(2, 7);
    const c3 = randomInt(1, Math.min(6, c1 + c2 - 1));
    const total = c1 + c2 - c3;
    const expr = `${c1}${letter} + ${c2}${letter} - ${c3}${letter} = ?`;
    const ans = `${total}${letter}`;

    return {
      signature: `ms-sum-${c1}-${c2}-${c3}-${letter}`,
      topicId: 'monomios-semejantes',
      topicTitle: 'Monomios · Partes y suma',
      subject: 'matematica',
      prompt: 'Como todos estos monomios son semejantes, juntalos en uno solo:',
      mathExpr: expr,
      hint: `Mantené exactamente la misma parte literal (${letter}) y operá solo los números de adelante.`,
      steps: [
        `Son semejantes porque todos tienen ${letter}.`,
        `Operamos los coeficientes: ${c1} + ${c2} = ${c1 + c2}, y ${c1 + c2} − ${c3} = ${total}.`,
        `La letra ${letter} no cambia → ${ans}.`,
      ],
      options: buildOptions(
        'ms1',
        {
          label: ans,
          isMathExpr: true,
          feedback: `¡Exacto, Lucía! Juntamos los números (${c1} + ${c2} − ${c3} = ${total}) y la parte literal (${letter}) queda intacta: ${ans}.`,
        },
        [
          {
            label: `${total}${letter}³`,
            isMathExpr: true,
            feedback: '¡Ojo! Al sumar o restar monomios semejantes, los exponentes NO se suman.',
          },
          {
            label: `${c1 + c2 + c3}${letter}`,
            isMathExpr: true,
            feedback: `Revisá el último término: dice − ${c3}${letter} (resta), no suma.`,
          },
          {
            label: `${total + 1}${letter}`,
            isMathExpr: true,
            feedback: `Volvé a calcular ${c1} + ${c2} − ${c3} paso a paso.`,
          },
        ]
      ),
    };
  }

  if (mode === 2) {
    // Find degree
    const coeff = pickRandom([-6, -4, 3, 5, 7, -8]);
    const e1 = randomInt(1, 3);
    const e2 = randomInt(1, 3);
    const e3 = Math.random() < 0.4 ? 1 : 0;
    const vars =
      e3 === 1
        ? `a${e1 > 1 ? toSup(e1) : ''}b${e2 > 1 ? toSup(e2) : ''}c`
        : `x${e1 > 1 ? toSup(e1) : ''}y${e2 > 1 ? toSup(e2) : ''}`;
    const degree = e1 + e2 + e3;

    return {
      signature: `ms-deg-${coeff}-${e1}-${e2}-${e3}`,
      topicId: 'monomios-semejantes',
      topicTitle: 'Monomios · Partes y suma',
      subject: 'matematica',
      prompt: '¿Cuál es el grado absoluto de este monomio?',
      mathExpr: `${coeff}${vars}`,
      hint: 'Sumá los exponentes de todas las letras. Si una letra no tiene exponente escrito, vale 1.',
      steps: [
        `Identificamos cada exponente de las letras: ${e1}${e2 ? ` y ${e2}` : ''}${e3 ? ' y 1' : ''}.`,
        `Los sumamos: ${e1} + ${e2}${e3 ? ' + 1' : ''} = ${degree}.`,
        `Grado = ${degree}.`,
      ],
      options: buildOptions(
        'ms2',
        {
          label: `Grado ${degree}`,
          feedback: `¡Genial, Lucía! Sumaste todos los exponentes de las letras (recordando que la letra sin exponente vale 1) y da ${degree}.`,
        },
        [
          {
            label: `Grado ${Math.max(e1, e2) + 1 === degree ? Math.abs(coeff) : Math.max(e1, e2)}`,
            feedback: '¡No te olvides de sumar los exponentes de todas las letras juntas!',
          },
          {
            label: `Grado ${degree + 1}`,
            feedback: 'Contá de nuevo cada exponente de las letras (el coeficiente de adelante no se suma al grado).',
          },
          {
            label: `Grado ${Math.max(1, degree - 1)}`,
            feedback: '¡Atención! Si una letra aparece sin numerito arriba, su exponente vale 1.',
          },
        ]
      ),
    };
  }

  // mode 3: Identify like monomial
  const baseCoeff = pickRandom([-5, 3, 7, -2]);
  const e1 = randomInt(2, 4);
  const e2 = randomInt(1, 3);
  const targetLit = `x${toSup(e1)}y${e2 > 1 ? toSup(e2) : ''}`;
  const altCoeff = pickRandom([4, 9, -8].filter((c) => c !== baseCoeff));

  const correctLit = `${altCoeff}${targetLit}`;
  const wrongExp = `${altCoeff}x${toSup(e1 + 1)}y${e2 > 1 ? toSup(e2) : ''}`;
  const wrongLetter = `${altCoeff}x${toSup(e1)}z${e2 > 1 ? toSup(e2) : ''}`;

  return {
    signature: `ms-like-${baseCoeff}-${e1}-${e2}`,
    topicId: 'monomios-semejantes',
    topicTitle: 'Monomios · Partes y suma',
    subject: 'matematica',
    prompt: '¿Cuál de estos monomios es SEMEJANTE al siguiente?',
    mathExpr: `${baseCoeff}${targetLit}`,
    hint: 'Para ser semejante tiene que tener exactamente las mismas letras con los mismos exponentes.',
    steps: [
      `Miramos la parte literal del original: ${targetLit}.`,
      `El coeficiente de adelante puede cambiar (${baseCoeff} vs ${altCoeff}), pero ${targetLit} debe quedar idéntica.`,
      `Por eso ${correctLit} es semejante.`,
    ],
    options: buildOptions(
      'ms3',
      {
        label: correctLit,
        isMathExpr: true,
        feedback: `¡Exacto, Lucía! Tiene exactamente la misma parte literal (${targetLit}), aunque cambie el número de adelante.`,
      },
      [
        {
          label: wrongExp,
          isMathExpr: true,
          feedback: '¡Mirá los exponentes con lupa! Cambió el exponente de x, así que ya es otra familia.',
        },
        {
          label: wrongLetter,
          isMathExpr: true,
          feedback: '¡Casi! Cambió la letra y por una z, así que no son semejantes.',
        },
      ]
    ),
  };
}

function genMonomiosMultDiv(): Omit<FreePracticeExercise, 'id'> {
  const isDiv = Math.random() < 0.48;
  const letter = pickRandom(['x', 'a', 'm']);

  if (!isDiv) {
    const c1 = pickRandom([-4, -3, -2, 2, 3, 4, 5]);
    const c2 = pickRandom([-3, -2, 2, 3, 4, 5]);
    const e1 = randomInt(1, 4);
    const e2 = randomInt(1, 4);
    const cRes = c1 * c2;
    const eRes = e1 + e2;

    const left = `${c1}${letter}${e1 > 1 ? toSup(e1) : ''}`;
    const right = c2 < 0 ? `(${c2}${letter}${e2 > 1 ? toSup(e2) : ''})` : `${c2}${letter}${e2 > 1 ? toSup(e2) : ''}`;
    const ans = `${cRes}${letter}${toSup(eRes)}`;

    const wrongMultExp = `${cRes}${letter}${toSup(Math.max(2, e1 * e2 === eRes ? eRes + 1 : e1 * e2))}`;
    const wrongSign = `${-cRes}${letter}${toSup(eRes)}`;
    const wrongAddCoeff = `${c1 + c2}${letter}${toSup(eRes)}`;

    return {
      signature: `mmd-mul-${c1}-${e1}-${c2}-${e2}-${letter}`,
      topicId: 'monomios-mult-div',
      topicTitle: 'Monomios · × y ÷',
      subject: 'matematica',
      prompt: 'Multiplicá estos dos monomios paso a paso:',
      mathExpr: `${left} × ${right} = ?`,
      hint: '1. Multiplicá los números de adelante (con sus signos). 2. Sumá los exponentes de la letra.',
      steps: [
        `Multiplicamos coeficientes: (${c1}) × (${c2}) = ${cRes}.`,
        `Sumamos exponentes de ${letter}: ${e1} + ${e2} = ${eRes}.`,
        `Resultado: ${ans}.`,
      ],
      options: buildOptions(
        'mmdm',
        {
          label: ans,
          isMathExpr: true,
          feedback: `¡Excelente, Lucía! Multiplicaste ${c1} × ${c2} = ${cRes} y sumaste los exponentes (${e1} + ${e2} = ${eRes}): ${ans}.`,
        },
        [
          {
            label: wrongMultExp,
            isMathExpr: true,
            feedback: '¡Ojo con los exponentes! Al multiplicar letras iguales, los exponentes se SUMAN, no se multiplican.',
          },
          {
            label: wrongSign,
            isMathExpr: true,
            feedback: '¡El número y el exponente están bien, pero revisá la regla de signos!',
          },
          {
            label: wrongAddCoeff,
            isMathExpr: true,
            feedback: 'Los coeficientes de adelante sí se multiplican entre sí; solo los exponentes se suman.',
          },
        ]
      ),
    };
  }

  // Division with exact integer quotient & e1 > e2
  const q = pickRandom([-5, -4, -3, -2, 2, 3, 4, 5]);
  const c2 = pickRandom([-3, -2, 2, 3, 4]);
  const c1 = q * c2;
  const e2 = randomInt(1, 3);
  const diff = randomInt(1, 3);
  const e1 = e2 + diff;

  const left = `${c1}${letter}${toSup(e1)}`;
  const right = c2 < 0 ? `(${c2}${letter}${e2 > 1 ? toSup(e2) : ''})` : `${c2}${letter}${e2 > 1 ? toSup(e2) : ''}`;
  const ans = `${q}${letter}${diff > 1 ? toSup(diff) : ''}`;

  const wrongAddExp = `${q}${letter}${toSup(e1 + e2)}`;
  const wrongSign = `${-q}${letter}${diff > 1 ? toSup(diff) : ''}`;
  const wrongDiff = `${q}${letter}${toSup(diff + 1)}`;

  return {
    signature: `mmd-div-${c1}-${e1}-${c2}-${e2}-${letter}`,
    topicId: 'monomios-mult-div',
    topicTitle: 'Monomios · × y ÷',
    subject: 'matematica',
    prompt: 'Dividí estos dos monomios cuidando los signos y los exponentes:',
    mathExpr: `${left} ÷ ${right} = ?`,
    hint: '1. Dividí los números de adelante (con regla de signos). 2. Restá los exponentes de la letra.',
    steps: [
      `Dividimos coeficientes: (${c1}) ÷ (${c2}) = ${q}.`,
      `Restamos exponentes de ${letter}: ${e1} − ${e2} = ${diff}.`,
      `Resultado: ${ans}.`,
    ],
    options: buildOptions(
      'mmdd',
      {
        label: ans,
        isMathExpr: true,
        feedback: `¡Brillante, Lucía! Dividiste ${c1} ÷ ${c2} = ${q} y restaste los exponentes (${e1} − ${e2} = ${diff}): ${ans}.`,
      },
      [
        {
          label: wrongAddExp,
          isMathExpr: true,
          feedback: '¡Atención! En la división de potencias con la misma letra, los exponentes se RESTAN.',
        },
        {
          label: wrongSign,
          isMathExpr: true,
          feedback: '¡Casi! Revisá el signo de la división: (−) ÷ (−) da (+), y signos distintos dan (−).',
        },
        {
          label: wrongDiff,
          isMathExpr: true,
          feedback: `Volvé a restar ${e1} − ${e2} en el exponente de ${letter}.`,
        },
      ]
    ),
  };
}

// ---------- ENGLISH DYNAMIC POOLS ----------

interface EnglishTemplate {
  sig: string;
  prompt: string;
  highlight?: string;
  speak?: string;
  hint: string;
  steps: string[];
  correct: string;
  feedbackOk: string;
  wrong1: { label: string; feedback: string };
  wrong2: { label: string; feedback: string };
}

const WEATHER_POOL: EnglishTemplate[] = [
  {
    sig: 'w-sunny',
    prompt: 'SI HOY BRILLA EL SOL EN EL CIELO, ¿CÓMO ESTÁ EL DÍA?',
    highlight: 'TODAY IT IS ___ .',
    speak: 'Today it is sunny.',
    hint: 'PENSÁ EN LA PALABRA SUN (SOL).',
    steps: ['SUN = SOL → SUNNY = SOLEADO.', 'CLOUDY = NUBLADO · SNOWY = NEVADO.'],
    correct: 'SUNNY',
    feedbackOk: '¡GENIAL, LUCÍA! SUNNY SIGNIFICA SOLEADO.',
    wrong1: { label: 'CLOUDY', feedback: '¡CASI! CLOUDY SIGNIFICA NUBLADO (DE CLOUD = NUBE).' },
    wrong2: { label: 'RAINY', feedback: 'RAINY SIGNIFICA LLUVIOSO. PROBÁ BUSCANDO LA PALABRA DE SOL.' },
  },
  {
    sig: 'w-rainy',
    prompt: 'SI NECESITÁS PARAGUAS PORQUE CAE AGUA DEL CIELO, ¿QUÉ CLIMA ES?',
    highlight: 'TAKE AN UMBRELLA! IT IS ___ .',
    speak: 'It is rainy.',
    hint: 'RAIN ES LLUVIA.',
    steps: ['RAIN = LLUVIA → RAINY = LLUVIOSO.', 'WINDY = VENTOSO · SUNNY = SOLEADO.'],
    correct: 'RAINY',
    feedbackOk: '¡MUY BIEN, LUCÍA! RAINY QUIERE DECIR LLUVIOSO.',
    wrong1: { label: 'WINDY', feedback: 'WINDY ES CON MUCHO VIENTO (WIND).' },
    wrong2: { label: 'SUNNY', feedback: 'SUNNY ES SOLEADO; SI LLUEVE USAMOS RAINY.' },
  },
  {
    sig: 'w-windy',
    prompt: 'CUANDO SE MUEVEN FUERTE LOS ÁRBOLES POR EL VIENTO, DECIMOS:',
    highlight: 'IT IS VERY ___ TODAY.',
    speak: 'It is very windy today.',
    hint: 'VIENTO EN INGLÉS ES WIND.',
    steps: ['WIND = VIENTO → WINDY = VENTOSO.', 'SNOWY = NEVADO · CLOUDY = NUBLADO.'],
    correct: 'WINDY',
    feedbackOk: '¡EXACTO, LUCÍA! WINDY SIGNIFICA VENTOSO.',
    wrong1: { label: 'SNOWY', feedback: 'SNOWY VIENE DE SNOW (NIEVE).' },
    wrong2: { label: 'STORMY', feedback: 'STORMY ES TORMENTOSO; PARA VIENTO USAMOS WINDY.' },
  },
  {
    sig: 'w-stormy',
    prompt: 'SI HAY RAYOS, TRUENOS Y LLUVIA FUERTE, EL DÍA ESTÁ:',
    highlight: 'IT IS ___ OUTSIDE.',
    speak: 'It is stormy outside.',
    hint: 'TORMENTA SE DICE STORM.',
    steps: ['STORM = TORMENTA → STORMY = TORMENTOSO.'],
    correct: 'STORMY',
    feedbackOk: '¡BRILLANTE, LUCÍA! STORMY SIGNIFICA TORMENTOSO.',
    wrong1: { label: 'SUNNY', feedback: 'SUNNY ES UN DÍA SOLEADO Y TRANQUILO.' },
    wrong2: { label: 'SNOWY', feedback: 'SNOWY ES CUANDO CAE NIEVE.' },
  },
  {
    sig: 'w-flood',
    prompt: '¿QUÉ DESASTRE NATURAL OCURRE CUANDO EL AGUA TAPA LAS CALLES?',
    highlight: 'NATURAL DISASTER: TOO MUCH WATER',
    speak: 'Flood.',
    hint: 'EMPIEZA CON F Y ES MUY CORTITA.',
    steps: ['FLOOD = INUNDACIÓN.', 'WILDFIRE = INCENDIO FORESTAL · TORNADO = TORNADO.'],
    correct: 'FLOOD',
    feedbackOk: '¡PERFECTO, LUCÍA! FLOOD SIGNIFICA INUNDACIÓN.',
    wrong1: { label: 'WILDFIRE', feedback: 'WILDFIRE TIENE FIRE (FUEGO): ES INCENDIO FORESTAL.' },
    wrong2: { label: 'VOLCANO', feedback: 'VOLCANO ES VOLCÁN.' },
  },
  {
    sig: 'w-wildfire',
    prompt: '¿QUÉ PALABRA NOMBRA UN INCENDIO EN EL BOSQUE O EN EL CAMPO?',
    highlight: 'NATURAL DISASTER: FIRE IN THE FOREST',
    speak: 'Wildfire.',
    hint: 'MIRÁ EL FINAL DE LA PALABRA: FIRE SIGNIFICA FUEGO.',
    steps: ['WILDFIRE = INCENDIO FORESTAL.', 'FLOOD = INUNDACIÓN · SNOWY = NEVADO.'],
    correct: 'WILDFIRE',
    feedbackOk: '¡EXCELENTE, LUCÍA! WILDFIRE SIGNIFICA INCENDIO FORESTAL.',
    wrong1: { label: 'FLOOD', feedback: 'FLOOD ES INUNDACIÓN (MUCHA AGUA).' },
    wrong2: { label: 'TORNADO', feedback: 'TORNADO ES UN REMOLINO DE VIENTO MUY FUERTE.' },
  },
  {
    sig: 'w-cloudy',
    prompt: 'SI EL CIELO ESTÁ GRIS Y LLENO DE NUBES SIN SOL, ESTÁ:',
    highlight: 'LOOK AT THE SKY! IT IS ___ .',
    speak: 'It is cloudy.',
    hint: 'NUBE SE DICE CLOUD.',
    steps: ['CLOUD = NUBE → CLOUDY = NUBLADO.'],
    correct: 'CLOUDY',
    feedbackOk: '¡MUY BIEN, LUCÍA! CLOUDY ES NUBLADO.',
    wrong1: { label: 'SNOWY', feedback: 'SNOWY SIGNIFICA NEVADO.' },
    wrong2: { label: 'VOLCANO', feedback: 'VOLCANO ES UN DESASTRE NATURAL (VOLCÁN).' },
  },
  {
    sig: 'w-snowy',
    prompt: 'EN INVIERNO EN LA MONTAÑA CUANDO CAE NIEVE BLANCA, ESTÁ:',
    highlight: 'IT IS COLD AND ___ IN THE MOUNTAINS.',
    speak: 'It is cold and snowy.',
    hint: 'NIEVE EN INGLÉS ES SNOW.',
    steps: ['SNOW = NIEVE → SNOWY = NEVADO.'],
    correct: 'SNOWY',
    feedbackOk: '¡EXACTO, LUCÍA! SNOWY SIGNIFICA NEVADO.',
    wrong1: { label: 'RAINY', feedback: 'RAINY ES LLUVIOSO (AGUA, NO NIEVE).' },
    wrong2: { label: 'SUNNY', feedback: 'SUNNY SIGNIFICA SOLEADO.' },
  },
];

const WAS_WERE_POOL: EnglishTemplate[] = [
  {
    sig: 'ww-i',
    prompt: 'ELEGÍ LA FORMA CORRECTA PARA COMPLETAR:',
    highlight: 'I ___ AT HOME YESTERDAY.',
    speak: 'I was at home yesterday.',
    hint: 'ACORDATE QUE CON I (YO) USAMOS WAS.',
    steps: ['I / HE / SHE / IT → WAS.', 'YOU / WE / THEY → WERE.'],
    correct: 'WAS',
    feedbackOk: '¡PERFECTO, LUCÍA! I SIEMPRE VA CON WAS.',
    wrong1: { label: 'WERE', feedback: 'WERE SE USA CON YOU, WE O THEY (VARIAS PERSONAS).' },
    wrong2: { label: "WEREN'T", feedback: "WEREN'T TAMBIÉN ES PARA YOU, WE O THEY." },
  },
  {
    sig: 'ww-they',
    prompt: 'MIRÁ BIEN LA PERSONA ANTES DE ELEGIR:',
    highlight: 'THEY ___ VERY HAPPY.',
    speak: 'They were very happy.',
    hint: 'THEY SON ELLOS (VARIAS PERSONAS).',
    steps: ['THEY = PLURAL (VARIOS).', 'CON VARIOS USAMOS WERE.'],
    correct: 'WERE',
    feedbackOk: '¡EXCELENTE, LUCÍA! THEY VA CON WERE.',
    wrong1: { label: 'WAS', feedback: 'WAS ES PARA UNA SOLA PERSONA O COSA (I, HE, SHE, IT).' },
    wrong2: { label: "WASN'T", feedback: "WASN'T TAMBIÉN ES PARA SINGULAR (UNA PERSONA)." },
  },
  {
    sig: 'ww-friends',
    prompt: '¿QUÉ FORMA VA CUANDO HABLAMOS DE VARIOS AMIGOS?',
    highlight: 'MY FRIENDS ___ IN CORDOBA.',
    speak: 'My friends were in Cordoba.',
    hint: 'MY FRIENDS TERMINA EN -S: SON VARIOS (EQUIVALE A THEY).',
    steps: ['MY FRIENDS = VARIAS PERSONAS (THEY).', 'POR ESO VA WERE.'],
    correct: 'WERE',
    feedbackOk: '¡BRILLANTE, LUCÍA! MY FRIENDS SON VARIOS, ASÍ QUE VA CON WERE.',
    wrong1: { label: 'WAS', feedback: 'SERÍA WAS SI DIJERA MY FRIEND (UN SOLO AMIGO).' },
    wrong2: { label: "WASN'T", feedback: "WASN'T ES PARA SINGULAR, PERO ACÁ DICE FRIENDS (PLURAL)." },
  },
  {
    sig: 'ww-lucia',
    prompt: 'COMPLETÁ ESTA ORACIÓN CON UN NOMBRE PROPIO:',
    highlight: 'LUCÍA ___ AT SCHOOL ON MONDAY.',
    speak: 'Lucia was at school on Monday.',
    hint: 'LUCÍA ES UNA SOLA PERSONA (EQUIVALE A SHE).',
    steps: ['LUCÍA = SHE (UNA PERSONA).', 'CON SHE USAMOS WAS.'],
    correct: 'WAS',
    feedbackOk: '¡GENIAL, LUCÍA! CON UN NOMBRE PROPIO SINGULAR USAMOS WAS.',
    wrong1: { label: 'WERE', feedback: 'WERE SE USA CUANDO SON DOS O MÁS PERSONAS.' },
    wrong2: { label: "WEREN'T", feedback: "WEREN'T TAMBIÉN ES PARA VARIOS." },
  },
  {
    sig: 'ww-neg-weather',
    prompt: 'QUEREMOS DECIR QUE EL CLIMA NO ESTABA FRÍO AYER:',
    highlight: 'THE WEATHER ___ COLD YESTERDAY.',
    speak: "The weather wasn't cold yesterday.",
    hint: 'THE WEATHER ES UNA SOLA COSA (IT) Y ES NEGATIVA.',
    steps: ['THE WEATHER = IT → WAS.', 'EN NEGATIVO: WAS + NOT = WASN’T.'],
    correct: "WASN'T",
    feedbackOk: "¡EXACTO, LUCÍA! THE WEATHER ES SINGULAR Y EN NEGATIVO QUEDA WASN'T.",
    wrong1: { label: "WEREN'T", feedback: "WEREN'T ES PARA PLURALES (VARIOS)." },
    wrong2: { label: 'WAS', feedback: 'WAS ES AFIRMATIVO, Y ACÁ QUEREMOS DECIR QUE NO ESTABA FRÍO.' },
  },
  {
    sig: 'ww-q-you',
    prompt: 'ARMAMOS UNA PREGUNTA EN PASADO CON YOU:',
    highlight: '___ YOU AT THE PARK LAST SUNDAY?',
    speak: 'Were you at the park last Sunday?',
    hint: 'EN PREGUNTAS, WAS O WERE PASAN ADELANTE. CON YOU USAMOS...',
    steps: ['CON YOU SIEMPRE USAMOS WERE.', 'EN PREGUNTA VA ADELANTE: WERE YOU ...?'],
    correct: 'WERE',
    feedbackOk: '¡MUY BIEN, LUCÍA! CON YOU SIEMPRE VA WERE: WERE YOU ...?',
    wrong1: { label: 'WAS', feedback: 'YOU NO USA WAS, SIEMPRE VA CON WERE.' },
    wrong2: { label: 'DID', feedback: 'CON ADJETIVOS O LUGARES (AT THE PARK) USAMOS TO BE (WERE), NO DID.' },
  },
  {
    sig: 'ww-neg-we',
    prompt: 'QUEREMOS DECIR QUE NOSOTROS NO ESTÁBAMOS CANSADOS:',
    highlight: 'WE ___ TIRED AFTER CLASS.',
    speak: "We weren't tired after class.",
    hint: 'WE (NOSOTROS) VA CON WERE. ¿CÓMO SE NIEGA?',
    steps: ['WE = PLURAL → WERE.', 'EN NEGATIVO: WERE + NOT = WEREN’T.'],
    correct: "WEREN'T",
    feedbackOk: "¡PERFECTO, LUCÍA! WE + NEGATIVO SE FORMA CON WEREN'T.",
    wrong1: { label: "WASN'T", feedback: "WASN'T VA CON I, HE, SHE O IT." },
    wrong2: { label: 'WERE', feedback: 'ACORDATE QUE BUSCAMOS LA FORMA NEGATIVA (NO ESTÁBAMOS).' },
  },
];

const PAST_SIMPLE_POOL: EnglishTemplate[] = [
  {
    sig: 'ps-play',
    prompt: 'ORACIÓN AFIRMATIVA EN PASADO CON VERBO REGULAR (PLAY):',
    highlight: 'YESTERDAY I ___ MUSIC IN MY ROOM.',
    speak: 'Yesterday I played music in my room.',
    hint: 'LOS VERBOS REGULARES EN AFIRMATIVA SOLO SUMAN -ED.',
    steps: ['PLAY ES REGULAR.', 'EN AFIRMATIVA EN PASADO QUEDA PLAYED.'],
    correct: 'PLAYED',
    feedbackOk: '¡MUY BIEN, LUCÍA! PLAY + ED = PLAYED.',
    wrong1: { label: 'PLAY', feedback: 'SIN -ED ESTARÍA EN PRESENTE, Y LA ORACIÓN DICE YESTERDAY (AYER).' },
    wrong2: { label: 'DID PLAYED', feedback: 'EN ORACIONES AFIRMATIVAS NO HACE FALTA PONER DID.' },
  },
  {
    sig: 'ps-go',
    prompt: '¿CUÁL ES EL PASADO DEL VERBO IRREGULAR GO (IR)?',
    highlight: 'LAST WEEK WE ___ TO THE CINEMA.',
    speak: 'Last week we went to the cinema.',
    hint: 'GO ES IRREGULAR: CAMBIA DE FORMA COMPLETAMENTE.',
    steps: ['GO → WENT (FUI / FUIMOS).'],
    correct: 'WENT',
    feedbackOk: '¡EXCELENTE, LUCÍA! EL PASADO DE GO ES WENT.',
    wrong1: { label: 'GOED', feedback: 'GO ES IRREGULAR, NO LLEVA -ED.' },
    wrong2: { label: 'SAW', feedback: 'SAW ES EL PASADO DE SEE (VER), NO DE GO (IR).' },
  },
  {
    sig: 'ps-didnt-watch',
    prompt: 'COMPLETÁ ESTA ORACIÓN NEGATIVA EN PASADO:',
    highlight: "SHE DIDN'T ___ TV LAST NIGHT.",
    speak: "She didn't watch TV last night.",
    hint: "REGLA DE ORO: SI YA ESTÁ DIDN'T, EL VERBO QUEDA EN FORMA NORMAL.",
    steps: ["DIDN'T YA MARCA EL PASADO.", 'POR ESO WATCH QUEDA SIN -ED.'],
    correct: 'WATCH',
    feedbackOk: "¡BRILLANTE, LUCÍA! CON DIDN'T EL VERBO VUELVE A SU FORMA NORMAL: WATCH.",
    wrong1: { label: 'WATCHED', feedback: "COMO YA PUSIMOS DIDN'T, NO SE AGREGA -ED AL VERBO." },
    wrong2: { label: 'WATCHING', feedback: "DESPUÉS DE DIDN'T VA EL VERBO BASE (WATCH), SIN -ING." },
  },
  {
    sig: 'ps-see',
    prompt: '¿CUÁL ES EL PASADO DEL VERBO IRREGULAR SEE (VER)?',
    highlight: 'I ___ A RAINBOW AFTER THE RAIN.',
    speak: 'I saw a rainbow after the rain.',
    hint: 'ES UNO DE LOS 6 IRREGULARES CLAVE QUE APRENDIMOS.',
    steps: ['SEE (VER) → SAW (VI / VIO).'],
    correct: 'SAW',
    feedbackOk: '¡GENIAL, LUCÍA! EL PASADO DE SEE ES SAW.',
    wrong1: { label: 'SEED', feedback: 'SEE ES IRREGULAR, NO SE FORMA CON -ED.' },
    wrong2: { label: 'ATE', feedback: 'ATE ES EL PASADO DE EAT (COMER).' },
  },
  {
    sig: 'ps-did-q',
    prompt: 'COMPLETÁ ESTA PREGUNTA EN PASADO:',
    highlight: 'DID YOU ___ PIZZA YESTERDAY?',
    speak: 'Did you eat pizza yesterday?',
    hint: 'COMO APARECE DID ADELANTE, EL VERBO NO CAMBIA AL PASADO.',
    steps: ['DID + PERSONA + VERBO NORMAL.', 'POR ESO VA EAT, NO ATE.'],
    correct: 'EAT',
    feedbackOk: '¡EXACTO, LUCÍA! CON DID ADELANTE EL VERBO QUEDA NORMAL: EAT.',
    wrong1: { label: 'ATE', feedback: 'ATE YA ESTÁ EN PASADO; SI YA PUSIMOS DID, USAMOS EAT.' },
    wrong2: { label: 'EATED', feedback: 'EAT ES IRREGULAR Y ADEMÁS ESTÁ DID EN LA PREGUNTA.' },
  },
  {
    sig: 'ps-eat',
    prompt: 'ORACIÓN AFIRMATIVA EN PASADO CON EAT (COMER):',
    highlight: 'WE ___ EMPANADAS ON SUNDAY.',
    speak: 'We ate empanadas on Sunday.',
    hint: 'ES AFIRMATIVA Y NO TIENE DID. EAT ES IRREGULAR.',
    steps: ['EAT (COMER) → ATE (COMÍ / COMIMOS).'],
    correct: 'ATE',
    feedbackOk: '¡PERFECTO, LUCÍA! EL PASADO DE EAT ES ATE.',
    wrong1: { label: 'EATED', feedback: 'EAT ES IRREGULAR, ASÍ QUE NO LLEVA -ED.' },
    wrong2: { label: 'MADE', feedback: 'MADE ES EL PASADO DE MAKE (HACER).' },
  },
  {
    sig: 'ps-have',
    prompt: '¿CUÁL ES EL PASADO DEL VERBO HAVE (TENER)?',
    highlight: 'LUCÍA ___ A GREAT DAY AT SCHOOL.',
    speak: 'Lucia had a great day at school.',
    hint: 'CAMBIA LA V POR D.',
    steps: ['HAVE (TENER) → HAD (TUVO).'],
    correct: 'HAD',
    feedbackOk: '¡MUY BIEN, LUCÍA! EL PASADO DE HAVE ES HAD.',
    wrong1: { label: 'HAVED', feedback: 'HAVE ES IRREGULAR, NO LLEVA -ED.' },
    wrong2: { label: 'CAME', feedback: 'CAME ES EL PASADO DE COME (VENIR).' },
  },
  {
    sig: 'ps-study',
    prompt: 'COMPLETÁ ESTA ORACIÓN AFIRMATIVA CON STUDY (ESTUDIAR):',
    highlight: 'HE ___ ENGLISH FOR TEN MINUTES.',
    speak: 'He studied English for ten minutes.',
    hint: 'ES REGULAR: CAMBIA LA Y POR I Y AGREGA -ED.',
    steps: ['STUDY → STUDIED.'],
    correct: 'STUDIED',
    feedbackOk: '¡EXCELENTE, LUCÍA! STUDY EN PASADO QUEDA STUDIED.',
    wrong1: { label: 'STUDY', feedback: 'SIN CAMBIO QUEDARÍA EN PRESENTE.' },
    wrong2: { label: 'DID STUDIED', feedback: 'EN AFIRMATIVA NO SE PONE DID DELANTE.' },
  },
];

const IN_ON_AT_POOL: EnglishTemplate[] = [
  {
    sig: 't-may',
    prompt: 'COMPLETÁ CON IN, ON O AT PARA HABLAR DE UN MES:',
    highlight: 'MY BIRTHDAY IS ___ MAY.',
    speak: 'My birthday is in May.',
    hint: 'MAY ES UN MES (PERÍODO GRANDE).',
    steps: ['MESES Y AÑOS (PERÍODOS GRANDES) → IN.', 'IN MAY.'],
    correct: 'IN',
    feedbackOk: '¡PERFECTO, LUCÍA! LOS MESES SIEMPRE VAN CON IN (IN MAY).',
    wrong1: { label: 'ON', feedback: 'ON SE USA PARA DÍAS DE LA SEMANA O FECHAS CON DÍA.' },
    wrong2: { label: 'AT', feedback: 'AT SE USA PARA HORAS EXACTAS.' },
  },
  {
    sig: 't-monday',
    prompt: 'ELEGÍ LA PALABRA CORRECTA PARA UN DÍA DE LA SEMANA:',
    highlight: 'WE HAVE ART CLASS ___ MONDAY.',
    speak: 'We have art class on Monday.',
    hint: 'MONDAY ES UN DÍA.',
    steps: ['DÍAS DE LA SEMANA → ON.', 'ON MONDAY.'],
    correct: 'ON',
    feedbackOk: '¡GENIAL, LUCÍA! LOS DÍAS SIEMPRE LLEVAN ON (ON MONDAY).',
    wrong1: { label: 'IN', feedback: 'IN SE USA PARA MESES, AÑOS O ESTACIONES.' },
    wrong2: { label: 'AT', feedback: 'AT ES PARA HORAS EXACTAS COMO AT 8 O’CLOCK.' },
  },
  {
    sig: 't-8oclock',
    prompt: '¿QUÉ PREPOSICIÓN VA CON UNA HORA EXACTA?',
    highlight: "THE BUS ARRIVES ___ 8 O'CLOCK.",
    speak: "The bus arrives at 8 o'clock.",
    hint: "8 O'CLOCK ES UNA HORA EXACTA.",
    steps: ['HORAS EXACTAS → AT.', "AT 8 O'CLOCK."],
    correct: 'AT',
    feedbackOk: "¡EXACTO, LUCÍA! PARA HORAS EXACTAS USAMOS AT (AT 8 O'CLOCK).",
    wrong1: { label: 'ON', feedback: 'ON SE USA PARA DÍAS, NO PARA HORAS.' },
    wrong2: { label: 'IN', feedback: 'IN ES PARA PERÍODOS GRANDES COMO MESES O AÑOS.' },
  },
  {
    sig: 't-2025',
    prompt: 'COMPLETÁ CON IN, ON O AT PARA UN AÑO:',
    highlight: 'WE TRAVELED TO SALTA ___ 2025.',
    speak: 'We traveled to Salta in 2025.',
    hint: 'UN AÑO ENTERO ES UN PERÍODO GRANDE.',
    steps: ['AÑOS → IN.', 'IN 2025.'],
    correct: 'IN',
    feedbackOk: '¡MUY BIEN, LUCÍA! LOS AÑOS SIEMPRE VAN CON IN (IN 2025).',
    wrong1: { label: 'ON', feedback: 'ON ES PARA DÍAS PUNTUALES.' },
    wrong2: { label: 'AT', feedback: 'AT ES PARA HORAS EXACTAS.' },
  },
  {
    sig: 't-friday',
    prompt: '¿QUÉ PREPOSICIÓN VA DELANTE DE FRIDAY (VIERNES)?',
    highlight: 'THE TEST WAS ___ FRIDAY.',
    speak: 'The test was on Friday.',
    hint: 'FRIDAY ES UN DÍA DE LA SEMANA.',
    steps: ['DÍAS → ON.', 'ON FRIDAY.'],
    correct: 'ON',
    feedbackOk: '¡BRILLANTE, LUCÍA! CON TODOS LOS DÍAS USAMOS ON (ON FRIDAY).',
    wrong1: { label: 'AT', feedback: 'AT SE RESERVA PARA HORAS COMO AT 3 PM.' },
    wrong2: { label: 'IN', feedback: 'IN SE USA PARA MESES O AÑOS.' },
  },
  {
    sig: 't-noon',
    prompt: '¿CUÁL VA CON AT NOON (AL MEDIODÍA)?',
    highlight: 'WE EAT LUNCH ___ NOON.',
    speak: 'We eat lunch at noon.',
    hint: 'EL MEDIODÍA ES UN MOMENTO EXACTO DEL RELOJ (12:00).',
    steps: ['MOMENTOS EXACTOS COMO NOON / NIGHT → AT.', 'AT NOON.'],
    correct: 'AT',
    feedbackOk: '¡EXCELENTE, LUCÍA! EL MEDIODÍA VA CON AT (AT NOON).',
    wrong1: { label: 'IN', feedback: 'IN VA CON PARTES DEL DÍA LARGAS (IN THE MORNING), NO CON NOON.' },
    wrong2: { label: 'ON', feedback: 'ON SE USA PARA DÍAS DE LA SEMANA O FECHAS.' },
  },
  {
    sig: 't-summer',
    prompt: 'COMPLETÁ PARA UNA ESTACIÓN DEL AÑO (VERANO):',
    highlight: 'IT IS SUNNY ___ SUMMER.',
    speak: 'It is sunny in summer.',
    hint: 'LAS ESTACIONES DURAN VARIOS MESES (PERÍODO GRANDE).',
    steps: ['ESTACIONES DEL AÑO → IN.', 'IN SUMMER.'],
    correct: 'IN',
    feedbackOk: '¡PERFECTO, LUCÍA! LAS ESTACIONES VAN CON IN (IN SUMMER).',
    wrong1: { label: 'ON', feedback: 'ON ES SOLO PARA DÍAS O FECHAS.' },
    wrong2: { label: 'AT', feedback: 'AT ES PARA HORAS.' },
  },
  {
    sig: 't-date',
    prompt: 'CUANDO DAMOS UNA FECHA CON DÍA Y MES, USAMOS:',
    highlight: 'OUR TRIP IS ___ JULY 14.',
    speak: 'Our trip is on July 14.',
    hint: 'JULY 14 ES UN DÍA PUNTUAL DEL CALENDARIO.',
    steps: ['SI HAY NÚMERO DE DÍA (JULY 14) → ON.', 'SI FUERA SOLO EL MES (JULY) → IN.'],
    correct: 'ON',
    feedbackOk: '¡MUY BIEN, LUCÍA! COMO ESTÁ EL DÍA (JULY 14), VA CON ON.',
    wrong1: { label: 'IN', feedback: 'SERÍA IN SI DIJERA SOLO JULY, PERO AL AGREGAR EL DÍA 14 VA ON.' },
    wrong2: { label: 'AT', feedback: 'AT SE USA PARA HORAS DEL RELOJ.' },
  },
];

function genEnglishExercise(
  topicId: 'ingles-weather' | 'ingles-was-were' | 'ingles-past-simple' | 'ingles-in-on-at',
  topicTitle: string,
  excludeSignature?: string
): Omit<FreePracticeExercise, 'id'> {
  const pool =
    topicId === 'ingles-weather'
      ? WEATHER_POOL
      : topicId === 'ingles-was-were'
        ? WAS_WERE_POOL
        : topicId === 'ingles-past-simple'
          ? PAST_SIMPLE_POOL
          : IN_ON_AT_POOL;

  const filtered = pool.filter((item) => item.sig !== excludeSignature);
  const chosen = pickRandom(filtered.length > 0 ? filtered : pool);

  return {
    signature: chosen.sig,
    topicId,
    topicTitle,
    subject: 'ingles',
    prompt: chosen.prompt,
    englishHighlight: chosen.highlight,
    speakEnglishText: chosen.speak,
    hint: chosen.hint,
    steps: chosen.steps,
    options: buildOptions(
      chosen.sig,
      {
        label: chosen.correct,
        feedback: chosen.feedbackOk,
      },
      [chosen.wrong1, chosen.wrong2]
    ),
  };
}

export function generateFreePracticeExercise(
  topicId: FreePracticeTopicId,
  excludeSignature?: string
): FreePracticeExercise {
  const meta =
    FREE_PRACTICE_TOPICS.find((t) => t.id === topicId) || FREE_PRACTICE_TOPICS[0];

  if (
    topicId === 'ingles-weather' ||
    topicId === 'ingles-was-were' ||
    topicId === 'ingles-past-simple' ||
    topicId === 'ingles-in-on-at'
  ) {
    const base = genEnglishExercise(topicId, meta.title, excludeSignature);
    return {
      ...base,
      id: `${topicId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
  }

  for (let attempt = 0; attempt < 8; attempt++) {
    const base =
      topicId === 'fracciones-suma-resta'
        ? genFraccionesSumaResta()
        : topicId === 'fracciones-mult-div'
          ? genFraccionesMultDiv()
          : topicId === 'potencias-raices'
            ? genPotenciasRaices()
            : topicId === 'monomios-semejantes'
              ? genMonomiosSemejantes()
              : genMonomiosMultDiv();

    if (base.signature !== excludeSignature || attempt === 7) {
      return {
        ...base,
        id: `${topicId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
    }
  }

  const fallback = genFraccionesSumaResta();
  return {
    ...fallback,
    id: `${topicId}-${Date.now()}`,
  };
}
