import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  BookOpen,
  Captions,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  FileText,
  Grid3X3,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  ALL_CHAPTERS,
  ALL_ENGLISH_CHAPTERS,
  getChaptersForVideo,
  getVideosForSubject,
} from './data/curriculum';
import type { Chapter, LessonScene, SubjectId, VideoId } from './types/lesson';
import { VideoStage } from './components/VideoStage';
import { playChapterCelebrationChime, useNarrator } from './hooks/useNarrator';
import { DownloadCenterModal } from './components/DownloadCenterModal';
import { FloatingNotepad } from './components/FloatingNotepad';
import { FreePracticeModal } from './components/FreePracticeModal';
import { MultiplicationCheatModal } from './components/MultiplicationCheatModal';
import { QuickCheckCard } from './components/QuickCheckCard';
import {
  ChapterCelebrationConfetti,
  type ChapterCelebrationEvent,
} from './components/ChapterCelebrationConfetti';
import type { SpotlightTarget } from './utils/spotlightCues';

const COMPLETED_SCENES_KEY = 'lucia_completed_scenes_v1';

function loadCompletedScenes(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(COMPLETED_SCENES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

interface FlatSceneItem {
  chapter: Chapter;
  scene: LessonScene;
  globalIndex: number;
}

const VIDEO_THEMES: Record<
  VideoId,
  {
    inactive: string;
    active: string;
    dot: string;
  }
> = {
  'video-1': {
    inactive: 'bg-blue-200 text-blue-950 border-2 border-blue-500 hover:bg-blue-300 font-semibold',
    active: 'bg-blue-700 text-white border-2 border-blue-950 ring-2 ring-blue-300 shadow-md font-bold',
    dot: 'bg-blue-700',
  },
  'video-2': {
    inactive: 'bg-orange-200 text-orange-950 border-2 border-orange-500 hover:bg-orange-300 font-semibold',
    active: 'bg-orange-600 text-white border-2 border-orange-950 ring-2 ring-orange-300 shadow-md font-bold',
    dot: 'bg-orange-600',
  },
  'video-3': {
    inactive: 'bg-emerald-200 text-emerald-950 border-2 border-emerald-500 hover:bg-emerald-300 font-semibold',
    active: 'bg-emerald-700 text-white border-2 border-emerald-950 ring-2 ring-emerald-300 shadow-md font-bold',
    dot: 'bg-emerald-700',
  },
  'video-4': {
    inactive: 'bg-indigo-200 text-indigo-950 border-2 border-indigo-500 hover:bg-indigo-300 font-semibold',
    active: 'bg-indigo-700 text-white border-2 border-indigo-950 ring-2 ring-indigo-300 shadow-md font-bold',
    dot: 'bg-indigo-700',
  },
  'english-1': {
    inactive: 'bg-emerald-200 text-emerald-950 border-2 border-emerald-500 hover:bg-emerald-300 font-semibold',
    active: 'bg-emerald-700 text-white border-2 border-emerald-950 ring-2 ring-emerald-300 shadow-md font-bold',
    dot: 'bg-emerald-700',
  },
  'english-2': {
    inactive: 'bg-sky-200 text-sky-950 border-2 border-sky-500 hover:bg-sky-300 font-semibold',
    active: 'bg-sky-700 text-white border-2 border-sky-950 ring-2 ring-sky-300 shadow-md font-bold',
    dot: 'bg-sky-700',
  },
  'english-3': {
    inactive: 'bg-amber-200 text-amber-950 border-2 border-amber-500 hover:bg-amber-300 font-semibold',
    active: 'bg-amber-600 text-white border-2 border-amber-950 ring-2 ring-amber-300 shadow-md font-bold',
    dot: 'bg-amber-600',
  },
  'english-4': {
    inactive: 'bg-violet-200 text-violet-950 border-2 border-violet-500 hover:bg-violet-300 font-semibold',
    active: 'bg-violet-700 text-white border-2 border-violet-950 ring-2 ring-violet-300 shadow-md font-bold',
    dot: 'bg-violet-700',
  },
};

const CHAPTER_PALETTE = [
  {
    card: 'bg-blue-100/80 border-2 border-blue-400',
    kicker: 'text-blue-800',
    title: 'text-blue-950',
    btnInactive: 'bg-blue-200/85 text-blue-950 border-2 border-blue-400 hover:bg-blue-300 font-medium',
    btnActive: 'bg-blue-700 text-white border-2 border-blue-950 ring-2 ring-blue-300 font-bold shadow-md',
    practiceInactive: 'text-amber-800',
    practiceActive: 'text-blue-100',
    ringStroke: '#1D4ED8',
    ringTrack: '#BFDBFE',
  },
  {
    card: 'bg-orange-100/80 border-2 border-orange-400',
    kicker: 'text-orange-800',
    title: 'text-orange-950',
    btnInactive: 'bg-orange-200/85 text-orange-950 border-2 border-orange-400 hover:bg-orange-300 font-medium',
    btnActive: 'bg-orange-600 text-white border-2 border-orange-950 ring-2 ring-orange-300 font-bold shadow-md',
    practiceInactive: 'text-amber-900',
    practiceActive: 'text-orange-100',
    ringStroke: '#EA580C',
    ringTrack: '#FED7AA',
  },
  {
    card: 'bg-emerald-100/80 border-2 border-emerald-400',
    kicker: 'text-emerald-800',
    title: 'text-emerald-950',
    btnInactive: 'bg-emerald-200/85 text-emerald-950 border-2 border-emerald-400 hover:bg-emerald-300 font-medium',
    btnActive: 'bg-emerald-700 text-white border-2 border-emerald-950 ring-2 ring-emerald-300 font-bold shadow-md',
    practiceInactive: 'text-amber-800',
    practiceActive: 'text-emerald-100',
    ringStroke: '#059669',
    ringTrack: '#A7F3D0',
  },
  {
    card: 'bg-indigo-100/80 border-2 border-indigo-400',
    kicker: 'text-indigo-800',
    title: 'text-indigo-950',
    btnInactive: 'bg-indigo-200/85 text-indigo-950 border-2 border-indigo-400 hover:bg-indigo-300 font-medium',
    btnActive: 'bg-indigo-700 text-white border-2 border-indigo-950 ring-2 ring-indigo-300 font-bold shadow-md',
    practiceInactive: 'text-amber-800',
    practiceActive: 'text-indigo-100',
    ringStroke: '#4338CA',
    ringTrack: '#C7D2FE',
  },
];

const ChapterProgressRing: React.FC<{
  completed: number;
  total: number;
  strokeColor: string;
  trackColor: string;
}> = ({ completed, total, strokeColor, trackColor }) => {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const size = 46;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;
  const activeStroke = percent === 100 ? '#059669' : strokeColor;

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      title={`${completed} de ${total} escenas completadas (${percent}%)`}
      aria-label={`Avance del capítulo: ${percent}% (${completed} de ${total} escenas)`}
    >
      <svg width={size} height={size} className="-rotate-90" role="img" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="#FFFFFF"
          fillOpacity={0.85}
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={activeStroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-500"
        />
      </svg>
      <span
        className={`absolute font-math text-[11px] font-bold leading-none ${
          percent === 100 ? 'text-emerald-700' : 'text-slate-900'
        }`}
      >
        {percent}%
      </span>
    </div>
  );
};

export default function App() {
  const [subject, setSubject] = useState<SubjectId>('matematica');
  const [activeVideoId, setActiveVideoId] = useState<VideoId>('video-1');
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<0.75 | 0.9 | 1>(0.9);
  const [replayNonce, setReplayNonce] = useState(0);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showEnglishGuideModal, setShowEnglishGuideModal] = useState(false);
  const [showTablesModal, setShowTablesModal] = useState(false);
  const [showFreePracticeModal, setShowFreePracticeModal] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadTargetVideoId, setDownloadTargetVideoId] = useState<VideoId | null>(null);
  const [manualSpotlight, setManualSpotlight] = useState<SpotlightTarget>('none');
  const [completedSceneIds, setCompletedSceneIds] = useState<string[]>(() =>
    loadCompletedScenes()
  );
  const [celebrationEvent, setCelebrationEvent] = useState<ChapterCelebrationEvent | null>(null);
  const [justCelebratedChapterId, setJustCelebratedChapterId] = useState<string | null>(null);
  const prevCompletedChaptersRef = useRef<Set<string> | null>(null);
  const celebrationNonceRef = useRef(0);

  const dismissCelebration = useCallback(() => {
    setCelebrationEvent(null);
  }, []);

  const markSceneCompleted = useCallback((sceneId?: string) => {
    if (!sceneId) return;
    setCompletedSceneIds((prev) => {
      if (prev.includes(sceneId)) return prev;
      const next = [...prev, sceneId];
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(COMPLETED_SCENES_KEY, JSON.stringify(next));
        } catch {
          // Ignore storage quota errors
        }
      }
      return next;
    });
  }, []);

  // Trigger confetti celebration whenever any chapter reaches 100% completion
  useEffect(() => {
    const doneSet = new Set(completedSceneIds);
    const allChapters = [...ALL_CHAPTERS, ...ALL_ENGLISH_CHAPTERS];
    const completedNow = allChapters.filter(
      (ch) => ch.scenes.length > 0 && ch.scenes.every((s) => doneSet.has(s.id))
    );
    const nowSet = new Set(completedNow.map((ch) => ch.id));

    if (prevCompletedChaptersRef.current === null) {
      prevCompletedChaptersRef.current = nowSet;
      return;
    }

    const newlyCompleted = completedNow.filter(
      (ch) => !prevCompletedChaptersRef.current!.has(ch.id)
    );
    prevCompletedChaptersRef.current = nowSet;

    if (newlyCompleted.length > 0) {
      const target =
        newlyCompleted.find((ch) => ch.videoGroupId === activeVideoId) ??
        newlyCompleted[newlyCompleted.length - 1];
      const nextSubject: SubjectId = target.videoGroupId.startsWith('english-')
        ? 'ingles'
        : 'matematica';
      celebrationNonceRef.current += 1;
      setCelebrationEvent({
        nonce: celebrationNonceRef.current,
        chapterId: target.id,
        chapterNumber: target.number,
        chapterTitle: target.title,
        subject: nextSubject,
      });
      setJustCelebratedChapterId(target.id);
      if (!muted) {
        playChapterCelebrationChime();
      }
    }
  }, [completedSceneIds, activeVideoId, muted]);

  useEffect(() => {
    if (!justCelebratedChapterId) return;
    const timer = window.setTimeout(() => {
      setJustCelebratedChapterId(null);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [justCelebratedChapterId]);

  const subjectVideos = useMemo(
    () => getVideosForSubject(subject),
    [subject]
  );

  const activeVideo = useMemo(
    () => subjectVideos.find((v) => v.id === activeVideoId) || subjectVideos[0],
    [subjectVideos, activeVideoId]
  );

  const videoChapters = useMemo(
    () => getChaptersForVideo(activeVideo.id),
    [activeVideo.id]
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

  const handleSelectSubject = (nextSubject: SubjectId) => {
    setIsPlaying(false);
    setManualSpotlight('none');
    setSubject(nextSubject);
    setActiveVideoId(nextSubject === 'ingles' ? 'english-1' : 'video-1');
    setSceneIndex(0);
  };

  const handleSelectVideo = (videoId: VideoId) => {
    setIsPlaying(false);
    setActiveVideoId(videoId);
    setSceneIndex(0);
  };

  const handleNextScene = useCallback(() => {
    if (currentItem?.scene.id && currentItem.scene.phase !== 'practica') {
      markSceneCompleted(currentItem.scene.id);
    }
    setSceneIndex((prev) => {
      if (prev + 1 < flatScenes.length) {
        return prev + 1;
      }
      setIsPlaying(false);
      return prev;
    });
  }, [flatScenes.length, currentItem, markSceneCompleted]);

  const handlePrevScene = () => {
    setSceneIndex((prev) => Math.max(0, prev - 1));
  };

  const handleRepeatScene = () => {
    setReplayNonce((n) => n + 1);
    setIsPlaying(true);
  };

  const handleJumpToSummary = () => {
    setIsPlaying(false);
    const targetId: VideoId = subject === 'ingles' ? 'english-4' : 'video-4';
    setActiveVideoId(targetId);
    const chapters = getChaptersForVideo(targetId);
    let total = 0;
    for (const ch of chapters) {
      total += ch.scenes.length;
    }
    setSceneIndex(Math.max(0, total - 1));
  };

  // Pause automatically when arriving at a "practice" ("AHORA TE TOCA A VOS") scene after narration finishes
  const handleNarrationComplete = useCallback(() => {
    if (currentItem?.scene.id && !isPracticeScene) {
      markSceneCompleted(currentItem.scene.id);
    }
    if (isPracticeScene) {
      setIsPlaying(false);
      return;
    }
    handleNextScene();
  }, [isPracticeScene, handleNextScene, currentItem, markSceneCompleted]);

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

  const totalChaptersCount =
    subject === 'ingles' ? ALL_ENGLISH_CHAPTERS.length : ALL_CHAPTERS.length;

  const completedInVideoCount = useMemo(() => {
    const doneSet = new Set(completedSceneIds);
    return flatScenes.filter((item) => doneSet.has(item.scene.id)).length;
  }, [flatScenes, completedSceneIds]);

  const videoProgressPct = useMemo(() => {
    if (flatScenes.length === 0) return 0;
    return Math.round((completedInVideoCount / flatScenes.length) * 100);
  }, [completedInVideoCount, flatScenes.length]);

  const pdfHref =
    subject === 'ingles'
      ? `${import.meta.env.BASE_URL}assets/aistudio/ingles_paso_a_paso_dislexia_3ro__1__079a2dbc.pdf`
      : `${import.meta.env.BASE_URL}assets/aistudio/Trabajo_Practico_Integrador_Matematica_3er_ano_monomios_corregidos_2fb32742.pdf`;
  const englishGuideHref = `${import.meta.env.BASE_URL}assets/aistudio/ingles_3ro_autoaprendizaje_3d767fcf.html`;
  const pdfTitle =
    subject === 'ingles'
      ? 'Inglés Paso a Paso – Guía Visual (3.er año)'
      : 'Trabajo Práctico Integrador Final – Matemática 3.er año';
  const pdfDownloadName =
    subject === 'ingles'
      ? 'Ingles_Paso_a_Paso_3er_ano.pdf'
      : 'Trabajo_Practico_Integrador_Matematica_3er_ano.pdf';

  const subjectBrandTitle =
    subject === 'ingles' ? 'Inglés Paso a Paso' : 'Matemática Paso a Paso';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {/* Top Navigation Bar starting directly with Subject Selection */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 xl:gap-5">
          {/* Zone 1: Subject Selection (Primary Left) + Displaced Secondary Subject Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              role="group"
              aria-label="Seleccionar materia"
              className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl shrink-0"
            >
              <button
                type="button"
                onClick={() => handleSelectSubject('matematica')}
                aria-pressed={subject === 'matematica'}
                className={`inline-flex items-center justify-center px-3 sm:px-4 py-1.5 min-h-[40px] rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  subject === 'matematica'
                    ? 'bg-blue-800 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-white hover:text-blue-900'
                }`}
              >
                <span>Matemática</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSubject('ingles')}
                aria-pressed={subject === 'ingles'}
                className={`inline-flex items-center justify-center px-3 sm:px-4 py-1.5 min-h-[40px] rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  subject === 'ingles'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-white hover:text-emerald-900'
                }`}
              >
                <span>Inglés</span>
              </button>
            </div>

            <span
              className="hidden md:block lg:hidden xl:block w-px h-6 bg-slate-200 shrink-0"
              aria-hidden="true"
            />

            <a
              href="#inicio"
              onClick={(e) => {
                e.preventDefault();
                handleSelectVideo(subject === 'ingles' ? 'english-1' : 'video-1');
              }}
              className="hidden md:inline-flex lg:hidden xl:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              title={`Ir al inicio de ${subjectBrandTitle}`}
            >
              <BookOpen
                className={`w-4 h-4 shrink-0 ${
                  subject === 'ingles' ? 'text-emerald-700' : 'text-blue-700'
                }`}
                aria-hidden="true"
              />
              <span
                className={
                  subject === 'ingles'
                    ? 'font-english-accessible text-xs font-bold tracking-wide'
                    : 'font-display'
                }
              >
                {subjectBrandTitle}
              </span>
            </a>
          </div>

          {/* Zone 2: 4 concise single-line color-coded nav buttons */}
          <nav
            aria-label={subject === 'ingles' ? 'Temas de inglés' : 'Videos de la serie'}
            className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-xs xl:text-sm font-medium min-w-0"
          >
            {subjectVideos.map((vid) => {
              const active = vid.id === activeVideo.id;
              const theme = VIDEO_THEMES[vid.id];
              return (
                <button
                  key={vid.id}
                  type="button"
                  onClick={() => handleSelectVideo(vid.id)}
                  className={`inline-flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 py-1.5 min-h-[38px] rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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

          {/* Zone 3: 1 Primary CTA consistent with selected subject */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setDownloadTargetVideoId(null);
                setDownloadModalOpen(true);
              }}
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 min-h-[40px] rounded-lg text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subject === 'ingles'
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-blue-700 hover:bg-blue-800'
              }`}
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
        {/* Series Context Bar + Mobile Video Selector (kept as div 1 to preserve Focus Mode DOM positions) */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600">
            <span
              className={`font-bold ${
                subject === 'ingles'
                  ? 'font-english-accessible text-xs text-emerald-800'
                  : 'font-display text-blue-900'
              }`}
            >
              {subjectBrandTitle} · 3.er año
            </span>
            <span className="text-slate-500">
              {subject === 'ingles'
                ? '4 temas visuales · Aprendizaje sin apuro'
                : '4 videos paso a paso · Lucía'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap lg:hidden items-center gap-2">
            {subjectVideos.map((vid) => {
              const active = vid.id === activeVideo.id;
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
              <span>
                {subject === 'ingles'
                  ? `${subjectBrandTitle} · Aprendemos de a poquito`
                  : `${subjectBrandTitle} · Trabajo Práctico Integrador Final`}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {subject === 'ingles'
                  ? `${totalChaptersCount} temas visuales sin apuro`
                  : `${totalChaptersCount} capítulos en 4 videos cortos`}
              </span>
            </div>
            <h1
              className={`text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 ${
                subject === 'ingles' ? 'font-english-accessible' : 'font-display'
              }`}
            >
              {activeVideo.shortLabel}: {activeVideo.title}
            </h1>
            <p
              className={`text-slate-600 text-sm sm:text-base ${
                subject === 'ingles' ? 'font-english-accessible text-sm' : ''
              }`}
            >
              {activeVideo.subtitle}
            </p>

            {/* Global topic completion progress indicator */}
            <div
              className="pt-1.5 max-w-md space-y-1.5"
              aria-label={`Avance del tema: ${videoProgressPct}%`}
            >
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                <span className="font-semibold text-slate-700">
                  Avance de Lucía: {completedInVideoCount} de {flatScenes.length} escenas completadas
                </span>
                <span className="font-math font-bold text-emerald-700 shrink-0">
                  {videoProgressPct}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${videoProgressPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setDownloadTargetVideoId(activeVideo.id);
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
              <span>{subject === 'ingles' ? 'Ver guía Inglés (PDF)' : 'Ver TP original (PDF)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowFreePracticeModal(true)}
              className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 min-h-[44px] rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs sm:text-sm font-semibold text-amber-950 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-700" />
              <span>Práctica Libre</span>
            </button>
            {subject === 'matematica' && (
              <button
                type="button"
                onClick={() => setShowTablesModal(true)}
                className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 min-h-[44px] rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-xs sm:text-sm font-semibold text-blue-900 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Grid3X3 className="w-4 h-4 text-blue-700" />
                <span>Tablas × (Machete)</span>
              </button>
            )}
            {subject === 'ingles' && (
              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById('ingles-repaso-final')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 min-h-[44px] rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs sm:text-sm font-semibold text-emerald-900 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Guía interactiva final</span>
              </button>
            )}
          </div>
        </div>

        {/* Two-Zone Sandbox Layout: Video Player Left (68%) + Chapter Navigator Right (32%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT ZONE: Animated Video Player & Controls */}
          <section className="lg:col-span-8 space-y-4" aria-label="Reproductor de video educativo">
            {currentItem && (
              <VideoStage
                scene={currentItem.scene}
                subject={subject}
                chapterTitle={currentItem.chapter.title}
                chapterNumber={currentItem.chapter.number}
                activityRef={currentItem.chapter.activityRef}
                isPlaying={isPlaying}
                narrationProgress={progress}
                manualSpotlight={manualSpotlight}
                showSubtitles={showSubtitles}
                onPracticeSolved={markSceneCompleted}
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
                    className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl border-2 border-blue-900 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl border-2 border-indigo-800 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-sm font-bold text-white shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextScene}
                    disabled={sceneIndex >= flatScenes.length - 1}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl border-2 border-emerald-800 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-sm font-bold text-white shadow-sm whitespace-nowrap shrink-0 cursor-pointer sm:order-4"
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
                    className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl border-2 border-amber-800 bg-amber-600 hover:bg-amber-700 text-sm font-bold text-white shadow-sm whitespace-nowrap shrink-0 cursor-pointer sm:order-3"
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
                    aria-pressed={showSubtitles}
                    title={showSubtitles ? 'Ocultar subtítulos' : 'Mostrar subtítulos'}
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg border text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      showSubtitles
                        ? 'border-blue-300 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
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

            {/* Quick Check Multiple-Choice Reinforcement for the Current Video */}
            <QuickCheckCard
              videoId={activeVideo.id}
              videoLabel={activeVideo.shortLabel}
              subject={subject}
            />
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
                      label: subject === 'ingles' ? 'Persona' : 'Números',
                      box: 'bg-blue-50/70 border-blue-200 hover:border-blue-400',
                      activeRing: 'ring-2 ring-blue-500 bg-blue-100',
                      dot: 'bg-blue-700',
                    },
                    {
                      target: 'var' as const,
                      label: subject === 'ingles' ? 'Verbo / Palabra' : 'Letras',
                      box: 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400',
                      activeRing: 'ring-2 ring-emerald-500 bg-emerald-100',
                      dot: 'bg-emerald-700',
                    },
                    {
                      target: 'exp' as const,
                      label: subject === 'ingles' ? 'Tiempo / DID' : 'Exponentes',
                      box: 'bg-orange-50/70 border-orange-200 hover:border-orange-400',
                      activeRing: 'ring-2 ring-orange-500 bg-orange-100',
                      dot: 'bg-orange-600',
                    },
                    {
                      target: 'neg' as const,
                      label: subject === 'ingles' ? 'NOT / N’T' : 'Signos (−)',
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
                  {subject === 'ingles' ? 'Escenas de este tema' : 'Capítulos de este video'}
                </h2>
                <BookOpen className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-3.5">
                {videoChapters.map((chapter, chIdx) => {
                  const chapterScenes = flatScenes.filter(
                    (f) => f.chapter.id === chapter.id
                  );
                  const chapterCompletedCount = chapterScenes.filter((f) =>
                    completedSceneIds.includes(f.scene.id)
                  ).length;
                  const pal = CHAPTER_PALETTE[chIdx % CHAPTER_PALETTE.length];
                  const isChapterJustCelebrated = justCelebratedChapterId === chapter.id;
                  const isChapterDone =
                    chapterScenes.length > 0 && chapterCompletedCount === chapterScenes.length;
                  return (
                    <div
                      key={chapter.id}
                      className={`space-y-2.5 p-3.5 rounded-xl border transition-shadow ${
                        pal.card
                      } ${
                        isChapterJustCelebrated
                          ? 'ring-2 ring-emerald-500 shadow-md'
                          : isChapterDone
                            ? 'ring-1 ring-emerald-400/80'
                            : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="min-w-0">
                          <div className={`text-xs font-semibold ${pal.kicker}`}>
                            {subject === 'ingles' ? 'Tema' : 'Capítulo'} {chapter.number} · {chapter.activityRef}
                          </div>
                          <div
                            className={`font-bold text-sm ${pal.title} ${
                              subject === 'ingles' ? 'font-english-accessible' : 'font-display'
                            }`}
                          >
                            {chapter.title}
                          </div>
                        </div>

                        <ChapterProgressRing
                          completed={chapterCompletedCount}
                          total={chapterScenes.length}
                          strokeColor={pal.ringStroke}
                          trackColor={pal.ringTrack}
                        />
                      </div>

                      <div className="space-y-1.5">
                        {chapterScenes.map((item) => {
                          const active = item.globalIndex === sceneIndex;
                          const isPractice = item.scene.phase === 'practica';
                          const isCompleted = completedSceneIds.includes(item.scene.id);
                          return (
                            <button
                              key={item.scene.id}
                              type="button"
                              onClick={() => setSceneIndex(item.globalIndex)}
                              className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-lg border text-xs sm:text-sm transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                active ? pal.btnActive : pal.btnInactive
                              } ${subject === 'ingles' ? 'font-english-accessible text-xs' : ''}`}
                            >
                              <span className="leading-snug flex items-center gap-1.5">
                                {isCompleted && (
                                  <Check
                                    className={`w-3.5 h-3.5 shrink-0 ${
                                      active ? 'text-white' : 'text-emerald-700'
                                    }`}
                                    aria-label="Completada"
                                  />
                                )}
                                <span>{item.scene.headline}</span>
                              </span>
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
                Con mucho Amor, tu papi... Ariel!!!
              </div>
            </div>
          </aside>
        </div>

        {/* Interactive Self-Learning HTML Guide Embedded at the End of Inglés (uses <section> to keep div nth-of-type intact) */}
        {subject === 'ingles' && (
          <section
            id="ingles-repaso-final"
            aria-label="Guía interactiva final de Inglés"
            className="bg-white border-2 border-emerald-200 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Cierre interactivo · Inglés 3.er año
                </div>
                <h2 className="font-english-accessible text-lg sm:text-xl font-bold text-slate-900">
                  GUÍA COMPLETA DE AUTOAPRENDIZAJE PARA PRACTICAR AL FINAL
                </h2>
                <p className="font-english-accessible text-xs sm:text-sm text-slate-600">
                  PODÉS USAR LOS BOTONES DE AUDIO, EL MODO LETRA GRANDE Y LOS EJERCICIOS PASO A PASO DIRECTAMENTE ACÁ ABAJO.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEnglishGuideModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Ver en pantalla completa</span>
                </button>
                <a
                  href={englishGuideHref}
                  download="Ingles_3ro_Autoaprendizaje.html"
                  className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Guardar guía</span>
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
              <iframe
                src={englishGuideHref}
                title="Guía interactiva final de Inglés 3.er año"
                className="w-full h-[740px] bg-white"
              />
            </div>
          </section>
        )}
      </main>

      {/* In-App Modal for Viewing Original PDF without window.open */}
      {showPdfModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-6 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={pdfTitle}
        >
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200">
              <div className="font-display text-sm sm:text-base font-bold text-slate-900">
                {pdfTitle}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={pdfHref}
                  download={pdfDownloadName}
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
              src={pdfHref}
              title={pdfTitle}
              className="flex-1 w-full bg-slate-100"
            />
          </div>
        </div>
      )}

      {/* In-App Full-Screen Modal for Inglés Self-Learning Guide */}
      {showEnglishGuideModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-2 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Guía interactiva final de Inglés 3.er año"
        >
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden shadow-xl">
            <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 border-b border-slate-200">
              <div className="font-english-accessible text-sm sm:text-base font-bold text-slate-900">
                GUÍA COMPLETA DE AUTOAPRENDIZAJE · INGLÉS 3.ER AÑO
              </div>
              <button
                type="button"
                onClick={() => setShowEnglishGuideModal(false)}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                aria-label="Cerrar guía interactiva"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe
              src={englishGuideHref}
              title="Guía interactiva final de Inglés 3.er año (pantalla completa)"
              className="flex-1 w-full bg-white"
            />
          </div>
        </div>
      )}

      {/* Floating Notepad & Tablas Machete persisted locally per topic */}
      <FloatingNotepad
        topicId={activeVideo.id}
        topicLabel={activeVideo.shortLabel}
        topicTitle={activeVideo.title}
        showTablesButton={subject === 'matematica'}
        onOpenTables={() => setShowTablesModal(true)}
      />

      <FreePracticeModal
        open={showFreePracticeModal}
        activeVideoId={activeVideo.id}
        onClose={() => setShowFreePracticeModal(false)}
      />

      <MultiplicationCheatModal
        open={showTablesModal}
        onClose={() => setShowTablesModal(false)}
      />

      <DownloadCenterModal
        open={downloadModalOpen}
        subject={subject}
        initialVideoId={downloadTargetVideoId}
        onClose={() => setDownloadModalOpen(false)}
      />

      <ChapterCelebrationConfetti
        event={celebrationEvent}
        onDismiss={dismissCelebration}
      />
    </div>
  );
}
