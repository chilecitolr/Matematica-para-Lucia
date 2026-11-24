import type { VideoId } from '../types/lesson';

export interface QuickCheckOption {
  id: string;
  label: string;
  isMathExpr?: boolean;
  isCorrect: boolean;
  feedback: string;
}

export interface QuickCheckItem {
  videoId: VideoId;
  prompt: string;
  mathExpr?: string;
  encouragementNote: string;
  options: QuickCheckOption[];
}

export const QUICK_CHECKS_BY_VIDEO: Record<VideoId, QuickCheckItem> = {
  'video-1': {
    videoId: 'video-1',
    prompt: 'Para restar dos fracciones con distinto denominador, ¿qué hacemos primero?',
    mathExpr: '7/6 - 1/3 = 7/6 - 2/6 = 5/6',
    encouragementNote: 'Recordar este primer paso hace que todas las restas salgan fácil.',
    options: [
      {
        id: 'v1-a',
        label: 'Restar directo arriba y abajo (7 − 1 y 6 − 3)',
        isCorrect: false,
        feedback:
          '¡Casi! Si restamos distinto tamaño de partes sin igualar abajo, la cuenta no coincide. Probá buscando denominador común.',
      },
      {
        id: 'v1-b',
        label: 'Llevar las dos fracciones al mismo denominador común',
        isCorrect: true,
        feedback:
          '¡Excelente, Lucía! Primero igualamos los denominadores multiplicando 1/3 por 2 arriba y abajo para obtener 2/6, y recién ahí restamos arriba.',
      },
      {
        id: 'v1-c',
        label: 'Dar vuelta la segunda fracción antes de restar',
        isCorrect: false,
        feedback:
          '¡Buen intento! Dar vuelta la segunda fracción se usa solo cuando dividimos fracciones, no cuando sumamos o restamos.',
      },
    ],
  },
  'video-2': {
    videoId: 'video-2',
    prompt: '¿Cuánto da esta potencia cuando el signo menos está adentro del paréntesis?',
    mathExpr: '(-3)² = (-3) × (-3)',
    encouragementNote: 'El paréntesis nos avisa si el signo menos también se repite.',
    options: [
      {
        id: 'v2-a',
        label: '-6',
        isMathExpr: true,
        isCorrect: false,
        feedback:
          '¡Ojo con multiplicar 3 × 2! El exponente 2 indica repetir el −3 dos veces multiplicando, no multiplicar por 2.',
      },
      {
        id: 'v2-b',
        label: '-9',
        isMathExpr: true,
        isCorrect: false,
        feedback:
          '¡Muy cerca! Daría −9 si el menos estuviera afuera del paréntesis. Como está adentro, también hacemos (−) × (−).',
      },
      {
        id: 'v2-c',
        label: '+9',
        isMathExpr: true,
        isCorrect: true,
        feedback:
          '¡Brillante, Lucía! Al repetir (−3) × (−3), 3 × 3 = 9 y menos por menos da +. ¡Lo entendiste perfecto!',
      },
    ],
  },
  'video-3': {
    videoId: 'video-3',
    prompt: '¿Cuál de estas sumas tiene monomios semejantes que SÍ se pueden juntar?',
    encouragementNote: 'Para juntarlos, tienen que compartir exactamente la misma letra y el mismo exponente.',
    options: [
      {
        id: 'v3-a',
        label: '5x² + 2x² = 7x²',
        isMathExpr: true,
        isCorrect: true,
        feedback:
          '¡Exacto, Lucía! Los dos tienen x² (misma letra y mismo exponente), por eso se pueden sumar sin problema.',
      },
      {
        id: 'v3-b',
        label: '5x² + 2x³',
        isMathExpr: true,
        isCorrect: false,
        feedback:
          '¡Casi! Aunque los dos usan x, uno tiene exponente 2 y el otro exponente 3: son familias distintas.',
      },
      {
        id: 'v3-c',
        label: '5x + 2y',
        isMathExpr: true,
        isCorrect: false,
        feedback:
          '¡Buen ojo para revisar! Acá uno tiene letra x y el otro tiene letra y, así que quedan separados.',
      },
    ],
  },
  'video-4': {
    videoId: 'video-4',
    prompt: 'Cuando multiplicamos dos potencias con la misma letra, ¿qué hacemos con sus exponentes?',
    mathExpr: '3x² × 2x³ = ?',
    encouragementNote: 'Primero multiplicamos los números adelante, y después miramos los exponentes.',
    options: [
      {
        id: 'v4-a',
        label: 'Multiplicarlos (da 6x⁶)',
        isCorrect: false,
        feedback:
          '¡Casi! Los coeficientes (3 × 2 = 6) sí se multiplican, pero los exponentes de letras iguales se suman.',
      },
      {
        id: 'v4-b',
        label: 'Sumarlos (da 6x⁵)',
        isCorrect: true,
        feedback:
          '¡Genial, Lucía! Multiplicamos 3 × 2 = 6 y sumamos 2 + 3 = 5 en el exponente: 6x⁵. ¡Impecable!',
      },
      {
        id: 'v4-c',
        label: 'Restarlos (da 6x¹)',
        isCorrect: false,
        feedback:
          '¡Buen intento! Restar los exponentes se usa en la división, no en la multiplicación.',
      },
    ],
  },
  'english-1': {
    videoId: 'english-1',
    prompt: 'SI MIRÁS POR LA VENTANA Y HAY MUCHAS NUBES Y LLUVIA, ¿QUÉ PALABRAS DESCRIBEN ESE DÍA?',
    encouragementNote: 'MIRÁ PRIMERO EL SIGNIFICADO DE CADA PALABRA EN ESPAÑOL, SIN APURO.',
    options: [
      {
        id: 'e1-a',
        label: 'SUNNY AND SNOWY',
        isCorrect: false,
        feedback:
          '¡Casi! SUNNY significa soleado y SNOWY significa nevado. Probá buscando las palabras de nubes y lluvia.',
      },
      {
        id: 'e1-b',
        label: 'CLOUDY AND RAINY',
        isCorrect: true,
        feedback:
          '¡EXCELENTE, LUCÍA! CLOUDY ES NUBLADO Y RAINY ES LLUVIOSO. ¡CADA VEZ RECORDÁS MÁS PALABRAS!',
      },
      {
        id: 'e1-c',
        label: 'VOLCANO AND WILDFIRE',
        isCorrect: false,
        feedback:
          '¡Buen intento! Esas dos palabras son desastres naturales (volcán e incendio forestal).',
      },
    ],
  },
  'english-2': {
    videoId: 'english-2',
    prompt: 'EN LA ORACIÓN “THE WEATHER ___ SUNNY YESTERDAY”, ¿QUÉ FORMA VA?',
    encouragementNote: 'ACORDATE DE MIRAR PRIMERO SI HABLAMOS DE UNA COSA (IT) O DE VARIAS.',
    options: [
      {
        id: 'e2-a',
        label: 'WAS',
        isCorrect: true,
        feedback:
          '¡BRILLANTE, LUCÍA! THE WEATHER ES UNA SOLA COSA (EQUIVALE A IT), POR ESO VA CON WAS.',
      },
      {
        id: 'e2-b',
        label: 'WERE',
        isCorrect: false,
        feedback:
          '¡Casi! WERE se usa con YOU, WE o THEY (varios). Probá pensando en THE WEATHER como una sola cosa.',
      },
      {
        id: 'e2-c',
        label: "WEREN'T",
        isCorrect: false,
        feedback:
          "¡Ojo! WEREN'T además de ser para plurales significa que NO estaba.",
      },
    ],
  },
  'english-3': {
    videoId: 'english-3',
    prompt: '¿CUÁL DE ESTAS ORACIONES EN PASADO NEGATIVO ESTÁ BIEN ESCRITA?',
    encouragementNote: "RECORDÁ LA REGLA DE ORO: CUANDO APARECE DID O DIDN'T, ¿CÓMO QUEDA EL VERBO?",
    options: [
      {
        id: 'e3-a',
        label: "I DIDN'T PLAYED FOOTBALL.",
        isCorrect: false,
        feedback:
          "¡Casi! Como ya pusimos DIDN'T, el pasado ya está marcado ahí y el verbo PLAY no lleva -ED.",
      },
      {
        id: 'e3-b',
        label: "I DIDN'T PLAY FOOTBALL.",
        isCorrect: true,
        feedback:
          "¡EXACTO, LUCÍA! CON DID O DIDN'T EL VERBO VUELVE A SU FORMA NORMAL (PLAY). ¡DOMINASTE LA REGLA DE ORO!",
      },
      {
        id: 'e3-c',
        label: 'I NOT PLAYED FOOTBALL.',
        isCorrect: false,
        feedback:
          "¡Buen intento! En Past Simple necesitamos el auxiliar DIDN'T delante del verbo para negar.",
      },
    ],
  },
  'english-4': {
    videoId: 'english-4',
    prompt: 'PARA DECIR “EL LUNES A LAS 8”, ¿QUÉ PREPOSICIONES VAN EN “___ MONDAY ___ 8 O\'CLOCK”?',
    encouragementNote: 'PENSÁ QUÉ PALABRA VA CON LOS DÍAS Y QUÉ PALABRA VA CON LAS HORAS EXACTAS.',
    options: [
      {
        id: 'e4-a',
        label: "IN MONDAY ... ON 8 O'CLOCK",
        isCorrect: false,
        feedback:
          '¡Casi! IN va para meses y años (períodos grandes), mientras que los días llevan ON.',
      },
      {
        id: 'e4-b',
        label: "AT MONDAY ... IN 8 O'CLOCK",
        isCorrect: false,
        feedback:
          '¡Están al revés! AT es para horas exactas y ON es para días de la semana.',
      },
      {
        id: 'e4-c',
        label: "ON MONDAY ... AT 8 O'CLOCK",
        isCorrect: true,
        feedback:
          "¡PERFECTO, LUCÍA! LOS DÍAS (MONDAY) LLEVAN ON Y LAS HORAS EXACTAS (8 O'CLOCK) LLEVAN AT. ¡FELICITACIONES!",
      },
    ],
  },
};
