import type { Chapter } from '../types/lesson';

export const VIDEO_3_CHAPTERS: Chapter[] = [
  {
    id: 'cap-6',
    number: 6,
    videoGroupId: 'video-3',
    title: '¿Qué es un monomio?',
    activityRef: 'Actividad 6 del TP',
    shortDesc: 'Coeficiente (azul), parte literal (verde) y exponente (naranja).',
    scenes: [
      {
        id: 'c6-s1',
        phase: 'concepto',
        headline: 'Las 3 partes de un monomio: 5x³',
        keyMessage: '5 es el coeficiente (azul), x es la parte literal (verde) y 3 es el exponente (naranja). Grado = 3.',
        narration:
          'Empezamos con la segunda parte del trabajo práctico: los monomios. No te asustes con la palabra: un monomio es un solo bloque que combina un número y letras. Mirá cinco x al cubo. El cinco azul es el coeficiente. La x verde es la parte literal. Y el tres naranja es el exponente, que nos dice que su grado es tres.',
        durationSeconds: 16,
        supportPhrase: 'Vamos despacio · Cada color es una parte',
        diagram: {
          type: 'monomio-parts',
          coeff: '5',
          vars: [{ letter: 'x', exp: '3' }],
          degree: 3,
          note: 'Coeficiente = 5  ·  Parte literal = x³  ·  Grado = 3',
        },
      },
      {
        id: 'c6-s2',
        phase: 'concepto',
        headline: 'Cuando hay varias letras o solo un número: −4a²b y 8',
        keyMessage: 'Si una letra no tiene exponente escrito, vale 1. Un número sin letras (como 8) tiene grado 0.',
        narration:
          '¿Qué pasa si hay más letras, como en menos cuatro a al cuadrado b? El signo menos va con el coeficiente: menos cuatro. Las letras son a al cuadrado b. Y para el grado sumamos los exponentes: dos de la a más uno invisible de la b da grado tres. ¿Y el ocho solo? No tiene parte literal, así que su grado es cero.',
        durationSeconds: 17,
        diagram: {
          type: 'monomio-parts',
          sign: '−',
          coeff: '4',
          vars: [
            { letter: 'a', exp: '2' },
            { letter: 'b', exp: '1' },
          ],
          degree: 3,
          note: 'La letra b sin número arriba tiene exponente 1 invisible (2 + 1 = 3)',
        },
      },
      {
        id: 'c6-s3',
        phase: 'paso',
        headline: 'Completamos la tabla de la Actividad 6',
        keyMessage: 'Revisamos cada fila del cuadro: 5x³, −4a²b, 7xy², −3mn², 8 y −6p²q³r.',
        narration:
          'Miremos cómo queda completa la tabla de la Actividad 6. En siete x y al cuadrado, el coeficiente es siete y el grado es uno más dos igual a tres. En menos tres m n al cuadrado, grado tres. En el ocho, parte literal no tiene y grado es cero. Y en menos seis p cuadrado q cubo r, sumamos dos más tres más uno y da grado seis.',
        durationSeconds: 17,
        diagram: {
          type: 'monomio-table',
          revealedRows: 6,
          activeRow: 5,
        },
      },
      {
        id: 'c6-s4',
        phase: 'practica',
        headline: 'AHORA TE TOCA A VOS',
        keyMessage: 'Sumá los exponentes de las letras para encontrar el grado absoluto.',
        narration:
          'Ahora probá vos. En el monomio menos seis p al cuadrado q al cubo r, ¿cuál es el grado absoluto? Acordate de contar el uno invisible de la r.',
        durationSeconds: 15,
        supportPhrase: 'Un paso a la vez',
        diagram: {
          type: 'practice-challenge',
          promptMath: '-6p²q³r',
          question: '¿Cuál es el grado absoluto de este monomio?',
          hint: 'Sumá los exponentes: 2 (de p) + 3 (de q) + 1 (de r).',
          options: [
            {
              id: 'a',
              label: 'Grado 6',
              isCorrect: true,
              feedback: '¡Muy bien! 2 + 3 + 1 = 6. No te olvidaste del 1 invisible de la r.',
            },
            {
              id: 'b',
              label: 'Grado 5',
              isCorrect: false,
              feedback: 'Casi: sumaste 2 + 3 = 5, pero te faltó contar la r que tiene un 1 invisible arriba.',
            },
            {
              id: 'c',
              label: 'Grado -6',
              isCorrect: false,
              feedback: 'El −6 es el coeficiente (el número de adelante). El grado se saca sumando los exponentes naranjas.',
            },
          ],
          solutionSteps: [
            '1. Coeficiente: -6.',
            '2. Exponentes de las letras: p² (2), q³ (3), r¹ (1).',
            '3. Grado absoluto: 2 + 3 + 1 = 6.',
          ],
        },
      },
    ],
  },
  {
    id: 'cap-7',
    number: 7,
    videoGroupId: 'video-3',
    title: 'Monomios semejantes',
    activityRef: 'Actividad 7 del TP',
    shortDesc: 'Mismas letras con los mismos exponentes.',
    scenes: [
      {
        id: 'c7-s1',
        phase: 'concepto',
        headline: 'Semejantes: misma parte literal (3x² y 5x²)',
        keyMessage: 'Dos monomios son semejantes cuando tienen exactamente las mismas letras con los mismos exponentes.',
        narration:
          'Los monomios semejantes son como objetos iguales que se pueden juntar. Mirá tres x al cuadrado y cinco x al cuadrado. Aunque los números azules son distintos, la parte verde con su exponente naranja es idéntica: x al cuadrado. Por eso son semejantes y se pueden sumar para dar ocho x al cuadrado.',
        durationSeconds: 15,
        supportPhrase: 'Mismas letras, mismos exponentes',
        diagram: {
          type: 'apples-pears',
          leftLabel: '3x²',
          leftKind: 'same-a',
          rightLabel: '5x²',
          rightKind: 'same-a',
          sameFamily: true,
          resultLabel: '8x²',
        },
      },
      {
        id: 'c7-s2',
        phase: 'regla',
        headline: 'Cuando NO son semejantes: 3x² y 5x³',
        keyMessage: 'Aunque tengan la misma letra x, el exponente cambió (2 vs 3). No se pueden juntar.',
        narration:
          'Ahora compará tres x al cuadrado con cinco x al cubo. Los dos tienen la letra x, pero uno tiene exponente dos y el otro exponente tres. Son objetos distintos, como una mesa cuadrada y una caja cúbica. No son semejantes y no se pueden juntar en un solo término.',
        durationSeconds: 15,
        diagram: {
          type: 'apples-pears',
          leftLabel: '3x²',
          leftKind: 'same-a',
          rightLabel: '5x³',
          rightKind: 'different-b',
          sameFamily: false,
          resultLabel: 'Quedan separados: 3x² + 5x³',
        },
      },
      {
        id: 'c7-s3',
        phase: 'paso',
        headline: 'Clasificación de la Actividad 7 (a hasta f)',
        keyMessage: 'Revisamos cada punto del TP: semejantes vs mismo grado.',
        narration:
          'Resolvamos la Actividad 7. En el a, son semejantes tres x cuadrado, menos cinco x cuadrado y siete x cuadrado. En el e, ¿son semejantes tres x cuadrado y, y menos cinco x y cuadrado? No, porque cambian los exponentes de cada letra. Y en el f: semejantes tienen idéntica parte literal; los del mismo grado solo coinciden en la suma de exponentes.',
        durationSeconds: 18,
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 7 · Trabajo Práctico',
          lines: [
            { label: '7a)', math: 'Semejantes: 3x², -5x², 7x²   (4x³ es distinto)' },
            { label: '7b)', math: 'Grupo 1: {2a²b, 5a²b}  |  Grupo 2: {-7ab², -4ab²}  |  Solo: 3ab' },
            { label: '7c)', math: 'Grados: 6x⁴(4); -2a³b²(5); 9mn³(4); 5(0); -3p²q³(5)' },
            { label: '7d)', math: 'Ejemplos: 4x (gr.1) · 2x³ (gr.3) · 7 (cte) · -5a (neg) · 0 (nulo)' },
            { label: '7e)', math: '3x²y y -5xy² NO son semejantes (x²y ≠ xy²)', focus: true },
          ],
        },
      },
      {
        id: 'c7-s4',
        phase: 'practica',
        headline: 'AHORA TE TOCA A VOS',
        keyMessage: 'Mirá con lupa las letras y los exponentes de cada opción.',
        narration:
          'Probá vos con el punto e de la Actividad 7. ¿Son semejantes tres x cuadrado y, y menos cinco x y cuadrado?',
        durationSeconds: 15,
        supportPhrase: 'Si no lo entendiste, volvemos a mirar',
        diagram: {
          type: 'practice-challenge',
          promptMath: '3x²y   y   -5xy²',
          question: '¿Estos dos monomios son semejantes?',
          hint: 'Fijate quién tiene el exponente 2 en cada monomio.',
          options: [
            {
              id: 'a',
              label: 'No son semejantes porque cambian los exponentes de x e y',
              isCorrect: true,
              feedback: '¡Exacto! En el primero x tiene exponente 2, y en el segundo y tiene exponente 2.',
            },
            {
              id: 'b',
              label: 'Sí son semejantes porque ambos tienen x e y',
              isCorrect: false,
              feedback: 'Buena observación mirar las letras, pero también hay que mirar los exponentes de cada una. En uno es x² y en el otro y².',
            },
          ],
          solutionSteps: [
            '1. Parte literal del primero: x²y (x al cuadrado, y a la 1).',
            '2. Parte literal del segundo: xy² (x a la 1, y al cuadrado).',
            '3. No coinciden, por lo tanto NO son semejantes.',
          ],
        },
      },
    ],
  },
  {
    id: 'cap-8',
    number: 8,
    videoGroupId: 'video-3',
    title: 'Suma y resta de monomios',
    activityRef: 'Actividad 8 del TP',
    shortDesc: 'Juntar manzanas con manzanas manteniendo letras y exponentes.',
    scenes: [
      {
        id: 'c8-s1',
        phase: 'regla',
        headline: 'Manzanas con manzanas (5x² + 3x² = 8x²)',
        keyMessage: '“Podemos juntar manzanas con manzanas, pero no manzanas con peras.” Las letras y exponentes NO cambian.',
        narration:
          'Para sumar y restar monomios pensá siempre en esta frase: podemos juntar manzanas con manzanas, pero no manzanas con peras. Si tengo cinco x al cuadrado más tres x al cuadrado, sumo solo los números de adelante: cinco más tres es ocho. La parte verde x al cuadrado queda exactamente igual.',
        durationSeconds: 15,
        supportPhrase: 'Las letras y exponentes se mantienen',
        diagram: {
          type: 'apples-pears',
          leftLabel: '5x²',
          leftKind: 'same-a',
          rightLabel: '3x²',
          rightKind: 'same-a',
          sameFamily: true,
          resultLabel: '8x²',
        },
      },
      {
        id: 'c8-s2',
        phase: 'paso',
        headline: 'Actividad 8c paso a paso: 7xy + 4xy − 9xy',
        keyMessage: 'Paso 1: 7 + 4 = 11. Paso 2: 11 − 9 = 2. Resultado: 2xy.',
        narration:
          'Hagamos el ejercicio c de la Actividad 8: siete x y más cuatro x y menos nueve x y. Todos tienen la misma parte literal: x y. Vamos despacio con los números: primero siete más cuatro es once. Después once menos nueve es dos. Entonces el resultado es dos x y.',
        durationSeconds: 15,
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 8c · Un paso a la vez',
          lines: [
            { label: 'Ejercicio', math: '7xy + 4xy - 9xy' },
            { label: 'Paso 1', math: '7 + 4 = 11   →   11xy - 9xy' },
            { label: 'Paso 2', math: '11 - 9 = 2' },
            { label: 'Resultado', math: '2xy', focus: true, note: 'La parte literal xy se mantuvo igual' },
          ],
        },
      },
      {
        id: 'c8-s3',
        phase: 'paso',
        headline: 'Actividad 8 (a hasta g): agrupamos los semejantes',
        keyMessage: 'Cuando hay familias mezcladas, juntamos cada familia por separado.',
        narration:
          'Miremos los demás ejercicios de la Actividad 8. En el e tenemos cuatro x cuadrado más tres x menos dos x cuadrado más cinco x. Juntamos las x cuadrado entre sí: cuatro menos dos da dos x cuadrado. Y las x entre sí: tres más cinco da ocho x. Como no son semejantes, ahí termina.',
        durationSeconds: 17,
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 8 · Suma y resta del TP',
          lines: [
            { label: '8a)', math: '5x² + 3x² = 8x²' },
            { label: '8b)', math: '8a³ - 12a³ = -4a³', note: '8 - 12 = -4' },
            { label: '8d)', math: '6m²n - 2m²n + 5m²n = 9m²n' },
            { label: '8e)', math: '4x² + 3x - 2x² + 5x = 2x² + 8x', focus: true },
            { label: '8f)', math: '9a²b - 4ab² + 2a²b + 7ab² = 11a²b + 3ab²' },
            { label: '8g)', math: '6x² - 3x + 4x² + 8x - 5x² = 5x² + 5x' },
          ],
        },
      },
      {
        id: 'c8-s4',
        phase: 'practica',
        headline: 'AHORA TE TOCA A VOS',
        keyMessage: 'Juntá los que tienen la misma letra y exponente.',
        narration:
          'Ahora probá vos con el ejercicio b de la Actividad 8. ¿Cuánto da ocho a al cubo menos doce a al cubo?',
        durationSeconds: 15,
        supportPhrase: 'Está bien equivocarse, estamos aprendiendo',
        diagram: {
          type: 'practice-challenge',
          promptMath: '8a³ - 12a³ = ?',
          question: 'Restá los coeficientes y mantené igual la parte literal.',
          hint: 'Si tengo 8 y resto 12, el resultado es negativo (-4). La letra a³ no cambia.',
          options: [
            {
              id: 'a',
              label: '-4a³',
              isCorrect: true,
              feedback: '¡Excelente! 8 − 12 = −4, y mantuviste a³ igual.',
            },
            {
              id: 'b',
              label: '4a³',
              isCorrect: false,
              feedback: 'Ojo con el signo: 12 es más grande que 8, así que 8 − 12 queda negativo (−4).',
            },
            {
              id: 'c',
              label: '-4a⁶',
              isCorrect: false,
              feedback: 'En sumas y restas los exponentes NO se suman. Queda a³.',
            },
          ],
          solutionSteps: [
            '1. Verificamos: ambos tienen a³ (son semejantes).',
            '2. Restamos los coeficientes: 8 - 12 = -4.',
            '3. Resultado: -4a³.',
          ],
        },
      },
    ],
  },
];
