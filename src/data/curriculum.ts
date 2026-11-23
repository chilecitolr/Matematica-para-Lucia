import type { Chapter, VideoModule } from '../types/lesson.ts';
import { VIDEO_1_CHAPTERS } from './video1Fracciones.ts';
import { VIDEO_2_CHAPTERS } from './video2PotenciasRaices.ts';
import { VIDEO_3_CHAPTERS } from './video3Monomios.ts';
import { VIDEO_4_CHAPTERS } from './video4OperacionesIntegracion.ts';

export const VIDEO_MODULES: VideoModule[] = [
  {
    id: 'video-1',
    shortLabel: 'Video 1 · Fracciones',
    title: 'Fracciones paso a paso',
    subtitle: 'Suma, resta, multiplicación, división, signos y combinadas',
    chapterNumbers: [1, 2, 5],
  },
  {
    id: 'video-2',
    shortLabel: 'Video 2 · Potencias y Raíces',
    title: 'Potencias y raíces',
    subtitle: 'Comprender bases, exponentes, cuadrados y cubos visuales',
    chapterNumbers: [3, 4],
  },
  {
    id: 'video-3',
    shortLabel: 'Video 3 · Monomios',
    title: 'Monomios y semejantes',
    subtitle: 'Partes con colores, clasificación, suma y resta',
    chapterNumbers: [6, 7, 8],
  },
  {
    id: 'video-4',
    shortLabel: 'Video 4 · Integración',
    title: 'Multiplicación, división e integración',
    subtitle: 'Exponentes, combinadas y problemas del trabajo práctico',
    chapterNumbers: [9, 10, 11, 12],
  },
];

export const ALL_CHAPTERS: Chapter[] = [
  ...VIDEO_1_CHAPTERS,
  ...VIDEO_2_CHAPTERS,
  ...VIDEO_3_CHAPTERS,
  ...VIDEO_4_CHAPTERS,
].sort((a, b) => a.number - b.number);

export function getChaptersForVideo(videoId: VideoModule['id']): Chapter[] {
  const mod = VIDEO_MODULES.find((v) => v.id === videoId);
  if (!mod) return [];
  return mod.chapterNumbers
    .map((num) => ALL_CHAPTERS.find((c) => c.number === num))
    .filter((c): c is Chapter => Boolean(c));
}
