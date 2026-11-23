import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { VIDEO_MODULES, getChaptersForVideo } from '../src/data/curriculum.ts';
import type { Chapter, LessonScene, VideoModule } from '../src/types/lesson.ts';
import {
  TtsQuotaError,
  createSilentPcm,
  extractWavPcm,
  isTtsCached,
  synthesizeNarrationWithRetry,
  wrapPcmInWav,
} from './ttsService.ts';
import { buildSceneSvgFrames } from './svgRenderer.ts';

const execFileAsync = promisify(execFile);

const VIDEO_CACHE_DIR = '/tmp/math_videos';
if (!fs.existsSync(VIDEO_CACHE_DIR)) {
  fs.mkdirSync(VIDEO_CACHE_DIR, { recursive: true });
}

export interface VideoBuildStatus {
  videoId: VideoModule['id'];
  filename: string;
  status: 'idle' | 'building' | 'ready' | 'error';
  progress: number;
  detail: string;
  fileSizeBytes?: number;
  error?: string;
}

const FILE_NAMES: Record<VideoModule['id'], string> = {
  'video-1': 'Video_1_Fracciones_3er_Ano.mp4',
  'video-2': 'Video_2_Potencias_y_Raices_3er_Ano.mp4',
  'video-3': 'Video_3_Monomios_3er_Ano.mp4',
  'video-4': 'Video_4_Multiplicacion_Division_Integracion_3er_Ano.mp4',
  'english-1': 'Ingles_1_Clima_y_Desastres_3er_Ano.mp4',
  'english-2': 'Ingles_2_Was_y_Were_3er_Ano.mp4',
  'english-3': 'Ingles_3_Past_Simple_3er_Ano.mp4',
  'english-4': 'Ingles_4_In_On_At_y_Repaso_3er_Ano.mp4',
};

const activeJobs = new Map<VideoModule['id'], Promise<string>>();
const statusMap = new Map<VideoModule['id'], VideoBuildStatus>();

export function getVideoFilePath(videoId: VideoModule['id']): string {
  return path.join(VIDEO_CACHE_DIR, `${videoId}.mp4`);
}

export function getVideoStatus(videoId: VideoModule['id']): VideoBuildStatus {
  const filePath = getVideoFilePath(videoId);
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (stat.size > 1024) {
      return {
        videoId,
        filename: FILE_NAMES[videoId],
        status: 'ready',
        progress: 100,
        detail: 'Listo para descargar en MP4',
        fileSizeBytes: stat.size,
      };
    }
  }
  return (
    statusMap.get(videoId) || {
      videoId,
      filename: FILE_NAMES[videoId],
      status: 'idle',
      progress: 0,
      detail: 'Listo para generar cuando lo descargues',
    }
  );
}

export function getAllVideoStatuses(): VideoBuildStatus[] {
  return VIDEO_MODULES.map((m) => getVideoStatus(m.id));
}

function setStatus(videoId: VideoModule['id'], patch: Partial<VideoBuildStatus>) {
  const prev = getVideoStatus(videoId);
  statusMap.set(videoId, {
    ...prev,
    ...patch,
    videoId,
    filename: FILE_NAMES[videoId],
  });
}

export async function ensureVideoBuilt(videoId: VideoModule['id']): Promise<string> {
  const finalPath = getVideoFilePath(videoId);
  if (fs.existsSync(finalPath) && fs.statSync(finalPath).size > 1024) {
    return finalPath;
  }

  const existingJob = activeJobs.get(videoId);
  if (existingJob) {
    return existingJob;
  }

  const jobPromise = buildVideoMp4(videoId).finally(() => {
    activeJobs.delete(videoId);
  });
  activeJobs.set(videoId, jobPromise);
  return jobPromise;
}

async function buildVideoMp4(videoId: VideoModule['id']): Promise<string> {
  const chapters = getChaptersForVideo(videoId);
  const items: Array<{ chapter: Chapter; scene: LessonScene }> = [];
  for (const ch of chapters) {
    for (const sc of ch.scenes) {
      items.push({ chapter: ch, scene: sc });
    }
  }

  if (items.length === 0) {
    throw new Error('No se encontraron escenas para este video.');
  }

  const workDir = path.join(VIDEO_CACHE_DIR, `job-${videoId}-${Date.now()}`);
  fs.mkdirSync(workDir, { recursive: true });

  try {
    setStatus(videoId, {
      status: 'building',
      progress: 5,
      detail: 'Generando narración en español rioplatense...',
      error: undefined,
    });

    const audioList: Array<Buffer | null> = [];
    let quotaErrMessage: string | null = null;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const alreadyCached = isTtsCached(item.scene.narration);
      let wav: Buffer | null = null;
      try {
        wav = await synthesizeNarrationWithRetry(item.scene.narration, (waitSec) => {
          const pct = 5 + Math.round((i / items.length) * 45);
          setStatus(videoId, {
            status: 'building',
            progress: pct,
            detail: `Pausa breve por límite de voz (${waitSec}s) · escena ${i + 1}/${items.length}...`,
          });
        });
      } catch (err: any) {
        if (err instanceof TtsQuotaError) {
          quotaErrMessage = err.message;
          break;
        }
        console.warn(`TTS failed for ${item.scene.id}:`, err);
      }
      audioList.push(wav);

      const pct = 5 + Math.round(((i + 1) / items.length) * 45);
      setStatus(videoId, {
        status: 'building',
        progress: pct,
        detail: `Preparando voz (${i + 1}/${items.length})...`,
      });

      if (!alreadyCached && i + 1 < items.length) {
        await new Promise((r) => setTimeout(r, 1100));
      }
    }

    const hasApiKey = Boolean(
      process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
    );
    const nonEmptyCount = audioList.filter((w) => w && w.length > 44).length;
    if (quotaErrMessage) {
      throw new Error(
        `${quotaErrMessage} (Quedaron guardadas ${nonEmptyCount} de ${items.length} escenas con la voz cálida Kore).`
      );
    }
    if (hasApiKey && nonEmptyCount < items.length) {
      throw new Error(
        `Solo se pudieron narrar ${nonEmptyCount} de ${items.length} escenas por límite temporal de la API. Volvé a intentar en unos segundos (las escenas ya listas quedan guardadas).`
      );
    }

    setStatus(videoId, {
      status: 'building',
      progress: 55,
      detail: 'Dibujando láminas visuales paso a paso...',
    });

    const pcmChunks: Buffer[] = [];
    const concatEntries: Array<{ pngPath: string; durationSec: number }> = [];
    let frameCounter = 0;

    for (let i = 0; i < items.length; i++) {
      const { chapter, scene } = items[i];
      const wavBuf = audioList[i];

      let sceneSpeechPcm: Buffer;
      let sampleRate = 24000;

      if (wavBuf) {
        const parsed = extractWavPcm(wavBuf);
        sampleRate = parsed.sampleRate || 24000;
        sceneSpeechPcm = parsed.pcm;
      } else {
        sceneSpeechPcm = createSilentPcm(scene.durationSeconds, sampleRate);
      }

      const speechDurationSec = Math.max(
        2,
        sceneSpeechPcm.length / (sampleRate * 2)
      );
      const trailingPauseSec = 1.4;
      const frames = buildSceneSvgFrames(chapter, scene);

      // Compute extra pause seconds across frames (e.g., 10s thinking pause on practice scenes)
      let extraPauseTotalSec = 0;
      for (const f of frames) {
        if (f.extraPauseSeconds) extraPauseTotalSec += f.extraPauseSeconds;
      }

      // Append speech PCM + extra pause PCM + trailing transition silence
      pcmChunks.push(sceneSpeechPcm);
      if (extraPauseTotalSec + trailingPauseSec > 0) {
        pcmChunks.push(createSilentPcm(extraPauseTotalSec + trailingPauseSec, sampleRate));
      }

      for (let fIdx = 0; fIdx < frames.length; fIdx++) {
        const f = frames[fIdx];
        const svgPath = path.join(workDir, `f_${frameCounter}.svg`);
        const pngPath = path.join(workDir, `f_${frameCounter}.png`);
        frameCounter++;

        fs.writeFileSync(svgPath, f.svg, 'utf-8');
        await execFileAsync('ffmpeg', [
          '-y',
          '-f',
          'svg_pipe',
          '-i',
          svgPath,
          '-frames:v',
          '1',
          pngPath,
        ]);

        const isLast = fIdx === frames.length - 1;
        const dur =
          speechDurationSec * f.durationShare +
          (f.extraPauseSeconds || 0) +
          (isLast ? trailingPauseSec : 0);

        concatEntries.push({ pngPath, durationSec: Math.max(0.5, dur) });
      }

      const pct = 55 + Math.round(((i + 1) / items.length) * 25);
      setStatus(videoId, {
        status: 'building',
        progress: pct,
        detail: `Renderizando escenas (${i + 1}/${items.length})...`,
      });
    }

    setStatus(videoId, {
      status: 'building',
      progress: 85,
      detail: 'Uniendo video HD y audio en archivo MP4...',
    });

    const fullPcm = Buffer.concat(pcmChunks);
    const fullWav = wrapPcmInWav(fullPcm, 24000, 1, 16);
    const fullWavPath = path.join(workDir, 'audio.wav');
    fs.writeFileSync(fullWavPath, fullWav);

    const concatLines: string[] = [];
    for (const entry of concatEntries) {
      concatLines.push(`file '${entry.pngPath.replace(/'/g, "'\\''")}'`);
      concatLines.push(`duration ${entry.durationSec.toFixed(3)}`);
    }
    // FFmpeg concat demuxer requires the final file listed again without duration
    if (concatEntries.length > 0) {
      const last = concatEntries[concatEntries.length - 1];
      concatLines.push(`file '${last.pngPath.replace(/'/g, "'\\''")}'`);
    }

    const concatTxtPath = path.join(workDir, 'frames.txt');
    fs.writeFileSync(concatTxtPath, concatLines.join('\n'), 'utf-8');

    const tmpOutPath = path.join(workDir, 'out.mp4');
    await execFileAsync('ffmpeg', [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      concatTxtPath,
      '-i',
      fullWavPath,
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-tune',
      'stillimage',
      '-pix_fmt',
      'yuv420p',
      '-r',
      '24',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-shortest',
      '-movflags',
      '+faststart',
      tmpOutPath,
    ]);

    const finalPath = getVideoFilePath(videoId);
    fs.renameSync(tmpOutPath, finalPath);

    const stat = fs.statSync(finalPath);
    setStatus(videoId, {
      status: 'ready',
      progress: 100,
      detail: 'Listo para descargar en MP4',
      fileSizeBytes: stat.size,
    });

    return finalPath;
  } catch (err: any) {
    const message = err?.message || 'Error al generar el video MP4.';
    console.error(`Video build failed for ${videoId}:`, message);
    setStatus(videoId, {
      status: 'error',
      progress: 0,
      detail: 'No se pudo generar el video.',
      error: message,
    });
    throw err;
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}
