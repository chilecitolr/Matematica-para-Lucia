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
import type { SpotlightTarget } from './utils/spotlightCues';

interface FlatSceneItem {
  chapter: Chapter;
  scene: LessonScene;
  globalIndex: number;
}

const VIDEO_THEMES: Record<
  VideoModule['id'],
  {
    inactive: string;
    active: string;
    dot: string;
  }
> = {
  'video-1': {
    inactive: 'bg-blue-50/80 text-blue-900 border-blue-200 hover:bg-blue-100',
    active: 'bg-blue-700 text-white border-blue-700 shadow-sm',
    dot: 'bg-blue-600',
  },
  'video-2': {
    inactive: 'bg-orange-50/80 text-orange-900 border-orange-200 hover:bg-orange-100',
    active: 'bg-orange-700 text-white border-orange-700 shadow-sm',
    dot: 'bg-orange-600',
  },
  'video-3': {
    inactive: 'bg-emerald-50/80 text-emerald-900 border-emerald-200 hover:bg-emerald-100',
    active: 'bg-emerald-700 text-white border-emerald-700 shadow-sm',
    dot: 'bg-emerald-600',
  },
  'video-4': {
    inactive: 'bg-indigo-50/80 text-indigo-900 border-indigo-200 hover:bg-indigo-100',
    active: 'bg-indigo-700 text-white border-indigo-700 shadow-sm',
    dot: 'bg-indigo-600',
  },
};

const CHAPTER_PALETTE = [
  {
    card: 'bg-blue-50/45 border-blue-200',
    kicker: 'text-blue-700',
    title: 'text-blue-950',
    btnInactive: 'bg-white/90 text-slate-700 border-blue-100 hover:bg-blue-50 hover:border-blue-300',
    btnActive: 'bg-blue-700 text-white border-blue-700 font-semibold shadow-sm',
    practiceInactive: 'text-amber-700',
    practiceActive: 'text-blue-100',
  },
  {
    card: 'bg-orange-50/45 border-orange-200',
    kicker: 'text-orange-700',
    title: 'text-orange-950',
    btnInactive: 'bg-white/90 text-slate-700 border-orange-100 hover:bg-orange-50 hover:border-orange-300',
    btnActive: 'bg-orange-700 text-white border-orange-700 font-semibold shadow-sm',
    practiceInactive: 'text-amber-800',
    practiceActive: 'text-orange-100',
  },
  {
    card: 'bg-emerald-50/45 border-emerald-200',
    kicker: 'text-emerald-700',
    title: 'text-emerald-950',
    btnInactive: 'bg-white/90 text-slate-700 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-300',
    btnActive: 'bg-emerald-700 text-white border-emerald-700 font-semibold shadow-sm',
    practiceInactive: 'text-amber-700',
    practiceActive: 'text-emerald-100',
  },
  {
    card: 'bg-indigo-50/45 border-indigo-200',
    kicker: 'text-indigo-700',
    title: 'text-indigo-950',
    btnInactive: 'bg-white/90 text-slate-700 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-300',
    btnActive: 'bg-indigo-700 text-white border-indigo-700 font-semibold shadow-sm',
    practiceInactive: 'text-amber-700',
    practiceActive: 'text-indigo-100',
  },
];

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
  const [manualSpotlight, setManualSpotlight] = useState<SpotlightTarget>('none');

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
  const nextItem = flatScenes[sceneIndex + 1];
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

  const {
    isLoadingAudio,
    isSpeaking,
    voiceEngine,
    progress,
    ttsQuotaExceeded,
    ttsNotice,
    unlockAudio,
  } = useNarrator({
    text: currentItem?.scene.narration || '',
    nextText: nextItem?.scene.narration || '',
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
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              handleSelectVideo('video-1');
            }}
            className="font-display text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Matemática Paso a Paso
          </a>

          {/* Zone 2: 4 concise single-line color-coded nav buttons */}
          <nav
            aria-label="Videos de la serie"
            className="hidden lg:flex items-center gap-2 text-sm font-medium"
          >
            {VIDEO_MODULES.map((vid) => {
              const active = vid.id === activeVideoId;
              const theme = VIDEO_THEMES[vid.id];
              return (
                <button
                  key={vid.id}
                  type="button"
                  onClick={() => handleSelectVideo(vid.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active ? `${theme.active} font-semibold` : theme.inactive
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-sm shrink-0 ${
                      active ? 'bg-white' : theme.dot
                    }`}
                  />
                  <span>{vid.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setDownloadTargetVideoId(null);
                setDownloadModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 min-h-[40px] rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span className="sm:hidden">Bajar MP4</span>
              <span className="hidden sm:inline">Descargar videos MP4</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main id="inicio" className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
        {/* Compact Video Selector for mobile/tablet viewports */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap lg:hidden items-center gap-2">
          {VIDEO_MODULES.map((vid) => {
            const active = vid.id === activeVideoId;
            const theme = VIDEO_THEMES[vid.id];
            return (
              <button
                key={vid.id}
                type="button"
                onClick={() => handleSelectVideo(vid.id)}
                className={`inline-flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap border cursor-pointer text-center transition-colors ${
                  active ? `${theme.active} font-semibold` : theme.inactive
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-sm shrink-0 ${
                    active ? 'bg-white' : theme.dot
                  }`}
                />
                <span>{vid.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Cartel de dedicatoria para Lucía */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
          <p className="font-display text-base sm:text-lg md:text-xl font-bold text-slate-900">
            Este material está adaptado para Lucía.
          </p>
          <p className="font-display text-sm sm:text-base md:text-lg font-semibold bg-[#ed127f] text-[#f7f7f8]">
            Con amor, su papá!!
          </p>
        </div>

        {/* Series Heading & Quiet Metadata (Zero Pills) */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm text-slate-500">
              <span>Trabajo Práctico Integrador Final</span>
              <span aria-hidden="true">·</span>
              <span>{totalChaptersCount} capítulos en 4 videos cortos</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
              {activeVideo.shortLabel}: {activeVideo.title}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base">
              {activeVideo.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setDownloadTargetVideoId(activeVideoId);
                setDownloadModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 min-h-[44px] rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer flex-1 sm:flex-initial"
            >
              <Download className="w-4 h-4" />
              <span>Bajar este video (MP4)</span>
            </button>
            <button
              type="button"
              onClick={handleJumpToSummary}
              className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 min-h-[44px] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Award className="w-4 h-4 text-emerald-700" />
              <span>Logros finales</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPdfModal(true)}
              className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 min-h-[44px] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
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
                narrationProgress={progress}
                manualSpotlight={manualSpotlight}
                showSubtitles={showSubtitles}
              />
            )}

            {/* Video Transport & Accessibility Controls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 space-y-4">
              {/* Interactive Scene Progress Scrubber */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="border-[#faf406] bg-[#f6f607] text-[14px] font-bold">
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
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 sm:grid" style={{ gridTemplateColumns: `repeat(${flatScenes.length}, minmax(0, 1fr))` }}>
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
                        className={`h-8 min-w-[32px] sm:min-w-0 sm:h-3 rounded-lg sm:rounded-full transition-colors cursor-pointer shrink-0 flex items-center justify-center text-xs sm:text-[0px] font-math font-semibold ${
                          isCurrent
                            ? 'bg-blue-700 text-white'
                            : isDone
                              ? 'bg-blue-200 sm:bg-blue-300 text-blue-900 hover:bg-blue-400'
                              : 'bg-slate-100 sm:bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        <span className="sm:hidden">{idx + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Playback Controls */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3 sm:gap-4">
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isPlaying) unlockAudio();
                      setIsPlaying((p) => !p);
                    }}
                    className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-sm font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextScene}
                    disabled={sceneIndex >= flatScenes.length - 1}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-sm font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer sm:order-4"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      unlockAudio();
                      handleRepeatScene();
                    }}
                    className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer sm:order-3"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Volver a mirar</span>
                  </button>
                </div>

                {/* Audio, Subtitles & Calm Speed Controls */}
                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMuted((m) => !m)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
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
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg border text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                      showSubtitles
                        ? 'border-blue-200 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <Captions className="w-4 h-4" />
                    <span>Subtítulos</span>
                  </button>

                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg min-h-[44px]">
                    {([0.75, 0.9, 1] as const).map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setPlaybackRate(rate)}
                        className={`px-2.5 py-1.5 min-h-[36px] text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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

              {ttsQuotaExceeded && ttsNotice && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-950 leading-relaxed">
                  <strong>Aviso de voz:</strong> {ttsNotice}
                </div>
              )}
            </div>
          </section>

          {/* RIGHT ZONE: Constant Color Legend & Chapter / Scene Index */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Interactive Constant Visual Color Legend */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  Código de colores en toda la serie
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tocá o pasá el mouse para agrandar cada parte en pantalla
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-sm">
                {(
                  [
                    {
                      target: 'num' as const,
                      label: 'Números',
                      box: 'bg-blue-50/70 border-blue-200 hover:border-blue-400',
                      activeRing: 'ring-2 ring-blue-500 bg-blue-100',
                      dot: 'bg-blue-700',
                    },
                    {
                      target: 'var' as const,
                      label: 'Letras',
                      box: 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400',
                      activeRing: 'ring-2 ring-emerald-500 bg-emerald-100',
                      dot: 'bg-emerald-700',
                    },
                    {
                      target: 'exp' as const,
                      label: 'Exponentes',
                      box: 'bg-orange-50/70 border-orange-200 hover:border-orange-400',
                      activeRing: 'ring-2 ring-orange-500 bg-orange-100',
                      dot: 'bg-orange-600',
                    },
                    {
                      target: 'neg' as const,
                      label: 'Signos (−)',
                      box: 'bg-red-50/70 border-red-200 hover:border-red-400',
                      activeRing: 'ring-2 ring-red-500 bg-red-100',
                      dot: 'bg-red-600',
                    },
                  ] as const
                ).map((item) => {
                  const isActive = manualSpotlight === item.target;
                  return (
                    <button
                      key={item.target}
                      type="button"
                      onPointerEnter={(e) => {
                        if (e.pointerType === 'mouse') setManualSpotlight(item.target);
                      }}
                      onPointerLeave={(e) => {
                        if (e.pointerType === 'mouse') setManualSpotlight('none');
                      }}
                      onClick={() =>
                        setManualSpotlight((prev) =>
                          prev === item.target ? 'none' : item.target
                        )
                      }
                      className={`flex items-center gap-2.5 p-3 min-h-[44px] rounded-xl border text-left transition-colors cursor-pointer ${
                        isActive ? item.activeRing : item.box
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-sm shrink-0 ${item.dot}`} />
                      <span className="text-slate-800 font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chapter & Scene Selector */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-slate-900">
                  Capítulos de este video
                </h2>
                <BookOpen className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-3.5">
                {videoChapters.map((chapter, chIdx) => {
                  const chapterScenes = flatScenes.filter(
                    (f) => f.chapter.id === chapter.id
                  );
                  const pal = CHAPTER_PALETTE[chIdx % CHAPTER_PALETTE.length];
                  return (
                    <div
                      key={chapter.id}
                      className={`space-y-2.5 p-3.5 rounded-xl border ${pal.card}`}
                    >
                      <div>
                        <div className={`text-xs font-semibold ${pal.kicker}`}>
                          Capítulo {chapter.number} · {chapter.activityRef}
                        </div>
                        <div className={`font-display font-bold text-sm ${pal.title}`}>
                          {chapter.title}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {chapterScenes.map((item) => {
                          const active = item.globalIndex === sceneIndex;
                          const isPractice = item.scene.phase === 'practica';
                          return (
                            <button
                              key={item.scene.id}
                              type="button"
                              onClick={() => setSceneIndex(item.globalIndex)}
                              className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-lg border text-xs sm:text-sm transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                active ? pal.btnActive : pal.btnInactive
                              }`}
                            >
                              <span className="leading-snug">{item.scene.headline}</span>
                              {isPractice && (
                                <span
                                  className={`text-[11px] font-semibold shrink-0 ${
                                    active ? pal.practiceActive : pal.practiceInactive
                                  }`}
                                >
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
              <div className="font-display text-sm font-semibold bg-[#f50d88] text-[#f4f5f6]">
                Con amor, su papá!!
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* In-App Modal for Viewing Original PDF without window.open */}
      {showPdfModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-6 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Trabajo Práctico Integrador Final en PDF"
        >
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200">
              <div className="font-display text-sm sm:text-base font-bold text-slate-900">
                Trabajo Práctico Integrador Final – Matemática 3.er año
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`${import.meta.env.BASE_URL}assets/aistudio/Trabajo_Practico_Integrador_Matematica_3er_ano_monomios_corregidos_2fb32742.pdf`}
                  download="Trabajo_Practico_Integrador_Matematica_3er_ano.pdf"
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowPdfModal(false)}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                  aria-label="Cerrar documento"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <iframe
              src={`${import.meta.env.BASE_URL}assets/aistudio/Trabajo_Practico_Integrador_Matematica_3er_ano_monomios_corregidos_2fb32742.pdf`}
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
