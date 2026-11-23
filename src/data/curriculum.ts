import type { Chapter, SubjectId, VideoId, VideoModule } from '../types/lesson.ts';
import { VIDEO_1_CHAPTERS } from './video1Fracciones.ts';
import { VIDEO_2_CHAPTERS } from './video2PotenciasRaices.ts';
import { VIDEO_3_CHAPTERS } from './video3Monomios.ts';
import { VIDEO_4_CHAPTERS } from './video4OperacionesIntegracion.ts';
import { ENGLISH_CHAPTERS } from './englishIngles.ts';

export const MATH_VIDEO_MODULES: VideoModule[] = [
  {
    id: 'video-1',
    subject: 'matematica',
    shortLabel: 'Video 1 · Fracciones',
    title: 'Fracciones paso a paso',
    subtitle: 'Suma, resta, multiplicación, división, signos y combinadas',
    chapterNumbers: [1, 2, 5],
  },
  {
    id: 'video-2',
    subject: 'matematica',
    shortLabel: 'Video 2 · Potencias y Raíces',
    title: 'Potencias y raíces',
    subtitle: 'Comprender bases, exponentes, cuadrados y cubos visuales',
    chapterNumbers: [3, 4],
  },
  {
    id: 'video-3',
    subject: 'matematica',
    shortLabel: 'Video 3 · Monomios',
    title: 'Monomios y semejantes',
    subtitle: 'Partes con colores, clasificación, suma y resta',
    chapterNumbers: [6, 7, 8],
  },
  {
    id: 'video-4',
    subject: 'matematica',
    shortLabel: 'Video 4 · Integración',
    title: 'Multiplicación, división e integración',
    subtitle: 'Exponentes, combinadas y problemas del trabajo práctico',
    chapterNumbers: [9, 10, 11, 12],
  },
];

export const ENGLISH_VIDEO_MODULES: VideoModule[] = [
  {
    id: 'english-1',
    subject: 'ingles',
    shortLabel: 'Tema 1 · Weather',
    title: 'El clima y desastres naturales',
    subtitle: 'Leer, mirar dibujos y practicar sin apuro',
    chapterNumbers: [1],
  },
  {
    id: 'english-2',
    subject: 'ingles',
    shortLabel: 'Tema 2 · Was / Were',
    title: 'WAS y WERE (pasado de TO BE)',
    subtitle: 'Afirmativa, negativa con NOT y preguntas',
    chapterNumbers: [2],
  },
  {
    id: 'english-3',
    subject: 'ingles',
    shortLabel: 'Tema 3 · Past Simple',
    title: 'Acciones que ya ocurrieron',
    subtitle: 'Regulares con -ED, 6 irregulares y regla de DID',
    chapterNumbers: [3],
  },
  {
    id: 'english-4',
    subject: 'ingles',
    shortLabel: 'Tema 4 · In / On / At',
    title: 'Palabras de tiempo y repaso',
    subtitle: 'Meses (IN), días (ON), horas (AT) y logros finales',
    chapterNumbers: [4],
  },
];

export const VIDEO_MODULES: VideoModule[] = [
  ...MATH_VIDEO_MODULES,
  ...ENGLISH_VIDEO_MODULES,
];

export const ALL_MATH_CHAPTERS: Chapter[] = [
  ...VIDEO_1_CHAPTERS,
  ...VIDEO_2_CHAPTERS,
  ...VIDEO_3_CHAPTERS,
  ...VIDEO_4_CHAPTERS,
].sort((a, b) => a.number - b.number);

export const ALL_ENGLISH_CHAPTERS: Chapter[] = [...ENGLISH_CHAPTERS].sort(
  (a, b) => a.number - b.number
);

export const ALL_CHAPTERS: Chapter[] = ALL_MATH_CHAPTERS;

export function getVideosForSubject(subject: SubjectId): VideoModule[] {
  return subject === 'ingles' ? ENGLISH_VIDEO_MODULES : MATH_VIDEO_MODULES;
}

export function getChaptersForVideo(videoId: VideoId): Chapter[] {
  const source = videoId.startsWith('english-')
    ? ALL_ENGLISH_CHAPTERS
    : ALL_MATH_CHAPTERS;
  return source
    .filter((c) => c.videoGroupId === videoId)
    .sort((a, b) => a.number - b.number);
}
