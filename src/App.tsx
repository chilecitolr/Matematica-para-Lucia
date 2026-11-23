import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  Captions,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { ALL_CHAPTERS, VIDEO_MODULES, getChaptersForVideo } from './data/curriculum';
import type { Chapter, LessonScene, VideoModule } from './types/lesson';
import { VideoStage } from './components/VideoStage';
import { useNarrator } from './hooks/useNarrator';
import { DownloadCenterModal } from './components/DownloadCenterModal';

interface FlatSceneItem {
  chapter: Chapter;
  scene: LessonScene;
  globalIndex: number;
}

export default function App() {
  const [activeVideoId, setActiveVideoId] = useState<VideoModule['id']>('video-1');
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<0.75 | 0.9 | 1>(0.9);
  const [replayNonce, setReplayNonce] = useState(0);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadTargetVideoId, setDownloadTargetVideoId] = useState<VideoModule['id'] | null>(null);

  const activeVideo = useMemo(
    () => VIDEO_MODULES.find((v) => v.id === activeVideoId) || VIDEO_MODULES[0],
    [activeVideoId]
  );

  const videoChapters = useMemo(
    () => getChaptersForVideo(activeVideoId),
    [activeVideoId]
  );

  const flatScenes = useMemo<FlatSceneItem[]>(() => {
    const items: FlatSceneItem[] = [];
    let idx = 0;
    for (const chapter of videoChapters) {
      for (const scene of chapter.scenes) {
        items.push({ chapter, scene, globalIndex: idx });
        idx++;
      }
    }
    return items;
  }, [videoChapters]);

  const currentItem = flatScenes[sceneIndex] || flatScenes[0];
  const isPracticeScene = currentItem?.scene.phase === 'practica';

  const handleSelectVideo = (videoId: VideoModule['id']) => {
    setIsPlaying(false);
    setActiveVideoId(videoId);
    setSceneIndex(0);
  };

  const handleNextScene = useCallback(() => {
    setSceneIndex((prev) => {
      if (prev + 1 < flatScenes.length) {
        return prev + 1;
      }
      setIsPlaying(false);
      return prev;
    });
  }, [flatScenes.length]);

  const handlePrevScene = () => {
    setSceneIndex((prev) => Math.max(0, prev - 1));
  };

  const handleRepeatScene = () => {
    setReplayNonce((n) => n + 1);
    setIsPlaying(true);
  };

  const handleJumpToSummary = () => {
    setIsPlaying(false);
    setActiveVideoId('video-4');
    const v4Chapters = getChaptersForVideo('video-4');
    let total = 0;
    for (const ch of v4Chapters) {
      total += ch.scenes.length;
    }
    setSceneIndex(Math.max(0, total - 1));
  };

  // Pause automatically when arriving at a "practice" ("AHORA TE TOCA A VOS") scene after narration finishes
  const handleNarrationComplete = useCallback(() => {
    if (isPracticeScene) {
      setIsPlaying(false);
      return;
    }
    handleNextScene();
  }, [isPracticeScene, handleNextScene]);

  const { isLoadingAudio, isSpeaking, voiceEngine } = useNarrator({
    text: currentItem?.scene.narration || '',
    sceneId: `${currentItem?.scene.id || 'none'}-${replayNonce}`,
    isPlaying,
    muted,
    playbackRate,
    fallbackDurationMs: (currentItem?.scene.durationSeconds || 12) * 1000,
    autoAdvance: !isPracticeScene,
    onSceneComplete: handleNarrationComplete,
  });

  // Reset scene index if out of bounds after video switch
  useEffect(() => {
    if (sceneIndex >= flatScenes.length) {
      setSceneIndex(0);
    }
  }, [flatScenes.length, sceneIndex]);

  const totalChaptersCount = ALL_CHAPTERS.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-6 py-3.5 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              handleSelectVideo('video-1');
            }}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Matemática Paso a Paso
          </a>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav
            aria-label="Videos de la serie"
            className="hidden lg:flex items-center gap-6 text-sm font-medium"
          >
            {VIDEO_MODULES.map((vid) => {
              const active = vid.id === activeVideoId;
              return (
                <button
                  key={vid.id}
                  type="button"
                  onClick={() => handleSelectVideo(vid.id)}
                  className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-blue-700 text-blue-700 font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {vid.shortLabel}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setDownloadTargetVideoId(null);
                setDownloadModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar videos MP4</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main id="inicio" className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6 md:py-8 space-y-6">
        {/* Compact Video Selector for mobile/tablet viewports */}
        <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-1">
          {VIDEO_MODULES.map((vid) => {
            const active = vid.id === activeVideoId;
            return (
              <button
                key={vid.id}
                type="button"
                onClick={() => handleSelectVideo(vid.id)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 border cursor-pointer ${
                  active
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                {vid.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Cartel de dedicatoria para Lucía */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="font-display text-lg md:text-xl font-bold text-slate-900">
            Este material está adaptado para Lucía.
          </p>
          <p className="font-display text-base md:text-lg font-semibold text-blue-800">
            Con amor, su papá!!
          </p>
        </div>

        {/* Series Heading & Quiet Metadata (Zero Pills) */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-slate-500">
              <span>Escuela Privada Gabriela Mistral</span>
              <span aria-hidden="true">·</span>
              <span>3.er año · Trabajo Práctico Integrador Final</span>
              <span aria-hidden="true">·</span>
              <span>{totalChaptersCount} capítulos en 4 videos cortos</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900">
              {activeVideo.shortLabel}: {activeVideo.title}
            </h1>
            <p className="text-slate-600 text-sm md:text-base">
              {activeVideo.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setDownloadTargetVideoId(activeVideoId);
                setDownloadModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Bajar este video (MP4)</span>
            </button>
            <button
              type="button"
              onClick={handleJumpToSummary}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Award className="w-4 h-4 text-emerald-700" />
              <span>Logros finales</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPdfModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Ver TP original (PDF)</span>
            </button>
          </div>
        </div>

        {/* Two-Zone Sandbox Layout: Video Player Left (68%) + Chapter Navigator Right (32%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT ZONE: Animated Video Player & Controls */}
          <section className="lg:col-span-8 space-y-4" aria-label="Reproductor de video educativo">
            {currentItem && (
              <VideoStage
                scene={currentItem.scene}
                chapterTitle={currentItem.chapter.title}
                chapterNumber={currentItem.chapter.number}
                activityRef={currentItem.chapter.activityRef}
                isPlaying={isPlaying}
                showSubtitles={showSubtitles}
              />
            )}

            {/* Video Transport & Accessibility Controls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 space-y-4">
              {/* Interactive Scene Progress Scrubber */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Escena {sceneIndex + 1} de {flatScenes.length}
                  </span>
                  <span>
                    {isLoadingAudio
                      ? 'Preparando voz tranquila...'
                      : isSpeaking
                        ? voiceEngine === 'gemini'
                          ? 'Narrando con voz cálida'
                          : 'Narrando con voz del navegador'
                        : isPlaying
                          ? 'En reproducción'
                          : 'En pausa para observar'}
                  </span>
                </div>
                <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${flatScenes.length}, minmax(0, 1fr))` }}>
                  {flatScenes.map((item, idx) => {
                    const isDone = idx < sceneIndex;
                    const isCurrent = idx === sceneIndex;
                    return (
                      <button
                        key={item.scene.id}
                        type="button"
                        onClick={() => setSceneIndex(idx)}
                        title={`Ir a: ${item.scene.headline}`}
                        aria-label={`Escena ${idx + 1}: ${item.scene.headline}`}
                        className={`h-2.5 rounded-full transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-blue-700'
                            : isDone
                              ? 'bg-blue-300 hover:bg-blue-400'
                              : 'bg-slate-200 hover:bg-slate-300'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Primary Playback Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Reproducir</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrevScene}
                    disabled={sceneIndex === 0}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-sm font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRepeatScene}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Volver a mirar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextScene}
                    disabled={sceneIndex >= flatScenes.length - 1}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-sm font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Audio, Subtitles & Calm Speed Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMuted((m) => !m)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
                    aria-pressed={!muted}
                  >
                    {muted ? (
                      <>
                        <VolumeX className="w-4 h-4 text-red-600" />
                        <span>Sin voz</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-blue-700" />
                        <span>Con voz</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSubtitles((s) => !s)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                      showSubtitles
                        ? 'border-blue-200 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <Captions className="w-4 h-4" />
                    <span>Subtítulos</span>
                  </button>

                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    {([0.75, 0.9, 1] as const).map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setPlaybackRate(rate)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          playbackRate === rate
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT ZONE: Constant Color Legend & Chapter / Scene Index */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Constant Visual Color Legend */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h2 className="font-display text-base font-bold text-slate-900">
                Código de colores en toda la serie
              </h2>
              <div className="grid grid-cols-2 gap-2.5 text-sm">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
                  <span className="w-3.5 h-3.5 rounded-sm bg-blue-700 shrink-0" />
                  <span className="text-slate-800 font-medium">Números</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="w-3.5 h-3.5 rounded-sm bg-emerald-700 shrink-0" />
                  <span className="text-slate-800 font-medium">Letras</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-orange-50/70 border border-orange-200">
                  <span className="w-3.5 h-3.5 rounded-sm bg-orange-600 shrink-0" />
                  <span className="text-slate-800 font-medium">Exponentes</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-red-50/70 border border-red-200">
                  <span className="w-3.5 h-3.5 rounded-sm bg-red-600 shrink-0" />
                  <span className="text-slate-800 font-medium">Signos (−)</span>
                </div>
              </div>
            </div>

            {/* Chapter & Scene Selector */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-slate-900">
                  Capítulos de este video
                </h2>
                <BookOpen className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-4">
                {videoChapters.map((chapter) => {
                  const chapterScenes = flatScenes.filter(
                    (f) => f.chapter.id === chapter.id
                  );
                  return (
                    <div key={chapter.id} className="space-y-2 pb-3 border-b border-slate-100 last:border-b-0 last:pb-0">
                      <div>
                        <div className="text-xs font-medium text-slate-500">
                          Capítulo {chapter.number} · {chapter.activityRef}
                        </div>
                        <div className="font-semibold text-sm text-slate-900">
                          {chapter.title}
                        </div>
                      </div>

                      <div className="space-y-1">
                        {chapterScenes.map((item) => {
                          const active = item.globalIndex === sceneIndex;
                          const isPractice = item.scene.phase === 'practica';
                          return (
                            <button
                              key={item.scene.id}
                              type="button"
                              onClick={() => setSceneIndex(item.globalIndex)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs md:text-sm transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                active
                                  ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200'
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                              }`}
                            >
                              <span className="truncate">{item.scene.headline}</span>
                              {isPractice && (
                                <span className="text-[11px] font-semibold text-amber-700 shrink-0">
                                  Práctica
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dedication Cartel for Lucía */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 text-center space-y-1">
              <div className="font-display text-base font-bold text-slate-900">
                Este material está adaptado para Lucía.
              </div>
              <div className="font-display text-sm font-semibold text-blue-800">
                Con amor, su papá!!
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* In-App Modal for Viewing Original PDF without window.open */}
      {showPdfModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Trabajo Práctico Integrador Final en PDF"
        >
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="font-display font-bold text-slate-900">
                Trabajo Práctico Integrador Final – Matemática 3.er año
              </div>
              <button
                type="button"
                onClick={() => setShowPdfModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                aria-label="Cerrar documento"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe
              src="/assets/aistudio/Trabajo_Practico_Integrador_Matematica_3er_ano_monomios_corregidos_2fb32742.pdf"
              title="PDF del Trabajo Práctico Integrador Final"
              className="flex-1 w-full bg-slate-100"
            />
          </div>
        </div>
      )}

      <DownloadCenterModal
        open={downloadModalOpen}
        initialVideoId={downloadTargetVideoId}
        onClose={() => setDownloadModalOpen(false)}
      />
    </div>
  );
}
