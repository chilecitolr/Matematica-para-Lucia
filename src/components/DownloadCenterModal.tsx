import React, { useEffect, useRef, useState } from 'react';
import { Check, Download, Film, Loader2, X } from 'lucide-react';
import { VIDEO_MODULES } from '../data/curriculum';
import type { VideoModule } from '../types/lesson';

export interface VideoStatusItem {
  videoId: VideoModule['id'];
  filename: string;
  status: 'idle' | 'building' | 'ready' | 'error';
  progress: number;
  detail: string;
  fileSizeBytes?: number;
  error?: string;
}

interface DownloadCenterModalProps {
  open: boolean;
  initialVideoId?: VideoModule['id'] | null;
  onClose: () => void;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function triggerFileDownload(videoId: string, filename: string) {
  const link = document.createElement('a');
  link.href = `/api/videos/${videoId}/download`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const DownloadCenterModal: React.FC<DownloadCenterModalProps> = ({
  open,
  initialVideoId,
  onClose,
}) => {
  const [statuses, setStatuses] = useState<Record<string, VideoStatusItem>>({});
  const [autoStartedId, setAutoStartedId] = useState<string | null>(null);
  const [serverUnavailable, setServerUnavailable] = useState(false);

  const fetchAll = async () => {
    try {
      const res = await fetch('/api/videos');
      if (!res.ok) {
        setServerUnavailable(true);
        return;
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setServerUnavailable(true);
        return;
      }
      const data = await res.json();
      const map: Record<string, VideoStatusItem> = {};
      for (const item of data.videos || []) {
        map[item.videoId] = item;
      }
      setStatuses(map);
      setServerUnavailable(false);
    } catch {
      setServerUnavailable(true);
    }
  };

  useEffect(() => {
    if (!open) {
      setAutoStartedId(null);
      return;
    }
    fetchAll();
  }, [open]);

  // Poll whenever any video is actively building
  const anyBuilding = Object.values(statuses).some((s) => s.status === 'building');

  useEffect(() => {
    if (!open || !anyBuilding) return;
    const id = window.setInterval(() => {
      fetchAll();
    }, 1200);
    return () => window.clearInterval(id);
  }, [open, anyBuilding]);

  const handlePrepareAndDownload = async (videoId: VideoModule['id']) => {
    const current = statuses[videoId];
    if (current?.status === 'ready') {
      triggerFileDownload(videoId, current.filename);
      return;
    }

    setStatuses((prev) => ({
      ...prev,
      [videoId]: {
        ...(prev[videoId] || {
          videoId,
          filename: `${videoId}.mp4`,
          progress: 5,
          detail: 'Iniciando preparación...',
        }),
        status: 'building',
      },
    }));

    try {
      const res = await fetch(`/api/videos/${videoId}/prepare`, {
        method: 'POST',
      });
      if (res.ok) {
        const item: VideoStatusItem = await res.json();
        setStatuses((prev) => ({ ...prev, [videoId]: item }));
        if (item.status === 'ready') {
          triggerFileDownload(videoId, item.filename);
        }
      }
    } catch {
      setStatuses((prev) => ({
        ...prev,
        [videoId]: {
          ...prev[videoId],
          status: 'error',
          detail: 'Error de conexión al preparar el video.',
        },
      }));
    }
  };

  // Auto-start when opened directly for a specific video
  useEffect(() => {
    if (!open || !initialVideoId || autoStartedId === initialVideoId) return;
    if (statuses[initialVideoId]) {
      setAutoStartedId(initialVideoId);
      handlePrepareAndDownload(initialVideoId);
    }
  }, [open, initialVideoId, autoStartedId, statuses]);

  // Auto-download when a building video transitions to ready while modal is open
  const downloadedOnReadyRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!open) {
      downloadedOnReadyRef.current.clear();
      return;
    }
    for (const st of Object.values(statuses)) {
      if (
        st.status === 'ready' &&
        autoStartedId === st.videoId &&
        !downloadedOnReadyRef.current.has(st.videoId)
      ) {
        downloadedOnReadyRef.current.add(st.videoId);
        triggerFileDownload(st.videoId, st.filename);
      }
    }
  }, [open, statuses, autoStartedId]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Descargar videos educativos en MP4"
    >
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-3xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Film className="w-5 h-5 text-blue-700 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-lg font-bold text-slate-900">
                Descargar videos educativos (.MP4)
              </h2>
              <p className="text-xs text-slate-500">
                Formato MP4 HD (1280×720) con voz en español argentino y láminas paso a paso
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer shrink-0"
            aria-label="Cerrar descargas"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-3 max-h-[78vh] overflow-y-auto">
          {serverUnavailable && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-xs sm:text-sm text-amber-950 leading-relaxed">
              <strong>Modo web sin servidor de exportación:</strong> en esta página podés ver todas las clases animadas, usar el resaltado de colores y escuchar la narración directamente desde tu celular o PC. Para generar y bajar archivos MP4 sin conexión, abrí la app con el servidor activo.
            </div>
          )}

          {VIDEO_MODULES.map((mod) => {
            const st = statuses[mod.id];
            const isBuilding = st?.status === 'building';
            const isReady = st?.status === 'ready';
            const isError = st?.status === 'error';

            return (
              <div
                key={mod.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="font-display font-bold text-slate-900">
                    {mod.shortLabel}: {mod.title}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600">
                    Capítulos {mod.chapterNumbers.join(', ')} · {mod.subtitle}
                  </div>

                  {isBuilding && (
                    <div className="pt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-blue-800 font-medium">
                        <span>{st.detail}</span>
                        <span className="font-math">{st.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-blue-700 transition-all duration-300"
                          style={{ width: `${st.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {isReady && (
                    <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 pt-1">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>
                        Archivo listo ({formatBytes(st.fileSizeBytes)}) · {st.filename}
                      </span>
                    </div>
                  )}

                  {isError && (
                    <div className="text-xs text-red-700 font-medium pt-1">
                      {st.error || st.detail}
                    </div>
                  )}
                </div>

                <div className="shrink-0 w-full md:w-auto">
                  {isReady ? (
                    <a
                      href={`/api/videos/${mod.id}/download`}
                      download={st.filename}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar MP4</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled={isBuilding || serverUnavailable}
                      onClick={() => {
                        setAutoStartedId(mod.id);
                        handlePrepareAndDownload(mod.id);
                      }}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {isBuilding ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Preparando...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Generar y bajar MP4</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
