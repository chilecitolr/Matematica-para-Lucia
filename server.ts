import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TtsQuotaError, synthesizeNarrationLive } from './server/ttsService.ts';
import {
  ensureVideoBuilt,
  getAllVideoStatuses,
  getVideoStatus,
} from './server/videoBuilder.ts';
import type { VideoModule } from './src/types/lesson.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();
app.use(express.json({ limit: '1mb' }));

const VALID_VIDEO_IDS = new Set<VideoModule['id']>([
  'video-1',
  'video-2',
  'video-3',
  'video-4',
]);

app.get('/api/health', (_req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const ttsConfigured = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
  res.json({ ok: true, ttsConfigured });
});

app.post('/api/tts', async (req, res) => {
  try {
    const rawText = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (!rawText) {
      res.status(400).json({ error: 'Se requiere texto para narrar.' });
      return;
    }

    const wavBuffer = await synthesizeNarrationLive(rawText);
    if (!wavBuffer) {
      res.status(503).json({
        error: 'Servicio de voz Gemini no disponible; usando voz del navegador.',
        fallback: true,
      });
      return;
    }

    res.json({
      audioBase64: wavBuffer.toString('base64'),
      mimeType: 'audio/wav',
    });
  } catch (err: any) {
    const message = err?.message || 'Error al generar voz.';
    const isQuota =
      err instanceof TtsQuotaError ||
      err?.quotaExceeded === true ||
      message.includes('429') ||
      message.includes('RESOURCE_EXHAUSTED');

    console.error('TTS error:', message);
    res.status(isQuota ? 429 : 500).json({
      error: message,
      quotaExceeded: isQuota,
      fallback: true,
    });
  }
});

app.get('/api/videos', (_req, res) => {
  res.json({ videos: getAllVideoStatuses() });
});

app.post('/api/videos/:videoId/prepare', (req, res) => {
  const videoId = req.params.videoId as VideoModule['id'];
  if (!VALID_VIDEO_IDS.has(videoId)) {
    res.status(404).json({ error: 'Video no encontrado.' });
    return;
  }

  const current = getVideoStatus(videoId);
  if (current.status === 'ready') {
    res.json(current);
    return;
  }

  // Trigger background build if not already building
  ensureVideoBuilt(videoId).catch((err) => {
    console.error('Background video build failed:', err);
  });

  res.json(getVideoStatus(videoId));
});

app.get('/api/videos/:videoId/status', (req, res) => {
  const videoId = req.params.videoId as VideoModule['id'];
  if (!VALID_VIDEO_IDS.has(videoId)) {
    res.status(404).json({ error: 'Video no encontrado.' });
    return;
  }
  res.json(getVideoStatus(videoId));
});

app.get('/api/videos/:videoId/download', async (req, res) => {
  const videoId = req.params.videoId as VideoModule['id'];
  if (!VALID_VIDEO_IDS.has(videoId)) {
    res.status(404).json({ error: 'Video no encontrado.' });
    return;
  }

  try {
    const filePath = await ensureVideoBuilt(videoId);
    const status = getVideoStatus(videoId);
    res.download(filePath, status.filename);
  } catch (err: any) {
    res.status(500).json({
      error: err?.message || 'No se pudo descargar el video MP4.',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error fatal al iniciar el servidor:', err);
  process.exit(1);
});
