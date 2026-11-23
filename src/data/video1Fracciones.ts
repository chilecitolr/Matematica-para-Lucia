import type { Chapter } from '../types/lesson';

export const VIDEO_1_CHAPTERS: Chapter[] = [
  {
    id: 'cap-1',
    number: 1,
    videoGroupId: 'video-1',
    title: 'Suma y resta de fracciones',
    activityRef: 'Actividad 1 del TP',
    shortDesc: 'Partes iguales, denominador común y simplificación.',
    scenes: [
      {
        id: 'c1-s1',
        phase: 'concepto',
        headline: '¿Qué es una fracción?',
        keyMessage: 'El número de abajo indica en cuántas partes iguales se divide. El de arriba, cuántas tomamos.',
        narration:
          'Hola. Vamos despacio, un paso a la vez. Una fracción representa partes iguales de un entero, como una pizza o una barra de chocolate. El número de abajo se llama denominador y dice en cuántas porciones iguales cortamos la pizza. El número de arriba se llama numerador y dice cuántas porciones agarramos.',
        durationSeconds: 15,
        supportPhrase: 'Vamos despacio · Un paso a la vez',
        diagram: {
          type: 'fraction-intro',
          slices: 3,
          total: 4,
          style: 'pizza',
          caption: '3/4 = 3 porciones pintadas de 4 partes iguales',
        },
      },
      {
        id: 'c1-s2',
        phase: 'regla',
        headline: 'Caso 1: Denominadores iguales (2/7 + 3/7)',
        keyMessage: 'Si abajo es el mismo número, sumamos arriba y abajo queda igual.',
        narration:
          'Mirá este primer caso: dos séptimos más tres séptimos. Como los dos chocolates están partidos en siete partes iguales, abajo dejamos el siete. Solo sumamos los de arriba: dos más tres es cinco. Nos queda cinco séptimos.',
        durationSeconds: 13,
        supportPhrase: 'Si no lo entendiste, volvemos a mirar',
        diagram: {
          type: 'fraction-add-same',
          leftNum: 2,
          rightNum: 3,
          den: 7,
          op: '+',
          showSum: true,
        },
      },
      {
        id: 'c1-s3',
        phase: 'que-pide',
        headline: 'Caso 2 · Actividad 1a: 3/4 + 2/5',
        keyMessage: '1. ¿Qué me pide? Sumar 3/4 + 2/5 y simplificar si se puede. 2. Datos: denominadores distintos (4 y 5).',
        narration:
          'Ahora vamos con el ejercicio a de la Actividad 1 del trabajo práctico: tres cuartos más dos quintos. Primero nos preguntamos: ¿qué me pide? Sumar dos fracciones. ¿Qué datos tengo? Abajo tengo un cuatro y un cinco. Como son distintos, no los puedo sumar directo todavía.',
        durationSeconds: 14,
        diagram: {
          type: 'fraction-common-denom',
          left: [3, 4],
          right: [2, 5],
          commonDen: 20,
          op: '+',
          stage: 'original',
        },
      },
      {
        id: 'c1-s4',
        phase: 'paso',
        headline: 'Buscamos el denominador común: 20',
        keyMessage: '3. Regla: multiplicamos para que ambos denominadores sean 20. 4 × 5 = 20.',
        narration:
          '¿Cuál es la regla que necesito? Buscar un denominador común. Multiplicamos cuatro por cinco y nos da veinte. En la primera fracción multiplicamos arriba y abajo por cinco: tres por cinco quince, cuatro por cinco veinte. En la segunda multiplicamos por cuatro: dos por cuatro ocho, cinco por cuatro veinte.',
        durationSeconds: 16,
        supportPhrase: 'Un paso a la vez',
        diagram: {
          type: 'fraction-common-denom',
          left: [3, 4],
          right: [2, 5],
          commonDen: 20,
          op: '+',
          stage: 'converted',
        },
      },
      {
        id: 'c1-s5',
        phase: 'resultado',
        headline: 'Sumamos y comprobamos: 23/20',
        keyMessage: '15/20 + 8/20 = 23/20. Como 23 es primo, no se puede simplificar más.',
        narration:
          'Ahora que los dos denominadores son veinte, sumamos los de arriba: quince más ocho es veintitrés. El resultado es veintitrés veinteavos. Comprobamos si tiene sentido: tres cuartos es casi un entero y dos quintos es casi medio, así que un poquito más de uno tiene todo el sentido.',
        durationSeconds: 14,
        diagram: {
          type: 'fraction-common-denom',
          left: [3, 4],
          right: [2, 5],
          commonDen: 20,
          op: '+',
          stage: 'solved',
        },
      },
      {
        id: 'c1-s6',
        phase: 'paso',
        headline: 'Actividad 1 (b, c, d, e, f) paso a paso',
        keyMessage: 'Practicamos buscar el común denominador y simplificar en los ejercicios del TP.',
        narration:
          'Miremos otros ejercicios de la Actividad 1. En el b, siete sextos menos un tercio: pasamos un tercio a dos sextos y nos queda cinco sextos. En el d, nueve décimos menos dos quintos más un medio: todo pasa a décimos, nueve menos cuatro más cinco da diez décimos, que simplificado da uno entero. Y en el f, primero resolvemos el paréntesis.',
        durationSeconds: 17,
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 1 · Trabajo Práctico',
          lines: [
            { label: 'b)', math: '7/6 - 1/3 = 7/6 - 2/6 = 5/6' },
            { label: 'c)', math: '5/8 + 1/4 - 3/16 = 10/16 + 4/16 - 3/16 = 11/16' },
            { label: 'd)', math: '9/10 - 2/5 + 1/2 = 9/10 - 4/10 + 5/10 = 10/10 = 1', focus: true, note: 'Simplificamos dividiendo por 10' },
            { label: 'e)', math: '11/12 - 3/8 = 22/24 - 9/24 = 13/24' },
            { label: 'f)', math: '7/9 - (5/6 - 1/4) = 7/9 - 7/12 = 28/36 - 21/36 = 7/36' },
          ],
        },
      },
      {
        id: 'c1-s7',
        phase: 'practica',
        headline: 'AHORA TE TOCA A VOS',
        keyMessage: 'Tomate tu tiempo para pensar antes de elegir.',
        narration:
          'Ahora probá vos. ¿Cuánto da dos quintos más un quinto? Acordate que abajo tienen el mismo número. Tomate unos segundos tranquilos.',
        durationSeconds: 15,
        supportPhrase: 'Está bien equivocarse, estamos aprendiendo',
        diagram: {
          type: 'practice-challenge',
          promptMath: '2/5 + 1/5 = ?',
          question: 'Observá los denominadores. ¿Cuál es el resultado correcto?',
          hint: 'Como abajo los dos tienen un 5, el 5 queda igual y solo sumás los números de arriba.',
          options: [
            {
              id: 'a',
              label: '3/5',
              isCorrect: true,
              feedback: '¡Muy bien! Dejaste el 5 abajo y sumaste 2 + 1 = 3 arriba.',
            },
            {
              id: 'b',
              label: '3/10',
              isCorrect: false,
              feedback: 'Casi, sumaste bien arriba, pero acordate: el número de abajo NO se suma cuando es igual. Probemos de nuevo.',
            },
            {
              id: 'c',
              label: '2/5',
              isCorrect: false,
              feedback: 'Está bien equivocarse, estamos aprendiendo. Sumá 2 + 1 en la parte de arriba.',
            },
          ],
          solutionSteps: [
            '1. Datos: 2/5 y 1/5 tienen el mismo denominador (5).',
            '2. Regla: dejamos el 5 abajo y sumamos 2 + 1 arriba.',
            '3. Resultado: 3/5.',
          ],
        },
      },
    ],
  },
  {
    id: 'cap-2',
    number: 2,
    videoGroupId: 'video-1',
    title: 'Multiplicación y división de fracciones',
    activityRef: 'Actividad 2 del TP',
    shortDesc: 'Multiplicar derecho, dar vuelta para dividir y cuidar los signos.',
    scenes: [
      {
        id: 'c2-s1',
        phase: 'regla',
        headline: 'Multiplicar fracciones: derecho arriba y derecho abajo',
        keyMessage: 'Ejemplo: 2/3 × 4/5 = (2 × 4) / (3 × 5) = 8/15.',
        narration:
          'Para multiplicar fracciones no hace falta buscar denominador común. Es más directo: multiplicamos el de arriba por el de arriba, y el de abajo por el de abajo. Por ejemplo, dos tercios por cuatro quintos: dos por cuatro es ocho, tres por cinco es quince. Queda ocho quinceavos.',
        durationSeconds: 14,
        supportPhrase: 'Un paso a la vez',
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Ejemplo · Multiplicación',
          lines: [
            { label: 'Ejercicio', math: '2/3 × 4/5' },
            { label: 'Arriba', math: '2 × 4 = 8', note: 'Numerador por numerador' },
            { label: 'Abajo', math: '3 × 5 = 15', note: 'Denominador por denominador' },
            { label: 'Resultado', math: '8/15', focus: true },
          ],
        },
      },
      {
        id: 'c2-s2',
        phase: 'regla',
        headline: 'Regla de los signos y Actividad 2 (a y b)',
        keyMessage: 'Signos distintos (− × +) dan resultado negativo (−). Luego simplificamos.',
        narration:
          'Miremos los signos en la Actividad 2. En el ejercicio a tenemos menos tres séptimos por más catorce novenos. Menos por más da menos. Multiplicamos tres por catorce que da cuarenta y dos, y siete por nueve que da sesenta y tres. Al simplificar por veintiuno nos queda menos dos tercios.',
        durationSeconds: 16,
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 2a y 2b · Signos y simplificación',
          lines: [
            { label: 'Signos', math: '(−) × (+) = (−)   |   (−) × (−) = (+)', focus: true },
            { label: '2a)', math: '-3/7 × +14/9 = -42/63 = -2/3', note: 'Simplificamos dividiendo por 21' },
            { label: '2b)', math: '+5/6 × -3/10 = -15/60 = -1/4', note: 'Simplificamos dividiendo por 15' },
          ],
        },
      },
      {
        id: 'c2-s3',
        phase: 'regla',
        headline: 'División de fracciones: dar vuelta la segunda',
        keyMessage: '“Para dividir fracciones, la segunda fracción se da vuelta y después multiplicamos.”',
        narration:
          'Ahora atención a esta frase clave: para dividir fracciones, la segunda fracción se da vuelta y después multiplicamos. Miremos la Actividad 2c: menos cuatro novenos dividido más dos tercios. La primera queda igual. La segunda, dos tercios, se da vuelta y pasa a ser tres medios. Y cambiamos el dividido por un por.',
        durationSeconds: 16,
        supportPhrase: 'La segunda fracción se da vuelta',
        diagram: {
          type: 'fraction-flip',
          first: '-4/9',
          secondNum: '2',
          secondDen: '3',
          flipped: true,
          signNote: '(−) ÷ (+) = (−)',
          result: '-12/18 = -2/3',
        },
      },
      {
        id: 'c2-s4',
        phase: 'paso',
        headline: 'Actividad 2 (d, e y f) un paso por vez',
        keyMessage: 'En 2d: (−) ÷ (−) = (+). En 2e y 2f resolvemos de izquierda a derecha o paréntesis primero.',
        narration:
          'Veamos el d: menos siete octavos dividido menos catorce quintos. Menos dividido menos da más. Damos vuelta catorce quintos a cinco catorceavos, multiplicamos y simplificamos: da más cinco dieciseisavos. En el e y el f hacemos una operación por vez, sin apurarnos.',
        durationSeconds: 16,
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 2d, 2e y 2f',
          lines: [
            { label: '2d)', math: '-7/8 ÷ -14/5 = -7/8 × -5/14 = +35/112 = +5/16', focus: true },
            { label: '2e)', math: '(-5/12 × +6/25) ÷ -1/5 = -1/10 × -5/1 = +1/2' },
            { label: '2f)', math: '(-7/10 ÷ +14/15) × -4/5 = -3/4 × -4/5 = +3/5' },
          ],
        },
      },
      {
        id: 'c2-s5',
        phase: 'practica',
        headline: 'AHORA TE TOCA A VOS',
        keyMessage: '¿Qué fracción queda cuando damos vuelta 2/3 para dividir?',
        narration:
          'Ahora probá vos. Si tenemos menos cuatro novenos dividido dos tercios, ¿cómo escribimos la multiplicación después de dar vuelta la segunda fracción?',
        durationSeconds: 15,
        supportPhrase: 'Vamos despacio · Vos podés',
        diagram: {
          type: 'practice-challenge',
          promptMath: '-4/9 ÷ +2/3 = ?',
          question: 'Recordá la frase: la segunda fracción se da vuelta y después multiplicamos.',
          hint: 'La primera (-4/9) NO cambia. Solo se invierte +2/3.',
          options: [
            {
              id: 'a',
              label: '-4/9 × +3/2',
              isCorrect: true,
              feedback: '¡Exacto! Diste vuelta la segunda fracción (+2/3 pasó a +3/2) y cambiaste a multiplicación.',
            },
            {
              id: 'b',
              label: '-9/4 × +2/3',
              isCorrect: false,
              feedback: 'Cuidado, ahí diste vuelta la primera fracción. Acordate: siempre se da vuelta la SEGUNDA.',
            },
            {
              id: 'c',
              label: '-4/9 × +2/3',
              isCorrect: false,
              feedback: 'Faltó dar vuelta el +2/3. El 3 sube arriba y el 2 baja abajo.',
            },
          ],
          solutionSteps: [
            '1. Dejamos igual la primera: -4/9.',
            '2. Cambiamos ÷ por × y damos vuelta la segunda: +3/2.',
            '3. Multiplicamos: -12/18 = -2/3.',
          ],
        },
      },
    ],
  },
  {
    id: 'cap-5',
    number: 5,
    videoGroupId: 'video-1',
    title: 'Operaciones combinadas con fracciones',
    activityRef: 'Actividad 5 del TP',
    shortDesc: 'Guía visual de 5 pasos para no mezclar el orden.',
    scenes: [
      {
        id: 'c5-s1',
        phase: 'regla',
        headline: 'Guía visual para operaciones combinadas',
        keyMessage: 'Cuando hay varias operaciones, no se hacen todas juntas. Seguimos estos 5 pasos.',
        narration:
          'Cuando ves un ejercicio largo con paréntesis, sumas y multiplicaciones, es normal marearse al principio. Por eso no lo hacemos todo junto. Usamos esta guía visual: 1. Paré. 2. Miro los paréntesis. 3. Resuelvo multiplicaciones y divisiones. 4. Resuelvo sumas y restas. 5. Reviso.',
        durationSeconds: 16,
        supportPhrase: 'Un paso a la vez',
        diagram: {
          type: 'order-checklist',
          activeStep: 1,
          expression: '(-2/3 + 1/4) × (-6/11)',
          stepNote: 'Respiramos y miramos todo el ejercicio antes de escribir.',
        },
      },
      {
        id: 'c5-s2',
        phase: 'paso',
        headline: 'Actividad 5(a): Paso 2, miramos el paréntesis',
        keyMessage: 'Resolvemos primero (−2/3 + 1/4) buscando denominador común 12.',
        narration:
          'Miremos la Actividad 5a: entre paréntesis menos dos tercios más un cuarto, por menos seis onceavos. Primero hacemos solo el paréntesis. Denominador común entre tres y cuatro es doce. Menos dos tercios es menos ocho doceavos, y un cuarto es tres doceavos. Menos ocho más tres da menos cinco doceavos.',
        durationSeconds: 16,
        diagram: {
          type: 'order-checklist',
          activeStep: 2,
          expression: '(-8/12 + 3/12) × (-6/11) = (-5/12) × (-6/11)',
          stepNote: 'Solo resolvimos el paréntesis. El resto se copia igual.',
        },
      },
      {
        id: 'c5-s3',
        phase: 'resultado',
        headline: 'Actividad 5(a): Paso 3, multiplicamos y revisamos',
        keyMessage: '(−5/12) × (−6/11) = +30/132 = +5/22. Menos por menos da más.',
        narration:
          'Ahora multiplicamos menos cinco doceavos por menos seis onceavos. Menos por menos es más. Cinco por seis treinta, doce por once ciento treinta y dos. Simplificamos dividiendo por seis y llegamos a cinco veintidosavos. Revisamos los signos y está perfecto.',
        durationSeconds: 15,
        diagram: {
          type: 'order-checklist',
          activeStep: 5,
          expression: '(-5/12) × (-6/11) = +30/132 = 5/22',
          stepNote: 'Revisamos: (−) × (−) = (+) y simplificamos por 6.',
        },
      },
      {
        id: 'c5-s4',
        phase: 'paso',
        headline: 'Actividad 5 (b, c, d, e, f, g) resueltos paso a paso',
        keyMessage: 'Cada ejercicio del trabajo práctico sigue exactamente el mismo orden.',
        narration:
          'Acá tenés los resultados ordenados de los demás ejercicios de la Actividad 5. Fijate que en el c, menos menos un décimo se transforma en más un décimo. Y en el g, primero resolvemos los corchetes y recién al final restamos un octavo.',
        durationSeconds: 17,
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 5 · Todos los ejercicios del TP',
          lines: [
            { label: '(b)', math: '(-5/6 × 1/4) ÷ (-7/12) = -5/24 × -12/7 = 5/14' },
            { label: '(c)', math: '[3/5 - (-1/10)] × (-4/7) = (7/10) × (-4/7) = -2/5' },
            { label: '(d)', math: '(-7/8 × 1/6) ÷ (-5/12) = -7/48 × -12/5 = 7/20' },
            { label: '(e)', math: '[(-2/3 × 9/10) - (-1/5)] = -3/5 + 1/5 = -2/5' },
            { label: '(f)', math: '(-3/4 + 1/8) ÷ [(-7/6) × (-1/3)] = (-5/8) ÷ (7/18) = -45/28' },
            { label: '(g)', math: '[(-5/6 × 1/3) × (-3/4)] - 1/8 = 5/24 - 3/24 = 1/12', focus: true },
          ],
        },
      },
      {
        id: 'c5-s5',
        phase: 'practica',
        headline: 'AHORA TE TOCA A VOS',
        keyMessage: '¿Qué resolvemos primero en [3/5 − (−1/10)] × (−4/7)?',
        narration:
          'Probá vos con este ejercicio de la Actividad 5. Si ves corchetes y una multiplicación afuera, ¿qué parte resolvés primero?',
        durationSeconds: 15,
        supportPhrase: '1. PARÉ · 2. MIRO paréntesis',
        diagram: {
          type: 'practice-challenge',
          promptMath: '[3/5 - (-1/10)] × (-4/7)',
          question: 'Según nuestra guía visual, ¿cuál es el primer paso?',
          hint: 'Mirá la regla número 2: primero miramos lo que está adentro de los paréntesis o corchetes.',
          options: [
            {
              id: 'a',
              label: 'Resolver primero el corchete [3/5 − (−1/10)]',
              isCorrect: true,
              feedback: '¡Genial! Siempre empezamos por lo que está adentro de los paréntesis o corchetes.',
            },
            {
              id: 'b',
              label: 'Multiplicar (−1/10) × (−4/7)',
              isCorrect: false,
              feedback: 'Cuidado: el −4/7 está afuera del corchete. Primero resolvemos lo de adentro.',
            },
          ],
          solutionSteps: [
            '1. Adentro del corchete: 3/5 + 1/10 = 6/10 + 1/10 = 7/10.',
            '2. Multiplicamos por afuera: 7/10 × (-4/7) = -28/70.',
            '3. Simplificamos por 14: -2/5.',
          ],
        },
      },
    ],
  },
];
