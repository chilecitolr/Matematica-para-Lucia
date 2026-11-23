import type { Chapter } from '../types/lesson';

export const VIDEO_4_CHAPTERS: Chapter[] = [
  {
    id: 'cap-9',
    number: 9,
    videoGroupId: 'video-4',
    title: 'Multiplicación de monomios',
    activityRef: 'Actividad 9 del TP',
    shortDesc: 'Multiplicar coeficientes y sumar exponentes de letras iguales.',
    scenes: [
      {
        id: 'c9-s1',
        phase: 'regla',
        headline: 'Regla para multiplicar: 3x² × 4x³ = 12x⁵',
        keyMessage: '1. Multiplicar números (3×4=12). 2. Multiplicar letras iguales. 3. Sumar exponentes (2+3=5).',
        narration:
          'En la multiplicación de monomios SÍ cambian los exponentes, porque estamos multiplicando letras. Mirá tres x al cuadrado por cuatro x al cubo. Paso uno: multiplicamos los números azules, tres por cuatro es doce. Paso dos: miramos las x verdes. Paso tres: sumamos sus exponentes naranjas, dos más tres es cinco. Resultado: doce x a la quinta.',
        durationSeconds: 16,
        supportPhrase: 'Multiplicamos números · Sumamos exponentes',
        diagram: {
          type: 'exponent-flow',
          mode: 'multiply',
          coeffA: '3',
          coeffB: '4',
          coeffResult: '12',
          baseVar: 'x',
          expA: 2,
          expB: 3,
        },
      },
      {
        id: 'c9-s2',
        phase: 'paso',
        headline: 'Letras distintas y Actividad 9 (a hasta f)',
        keyMessage: 'Si aparecen letras diferentes (como x e y), sumamos los exponentes de cada letra por separado.',
        narration:
          '¿Qué pasa cuando hay letras diferentes, como en el c? Cuatro x cuadrado y, por tres x y cubo. Multiplicamos cuatro por tres igual a doce. Con la x sumamos dos más uno igual a tres. Y con la y sumamos uno más tres igual a cuatro. Nos queda doce x cubo y cuarta. Y cuidamos siempre los signos negativos.',
        durationSeconds: 17,
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 9 · Multiplicación del TP',
          lines: [
            { label: '9a)', math: '3x² × 4x³ = 12x⁵' },
            { label: '9b)', math: '(-2a³) × 5a² = -10a⁵', note: '(-) × (+) = (-)' },
            { label: '9c)', math: '4x²y × 3xy³ = 12x³y⁴', focus: true, note: 'Cada letra suma sus propios exponentes' },
            { label: '9d)', math: '(-3m²n) × (-2mn³) = +6m³n⁴', note: '(-) × (-) = (+)' },
            { label: '9e)', math: '5a²b × (-4ab²) × 2a = -40a⁴b³' },
            { label: '9f)', math: '(-2x³y²) × 3x²y × (-4xy³) = +24x⁶y⁶' },
          ],
        },
      },
      {
        id: 'c9-s3',
        phase: 'practica',
        headline: 'AHORA TE TOCA A VOS',
        keyMessage: 'Multiplicá los números y sumá los exponentes de la letra a.',
        narration:
          'Probá vos con el ejercicio b de la Actividad 9. ¿Cuánto da menos dos a al cubo por cinco a al cuadrado?',
        durationSeconds: 15,
        supportPhrase: 'Un paso a la vez',
        diagram: {
          type: 'practice-challenge',
          promptMath: '(-2a³) × 5a² = ?',
          question: 'Elegí la respuesta correcta.',
          hint: '(-2) × 5 = -10. Y con los exponentes de la a: 3 + 2 = 5.',
          options: [
            {
              id: 'a',
              label: '-10a⁵',
              isCorrect: true,
              feedback: '¡Perfecto! Multiplicaste -2 × 5 = -10 y sumaste 3 + 2 = 5.',
            },
            {
              id: 'b',
              label: '-10a⁶',
              isCorrect: false,
              feedback: 'El -10 está genial, pero en la multiplicación los exponentes se SUMAN (3 + 2), no se multiplican.',
            },
            {
              id: 'c',
              label: '+10a⁵',
              isCorrect: false,
              feedback: 'Revisá el signo: (-) × (+) da resultado negativo.',
            },
          ],
          solutionSteps: [
            '1. Multiplicar coeficientes: (-2) × 5 = -10.',
            '2. Sumar exponentes de la misma letra: 3 + 2 = 5.',
            '3. Resultado: -10a⁵.',
          ],
        },
      },
    ],
  },
  {
    id: 'cap-10',
    number: 10,
    videoGroupId: 'video-4',
    title: 'División de monomios',
    activityRef: 'Actividad 10 del TP',
    shortDesc: 'Dividir coeficientes y restar exponentes de letras iguales.',
    scenes: [
      {
        id: 'c10-s1',
        phase: 'regla',
        headline: 'Dividir monomios: 12x⁵ ÷ 3x² = 4x³',
        keyMessage: '1. Dividir coeficientes (12÷3=4). 2. Restar exponentes (5−2=3). 3. Simplificar.',
        narration:
          'Para dividir monomios hacemos lo contrario de multiplicar. Miremos doce x a la quinta dividido tres x al cuadrado. Paso uno: dividimos doce dividido tres, que da cuatro. Paso dos: arriba tenemos cinco x multiplicándose y abajo dos x. Se cancelan dos pares y quedan tres. O sea, restamos cinco menos dos igual a tres. Resultado: cuatro x al cubo.',
        durationSeconds: 16,
        supportPhrase: 'Dividimos números · Restamos exponentes',
        diagram: {
          type: 'exponent-flow',
          mode: 'divide',
          coeffA: '12',
          coeffB: '3',
          coeffResult: '4',
          baseVar: 'x',
          expA: 5,
          expB: 2,
        },
      },
      {
        id: 'c10-s2',
        phase: 'paso',
        headline: 'Actividad 10 (a hasta f) paso a paso',
        keyMessage: 'Cuidamos los signos (− ÷ − = + y + ÷ − = −) y restamos el exponente de cada letra.',
        narration:
          'Veamos todos los ejercicios de la Actividad 10. En el b, menos veinte dividido cinco da menos cuatro, y seis menos dos da a la cuarta. En el d, menos veinticuatro dividido menos seis da más cuatro, y restamos los exponentes de m y de n. Y en el f, cuando y a la cuarta se divide por y al cubo queda y a la uno, o sea y sola.',
        durationSeconds: 17,
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 10 · División del TP',
          lines: [
            { label: '10a)', math: '12x⁵ ÷ 3x² = 4x³' },
            { label: '10b)', math: '(-20a⁶) ÷ 5a² = -4a⁴' },
            { label: '10c)', math: '18x⁴y³ ÷ 6x²y = 3x²y²', note: 'y³ ÷ y¹ = y²' },
            { label: '10d)', math: '(-24m⁵n⁴) ÷ (-6m²n²) = +4m³n²', focus: true },
            { label: '10e)', math: '35a⁴b³ ÷ (-7a²b) = -5a²b²' },
            { label: '10f)', math: '42x⁶y⁴ ÷ (-7x²y³) = -6x⁴y' },
          ],
        },
      },
      {
        id: 'c10-s3',
        phase: 'practica',
        headline: 'AHORA TE TOCA A VOS',
        keyMessage: 'Dividí los números de adelante y restá los exponentes.',
        narration:
          'Probá vos con el ejercicio b de la Actividad 10. ¿Cuánto da menos veinte a a la sexta dividido cinco a al cuadrado?',
        durationSeconds: 15,
        supportPhrase: 'Vamos despacio',
        diagram: {
          type: 'practice-challenge',
          promptMath: '(-20a⁶) ÷ 5a² = ?',
          question: 'Recordá restar los exponentes en la división.',
          hint: '-20 ÷ 5 = -4. Y con la letra a: 6 − 2 = 4.',
          options: [
            {
              id: 'a',
              label: '-4a⁴',
              isCorrect: true,
              feedback: '¡Muy bien! -20 ÷ 5 = -4 y restaste 6 − 2 = 4.',
            },
            {
              id: 'b',
              label: '-4a³',
              isCorrect: false,
              feedback: 'Cuidado: los exponentes se RESTAN (6 − 2 = 4), no se dividen.',
            },
            {
              id: 'c',
              label: '-4a⁸',
              isCorrect: false,
              feedback: 'En la división se restan (6 − 2), no se suman.',
            },
          ],
          solutionSteps: [
            '1. Dividimos los coeficientes: -20 ÷ 5 = -4.',
            '2. Restamos los exponentes: 6 - 2 = 4.',
            '3. Resultado: -4a⁴.',
          ],
        },
      },
    ],
  },
  {
    id: 'cap-11',
    number: 11,
    videoGroupId: 'video-4',
    title: 'Operaciones combinadas con monomios',
    activityRef: 'Actividad 11 del TP',
    shortDesc: 'Secuencia ordenada: Paréntesis → Multiplicaciones → Sumas y restas → Reducción.',
    scenes: [
      {
        id: 'c11-s1',
        phase: 'regla',
        headline: 'El orden de las operaciones en monomios',
        keyMessage: 'Secuencia: 1. Paréntesis · 2. Multiplicaciones y divisiones · 3. Sumas y restas · 4. Reducir semejantes.',
        narration:
          'Cuando mezclamos operaciones con monomios, no resolvemos todo de memoria ni de corrido. Seguimos este orden: primero paréntesis, segundo multiplicaciones y divisiones, tercero sumas y restas, y al final reducimos los semejantes. Mirá el a: tres x cuadrado más dos x cuadrado por cuatro x. Primero multiplicamos dos x cuadrado por cuatro x, que da ocho x cubo. Y como x cuadrado y x cubo no son semejantes, ahí termina.',
        durationSeconds: 18,
        supportPhrase: 'No sumar antes de multiplicar',
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 11a · ¿Por qué hacemos primero el ×?',
          lines: [
            { label: 'Ejercicio', math: '3x² + 2x² × 4x' },
            { label: 'Paso 1 (×)', math: '2x² × 4x = 8x³', focus: true, note: 'La multiplicación va antes que la suma' },
            { label: 'Paso 2 (+)', math: '3x² + 8x³', note: 'Distinto exponente → no se pueden juntar' },
          ],
        },
      },
      {
        id: 'c11-s2',
        phase: 'paso',
        headline: 'Actividad 11 (b, c, d, e, f) resueltos paso a paso',
        keyMessage: 'Cada paso tiene su porqué: primero resolvemos paréntesis, × o ÷, y recién después juntamos semejantes.',
        narration:
          'Revisemos los demás puntos de la Actividad 11. En el c, dos x cuadrado por tres x cubo da seis x quinta, y recién ahí le restamos cuatro x quinta para obtener dos x quinta. En el d, primero dividimos doce m cuarta dividido tres m cuadrado igual a cuatro m cuadrado, y sumado a cinco m cuadrado da nueve m cuadrado. Y en el f resolvemos el paréntesis primero.',
        durationSeconds: 18,
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 11 · Operaciones combinadas',
          lines: [
            { label: '11b)', math: '5a³ - 2a³ + 3a³ = 6a³' },
            { label: '11c)', math: '2x² × 3x³ - 4x⁵ = 6x⁵ - 4x⁵ = 2x⁵' },
            { label: '11d)', math: '12m⁴ ÷ 3m² + 5m² = 4m² + 5m² = 9m²' },
            { label: '11e)', math: '2a²b + 3a²b - 2ab² + 5ab² = 5a²b + 3ab²' },
            { label: '11f)', math: '3x²(2x³ - x³) - 4x⁵ = 3x²(x³) - 4x⁵ = 3x⁵ - 4x⁵ = -x⁵', focus: true },
          ],
        },
      },
    ],
  },
  {
    id: 'cap-12',
    number: 12,
    videoGroupId: 'video-4',
    title: 'Integración final y logros',
    activityRef: 'Actividad 12 del TP',
    shortDesc: 'Área del rectángulo, desafíos finales y resumen de todo lo aprendido.',
    scenes: [
      {
        id: 'c12-s1',
        phase: 'que-pide',
        headline: 'Actividad 12e: Área de un rectángulo con monomios',
        keyMessage: 'Un lado mide 3x² y el otro mide 2x. Recordá: Área = lado × lado.',
        narration:
          'Llegamos a la integración final, Actividad 12. Miremos el problema del rectángulo: un lado mide tres x al cuadrado y el otro lado mide dos x. ¿Qué me pide? Expresar el área mediante un monomio. Recordamos la regla: el área de un rectángulo es lado por lado. Multiplicamos tres x al cuadrado por dos x: tres por dos seis, y x al cuadrado por x da x al cubo. Área igual a seis x al cubo.',
        durationSeconds: 17,
        supportPhrase: 'Área = lado × lado',
        diagram: {
          type: 'rectangle-area',
          widthLabel: '3x²',
          heightLabel: '2x',
          areaLabel: '6x³',
          showResult: true,
        },
      },
      {
        id: 'c12-s2',
        phase: 'paso',
        headline: 'Actividad 12 (a, b, c, f y g): Desafíos finales',
        keyMessage: 'Aplicamos paso a paso todo lo que practicamos con fracciones y monomios.',
        narration:
          'Acá tenés resueltos los ejercicios finales de la Actividad 12 para repasar tranquila. En el a, primero el paréntesis, luego multiplicamos y al final dividimos dando vuelta la última fracción: da menos tres quintos. En el b, primero multiplicamos cuatro x cuadrado por tres x cubo igual a doce x quinta, y luego reducimos: da nueve x quinta. Y en el desafío g, paso a paso da cinco x quinta.',
        durationSeconds: 18,
        diagram: {
          type: 'steps-board',
          exerciseTag: 'Actividad 12 · Integración Final del TP',
          lines: [
            { label: '12a)', math: '(-2/3 + 1/6) × (-3/4) ÷ (-5/8) = (-1/2) × (-3/4) × (-8/5) = -3/5' },
            { label: '12b)', math: '4x² × 3x³ - 5x⁵ + 2x⁵ = 12x⁵ - 5x⁵ + 2x⁵ = 9x⁵' },
            { label: '12c)', math: 'Grados: 7x³y² (5); -4a⁵ (5); 9mn (2); 6 (0); -2p²q³ (5)' },
            { label: '12f)', math: '[(7/8 · 1/4) ÷ 5/6] × (2/3 + 1/9) = (21/80) × (7/9) = 49/240' },
            { label: '12g)', math: '2x²(3x³ - x³) - 4x⁵ + 5x² × x³ = 4x⁵ - 4x⁵ + 5x⁵ = 5x⁵', focus: true },
          ],
        },
      },
      {
        id: 'c12-s3',
        phase: 'cierre',
        headline: '¡YA APRENDISTE MUCHAS COSAS!',
        keyMessage: 'Cada paso que diste cuenta. Matemática se aprende practicando sin apuro.',
        narration:
          '¡Ya aprendiste muchas cosas! Ahora podés resolver fracciones paso a paso, identificar potencias y raíces, reconocer un monomio, juntar monomios semejantes, multiplicar y dividir monomios, y resolver un ejercicio sin apurarte. Matemática no se aprende todo de una vez. Se aprende practicando, paso a paso. No importa cuánto tardes. Lo importante es que cada día comprendas un poquito más. ¡Vos podés!',
        durationSeconds: 20,
        supportPhrase: '¡Vos podés!',
        diagram: {
          type: 'final-summary',
        },
      },
    ],
  },
];
