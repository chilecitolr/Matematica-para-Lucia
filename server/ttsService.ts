import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

const AUDIO_CACHE_DIR = '/tmp/math_tts_cache';
if (!fs.existsSync(AUDIO_CACHE_DIR)) {
  fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });
}

const memoryCache = new Map<string, Buffer>();
const MAX_MEM_ENTRIES = 200;

export function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function hashText(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 24);
}

export function isTtsCached(rawText: string): boolean {
  const text = rawText.trim().slice(0, 1200);
  if (!text) return false;
  const key = hashText(text);
  if (memoryCache.has(key)) return true;
  return fs.existsSync(path.join(AUDIO_CACHE_DIR, `${key}.wav`));
}

/**
 * Generates or retrieves cached 24kHz mono 16-bit WAV buffer for Spanish Argentine narration.
 */
export async function synthesizeNarrationWav(rawText: string): Promise<Buffer | null> {
  const text = rawText.trim().slice(0, 1200);
  if (!text) return null;

  const key = hashText(text);
  const memHit = memoryCache.get(key);
  if (memHit) return memHit;

  const diskPath = path.join(AUDIO_CACHE_DIR, `${key}.wav`);
  if (fs.existsSync(diskPath)) {
    const buf = fs.readFileSync(diskPath);
    if (buf.length > 44) {
      memoryCache.set(key, buf);
      return buf;
    }
  }

  const ai = getAiClient();
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash-lite-tts',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text,
            speechMetadata: {
              style:
                'Profesora argentina cálida, tranquila y paciente hablando español rioplatense claro y pausado para una alumna de 15 años, pronunciando con nitidez números, signos, fracciones y exponentes.',
            },
          } as any,
        ],
      },
    ],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return null;

  const wavBuffer = Buffer.from(base64Audio, 'base64');
  fs.writeFileSync(diskPath, wavBuffer);

  if (memoryCache.size >= MAX_MEM_ENTRIES) {
    const oldest = memoryCache.keys().next().value;
    if (oldest) memoryCache.delete(oldest);
  }
  memoryCache.set(key, wavBuffer);
  return wavBuffer;
}

export async function synthesizeNarrationWithRetry(
  rawText: string,
  onRateLimitWait?: (waitSec: number) => void
): Promise<Buffer | null> {
  if (isTtsCached(rawText)) {
    return synthesizeNarrationWav(rawText);
  }

  const delaysMs = [6000, 12000, 20000, 30000];
  for (let attempt = 0; attempt <= delaysMs.length; attempt++) {
    try {
      const wav = await synthesizeNarrationWav(rawText);
      if (wav && wav.length > 44) return wav;
      return wav;
    } catch (err: any) {
      const msg = String(err?.message || err);
      const is429 = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED');
      if (attempt < delaysMs.length && is429) {
        const waitMs = delaysMs[attempt];
        onRateLimitWait?.(Math.round(waitMs / 1000));
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      if (attempt < 1) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      throw err;
    }
  }
  return null;
}

/**
 * Reads PCM info from a standard WAV buffer and creates a silent WAV or concatenates multiple WAVs.
 */
export function extractWavPcm(wav: Buffer): {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  pcm: Buffer;
} {
  if (wav.length < 44 || wav.toString('ascii', 0, 4) !== 'RIFF') {
    return { sampleRate: 24000, channels: 1, bitsPerSample: 16, pcm: Buffer.alloc(0) };
  }
  const channels = wav.readUInt16LE(22);
  const sampleRate = wav.readUInt32LE(24);
  const bitsPerSample = wav.readUInt16LE(34);

  let offset = 12;
  while (offset + 8 <= wav.length) {
    const chunkId = wav.toString('ascii', offset, offset + 4);
    const chunkSize = wav.readUInt32LE(offset + 4);
    if (chunkId === 'data') {
      const start = offset + 8;
      const end = Math.min(wav.length, start + chunkSize);
      return { sampleRate, channels, bitsPerSample, pcm: wav.subarray(start, end) };
    }
    offset += 8 + chunkSize + (chunkSize % 2);
  }

  return { sampleRate, channels, bitsPerSample, pcm: wav.subarray(44) };
}

export function createSilentPcm(durationSeconds: number, sampleRate = 24000): Buffer {
  const samples = Math.max(1, Math.round(durationSeconds * sampleRate));
  return Buffer.alloc(samples * 2);
}

export function wrapPcmInWav(pcm: Buffer, sampleRate = 24000, channels = 1, bitsPerSample = 16): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}
