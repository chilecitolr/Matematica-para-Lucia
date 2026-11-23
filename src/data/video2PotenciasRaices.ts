import type { Chapter } from '../types/lesson';

export const VIDEO_2_CHAPTERS: Chapter[] = [
  {
    id: 'cap-3',
    number: 3,
    videoGroupId: 'video-2',
    title: 'Potencias',
    activityRef: 'Actividad 3 del TP',
    shortDesc: 'Base, exponente, exponente 0 y signos entre paréntesis.',
    scenes: [
      {
        id: 'c3-s1',
        phase: 'concepto',
        headline: '¿Qué significa una potencia? (3² = 3 × 3)',
        keyMessage: 'La base (azul) es el número que se repite. El exponente (naranja) dice cuántas veces se multiplica.',
        narration:
          'Vamos despacio con las potencias. En tres al cuadrado, el tres es la base y el dos chiquito de arriba es el exponente. El exponente NO se multiplica por la base. El exponente nos dice cuántas veces multiplicamos el tres por sí mismo: tres por tres es nueve. Nunca tres por dos.',
        durationSeconds: 15,
        supportPhrase: 'No confundir multiplicar por el exponente',
        diagram: {
          type: 'power-visual',
          base: '3',
          exp: 2,
          expanded: '3 × 3',
          result: '9',
          warningCompare: 'Cuidado: 3² NO es 3 × 2 = 6',
        },
      },
      {
        id: 'c3-s2',
        phase: 'paso',
        headline: 'Exponente 2, exponente 3 y exponente 0 (Actividad 3 a, b, c)',
        keyMessage: 'En fracciones se eleva arriba y abajo. Todo número distinto de cero elevado a la 0 da 1.',
        narration:
          'Miremos los tres primeros ejercicios de la Actividad 3. En el a, dos tercios al cuadrado es dos al cuadrado cuatro, y tres al cuadrado nueve: cuatro novenos. En el b, tres quintos al cubo es multiplicar tres veces: veintisiete sobre ciento veinticinco. Y en el c, cuatro séptimos a la cero siempre da uno.',
        durationSeconds: 16,
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 3a, 3b y 3c',
          lines: [
            { label: '3a)', math: '(2/3)² = (2×2) / (3×3) = 4/9', note: 'Exponente 2: multiplicamos 2 veces' },
            { label: '3b)', math: '(3/5)³ = (3×3×3) / (5×5×5) = 27/125', note: 'Exponente 3: multiplicamos 3 veces' },
            { label: '3c)', math: '(4/7)⁰ = 1', focus: true, note: 'Regla: exponente 0 siempre da 1' },
          ],
        },
      },
      {
        id: 'c3-s3',
        phase: 'regla',
        headline: 'Potencias con negativos entre paréntesis (Actividad 3 d, e, f)',
        keyMessage: 'Exponente par (como 2) da resultado POSITIVO (+). Exponente impar (como 3) conserva el NEGATIVO (−).',
        narration:
          'Atención al signo negativo entre paréntesis. En el d tenemos menos dos tercios al cuadrado: menos por menos da más, así que queda más cuatro novenos. En el e, menos un medio al cubo: menos por menos más, y más por menos menos, da menos un octavo. En el f multiplicamos los exponentes dos por tres igual a seis.',
        durationSeconds: 17,
        supportPhrase: 'Par da positivo · Impar mantiene el signo',
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 3d, 3e y 3f',
          lines: [
            { label: '3d)', math: '(-2/3)² = (-2/3) × (-2/3) = +4/9', note: 'Exponente par → positivo' },
            { label: '3e)', math: '(-1/2)³ = (-1/2) × (-1/2) × (-1/2) = -1/8', focus: true, note: 'Exponente impar → negativo' },
            { label: '3f)', math: '[(-3/5)²]³ = (-3/5)⁶ = +729/15625', note: 'Potencia de potencia: 2 × 3 = 6' },
          ],
        },
      },
      {
        id: 'c3-s4',
        phase: 'practica',
        headline: 'AHORA TE TOCA A VOS',
        keyMessage: 'Pensá cuántas veces multiplicamos la base y qué pasa con el signo.',
        narration:
          'Ahora probá vos. ¿Cuánto da menos un medio elevado al cubo? Recordá multiplicar un medio tres veces y mirar el signo.',
        durationSeconds: 15,
        supportPhrase: 'Si no lo entendiste, volvemos a mirar',
        diagram: {
          type: 'practice-challenge',
          promptMath: '(-1/2)³ = ?',
          question: 'Elegí la respuesta correcta.',
          hint: 'Multiplicá 2 × 2 × 2 para el número de abajo. Y como el exponente es 3 (impar), el signo queda negativo.',
          options: [
            {
              id: 'a',
              label: '-1/8',
              isCorrect: true,
              feedback: '¡Excelente! 2 × 2 × 2 = 8, y al ser exponente 3 (impar), queda negativo: -1/8.',
            },
            {
              id: 'b',
              label: '-3/6',
              isCorrect: false,
              feedback: 'Cuidado: multiplicaste por 3 en lugar de elevar. Acordate que es 2 × 2 × 2 = 8.',
            },
            {
              id: 'c',
              label: '+1/8',
              isCorrect: false,
              feedback: 'El número 1/8 está perfecto, pero revisá el signo: (−) × (−) × (−) da (−).',
            },
          ],
          solutionSteps: [
            '1. Multiplicamos tres veces: (-1/2) × (-1/2) × (-1/2).',
            '2. Arriba: 1 × 1 × 1 = 1. Abajo: 2 × 2 × 2 = 8.',
            '3. Signo: 3 signos menos dan negativo → -1/8.',
          ],
        },
      },
    ],
  },
  {
    id: 'cap-4',
    number: 4,
    videoGroupId: 'video-2',
    title: 'Raíces',
    activityRef: 'Actividad 4 del TP',
    shortDesc: 'Raíz cuadrada con cuadrados visuales y raíz cúbica con cubos.',
    scenes: [
      {
        id: 'c4-s1',
        phase: 'concepto',
        headline: 'Raíz cuadrada: √25 = 5',
        keyMessage: 'La raíz cuadrada busca qué número multiplicado por sí mismo da ese resultado.',
        narration:
          'La raíz es el camino inverso de la potencia. Cuando vemos raíz cuadrada de veinticinco, nos preguntamos: ¿qué número multiplicado por sí mismo da veinticinco? Mirá el cuadrado de cinco por cinco cuadritos: tiene veinticinco cuadritos en total. Así que el lado mide cinco. Raíz de veinticinco es cinco.',
        durationSeconds: 15,
        supportPhrase: 'Vamos despacio · 5 × 5 = 25',
        diagram: {
          type: 'root-visual',
          kind: 'square',
          radicandNum: 25,
          rootNum: 5,
        },
      },
      {
        id: 'c4-s2',
        phase: 'concepto',
        headline: 'Raíz cúbica: ∛27 = 3',
        keyMessage: 'Busca qué número multiplicado 3 veces por sí mismo da el valor adentro de la raíz.',
        narration:
          'Ahora miremos la raíz cúbica de veintisiete, que tiene un tres chiquito adelante. Nos preguntamos: ¿qué número multiplicado tres veces por sí mismo da veintisiete? Mirá este cubo de tres por tres por tres bloquecitos. Tres por tres nueve, por tres veintisiete. Entonces la raíz cúbica de veintisiete es tres.',
        durationSeconds: 15,
        diagram: {
          type: 'root-visual',
          kind: 'cube',
          radicandNum: 27,
          rootNum: 3,
        },
      },
      {
        id: 'c4-s3',
        phase: 'paso',
        headline: 'Actividad 4 (a, b, c, d, e, f) con fracciones',
        keyMessage: 'Calculamos la raíz del número de arriba y la raíz del número de abajo por separado.',
        narration:
          'Con fracciones es muy ordenado: sacamos la raíz de arriba y la raíz de abajo por separado. En el a, raíz de veinticinco es cinco, raíz de cuarenta y nueve es siete: cinco séptimos. En el d, raíz cúbica de menos sesenta y cuatro sobre ciento veinticinco da menos cuatro quintos. Y en el f sumamos los resultados al final.',
        durationSeconds: 17,
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 4 · Radicación del TP',
          lines: [
            { label: '4a)', math: '√(25/49) = 5/7', note: '5×5=25 y 7×7=49' },
            { label: '4b)', math: '√(81/100) = 9/10' },
            { label: '4c)', math: '∛(8/27) = 2/3', note: '2×2×2=8 y 3×3×3=27' },
            { label: '4d)', math: '∛(-64/125) = -4/5', note: 'Raíz cúbica de negativo sigue negativa' },
            { label: '4e)', math: '√(144/169) = 12/13' },
            { label: '4f)', math: '√(49/64) + ∛(-8/27) = 7/8 + (-2/3) = 21/24 - 16/24 = 5/24', focus: true },
          ],
        },
      },
      {
        id: 'c4-s3b',
        phase: 'paso',
        headline: 'Paso a paso · Actividad 4e: √(144/169)',
        keyMessage: 'Calculamos la raíz cuadrada de 144 arriba y la raíz cuadrada de 169 abajo por separado.',
        narration:
          'Vamos despacio con el ejercicio e de la Actividad 4: raíz cuadrada de ciento cuarenta y cuatro sobre ciento sesenta y nueve. Aunque los números sean un poco más grandes, la regla es la misma: buscamos la raíz del número de arriba y la del número de abajo por separado. Arriba tenemos ciento cuarenta y cuatro. ¿Qué número multiplicado por sí mismo da ciento cuarenta y cuatro? Probamos: diez por diez es cien, once por once ciento veintiuno, doce por doce ciento cuarenta y cuatro. Así que la raíz de arriba es doce. Abajo tenemos ciento sesenta y nueve. Trece por trece es ciento sesenta y nueve. Así que la raíz de abajo es trece. El resultado es doce treceavos. Comprobamos multiplicando doce treceavos por doce treceavos y nos da exactamente ciento cuarenta y cuatro sobre ciento sesenta y nueve.',
        durationSeconds: 18,
        supportPhrase: 'Un paso a la vez · Probamos multiplicando',
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 4e · Paso a paso',
          lines: [
            { label: 'Ejercicio', math: '√(144/169)', note: 'Raíz arriba y raíz abajo' },
            { label: 'Arriba', math: '√144 = 12', note: 'Porque 12 × 12 = 144' },
            { label: 'Abajo', math: '√169 = 13', note: 'Porque 13 × 13 = 169' },
            { label: 'Resultado', math: '12/13', focus: true, note: 'Comprobación: 12/13 × 12/13 = 144/169' },
          ],
        },
      },
      {
        id: 'c4-s3c',
        phase: 'resultado',
        headline: 'Paso a paso · Actividad 4f: √(49/64) + ∛(−8/27)',
        keyMessage: 'Resolvemos cada raíz por separado, respetamos el signo negativo de la raíz cúbica y sumamos con denominador 24.',
        narration:
          'Ahora miremos el ejercicio f de la Actividad 4, que combina dos raíces: raíz cuadrada de cuarenta y nueve sobre sesenta y cuatro, más raíz cúbica de menos ocho veintisieteavos. Primero calculamos la primera raíz: raíz de cuarenta y nueve es siete, y raíz de sesenta y cuatro es ocho, así que da siete octavos. Segundo, vamos con la raíz cúbica de menos ocho sobre veintisiete. Como el índice es tres y adentro es negativo, el resultado sigue siendo negativo. Dos por dos por dos da ocho, y tres por tres por tres da veintisiete. Entonces nos queda menos dos tercios. Ahora juntamos los dos resultados: siete octavos más menos dos tercios, que es lo mismo que siete octavos menos dos tercios. Buscamos denominador común entre ocho y tres: ocho por tres veinticuatro. Siete octavos pasa a veintiún veinticuatroavos, y dos tercios pasa a dieciséis veinticuatroavos. Restamos veintiuno menos dieciséis y nos da cinco veinticuatroavos.',
        durationSeconds: 21,
        supportPhrase: 'Cada raíz primero · Al final denominador común 24',
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 4f · Paso a paso',
          lines: [
            { label: 'Raíz 1', math: '√(49/64) = 7/8', note: '7×7=49 y 8×8=64' },
            { label: 'Raíz 2', math: '∛(-8/27) = -2/3', note: 'Raíz cúbica negativa sigue −' },
            { label: 'Juntamos', math: '7/8 + (-2/3) = 7/8 - 2/3', note: 'Más por menos queda menos' },
            { label: 'Común 24', math: '21/24 - 16/24', note: '7/8 ×3 y 2/3 ×8' },
            { label: 'Resultado', math: '5/24', focus: true, note: '21 − 16 = 5 arriba' },
          ],
        },
      },
      {
        id: 'c4-s4',
        phase: 'practica',
        headline: 'AHORA TE TOCA A VOS',
        keyMessage: 'Buscá qué número al cuadrado da 81 arriba y 100 abajo.',
        narration:
          'Ahora probá vos con el ejercicio b de la Actividad 4. ¿Cuánto es la raíz cuadrada de ochenta y uno sobre cien?',
        durationSeconds: 15,
        supportPhrase: 'Un paso a la vez',
        diagram: {
          type: 'practice-challenge',
          promptMath: '√(81/100) = ?',
          question: 'Pensá: ¿qué número por sí mismo da 81? ¿Y cuál da 100?',
          hint: '9 × 9 = 81, y 10 × 10 = 100.',
          options: [
            {
              id: 'a',
              label: '9/10',
              isCorrect: true,
              feedback: '¡Perfecto! 9 × 9 = 81 y 10 × 10 = 100. La raíz cuadrada es 9/10.',
            },
            {
              id: 'b',
              label: '8/10',
              isCorrect: false,
              feedback: 'Casi, abajo el 10 está bien, pero 8 × 8 es 64. Probá con 9 × 9.',
            },
            {
              id: 'c',
              label: '40/50',
              isCorrect: false,
              feedback: 'Acordate que no dividimos por 2, sino que buscamos qué número multiplicado por sí mismo da 81.',
            },
          ],
          solutionSteps: [
            '1. Raíz de arriba: √81 = 9 porque 9 × 9 = 81.',
            '2. Raíz de abajo: √100 = 10 porque 10 × 10 = 100.',
            '3. Resultado: 9/10.',
          ],
        },
      },
    ],
  },
];
