import { useCallback, useEffect, useRef, useState } from 'react';

interface NarratorOptions {
  text: string;
  nextText?: string;
  sceneId: string;
  isPlaying: boolean;
  muted: boolean;
  playbackRate: number;
  fallbackDurationMs: number;
  autoAdvance: boolean;
  onSceneComplete: () => void;
}

// Tiny 44-byte silent WAV to unlock a persistent HTMLAudioElement on mobile/desktop click
const SILENT_UNLOCK_WAV =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

const MALE_VOICE_NAMES = [
  'tomas',
  'tomás',
  'pablo',
  'diego',
  'jorge',
  'carlos',
  'raul',
  'raúl',
  'alvaro',
  'álvaro',
  'andres',
  'andrés',
  'mateo',
  'pedro',
  'miguel',
  'luis',
  'enrique',
  'antonio',
  'manuel',
  'male',
  'hombre',
];

const FEMALE_VOICE_NAMES = [
  'elena',
  'sabina',
  'helena',
  'luciana',
  'paulina',
  'paloma',
  'sofia',
  'sofía',
  'camila',
  'valentina',
  'monica',
  'mónica',
  'laura',
  'maria',
  'maría',
  'salome',
  'salomé',
  'ximena',
  'andrea',
  'isabela',
  'dalia',
  'elvira',
  'google español',
  'female',
  'mujer',
];

function pickWarmFemaleSpanishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const spanish = voices.filter((v) => v.lang.toLowerCase().startsWith('es'));
  if (spanish.length === 0) return undefined;

  let bestVoice: SpeechSynthesisVoice | undefined;
  let bestScore = -999;

  for (const v of spanish) {
    const name = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();
    let score = 0;

    if (lang === 'es-ar') score += 40;
    else if (lang === 'es-419' || lang === 'es-us' || lang === 'es-uy') score += 30;
    else if (lang === 'es-mx' || lang === 'es-co') score += 20;
    else score += 10;

    if (FEMALE_VOICE_NAMES.some((f) => name.includes(f))) score += 60;
    if (MALE_VOICE_NAMES.some((m) => name.includes(m))) score -= 120;
    if (name.includes('natural') || name.includes('google')) score += 15;

    if (score > bestScore) {
      bestScore = score;
      bestVoice = v;
    }
  }

  return bestVoice;
}

export function playSoftFeedbackTone(kind: 'gentle' | 'success') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const now = ctx.currentTime;

    if (kind === 'success') {
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.14);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    } else {
      osc.frequency.setValueAtTime(392.0, now);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 500);
  } catch {
    // Ignore audio context errors silently
  }
}

export function useNarrator({
  text,
  nextText,
  sceneId,
  isPlaying,
  muted,
  playbackRate,
  fallbackDurationMs,
  autoAdvance,
  onSceneComplete,
}: NarratorOptions) {
  const [voiceEngine, setVoiceEngine] = useState<'gemini' | 'browser' | 'silent'>('gemini');
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ttsQuotaExceeded, setTtsQuotaExceeded] = useState(false);
  const [ttsNotice, setTtsNotice] = useState<string | null>(null);

  // Cache audio WAV data URLs keyed by trimmed narration text
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const inFlightClientRef = useRef<
    Map<string, Promise<{ dataUrl: string | null; quotaExceeded?: boolean; error?: string }>>
  >(new Map());
  const sharedAudioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);
  const isUnlockingRef = useRef(false);
  const quotaExceededRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onSceneComplete);
  onCompleteRef.current = onSceneComplete;

  const getSharedAudio = useCallback(() => {
    if (!sharedAudioRef.current && typeof Audio !== 'undefined') {
      sharedAudioRef.current = new Audio();
    }
    return sharedAudioRef.current;
  }, []);

  /**
   * Call synchronously from Play / Repeat button click to keep mobile/desktop audio unlocked
   * across async TTS fetches and scene transitions.
   */
  const unlockAudio = useCallback(() => {
    if (unlockedRef.current || isUnlockingRef.current) return;
    const audio = getSharedAudio();
    if (!audio) return;
    try {
      isUnlockingRef.current = true;
      audio.src = SILENT_UNLOCK_WAV;
      audio.volume = 0.01;
      const p = audio.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 1;
          unlockedRef.current = true;
          isUnlockingRef.current = false;
        }).catch(() => {
          audio.volume = 1;
          isUnlockingRef.current = false;
        });
      } else {
        isUnlockingRef.current = false;
      }
    } catch {
      audio.volume = 1;
      isUnlockingRef.current = false;
    }
  }, [getSharedAudio]);

  const fetchTtsDataUrl = useCallback(
    async (
      rawText: string
    ): Promise<{ dataUrl: string | null; quotaExceeded?: boolean; error?: string }> => {
      const clean = rawText.trim();
      if (!clean) return { dataUrl: null };

      const hit = audioCacheRef.current.get(clean);
      if (hit) return { dataUrl: hit };

      const pending = inFlightClientRef.current.get(clean);
      if (pending) return pending;

      const req = (async () => {
        try {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: clean }),
          });
          const contentType = res.headers.get('content-type') || '';
          const data = contentType.includes('application/json') ? await res.json() : null;

          if (!res.ok) {
            const isQuota = res.status === 429 || data?.quotaExceeded === true;
            return {
              dataUrl: null,
              quotaExceeded: isQuota,
              error: data?.error,
            };
          }

          if (!data?.audioBase64) return { dataUrl: null };
          const dataUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
          audioCacheRef.current.set(clean, dataUrl);
          return { dataUrl };
        } catch {
          return { dataUrl: null };
        } finally {
          inFlightClientRef.current.delete(clean);
        }
      })();

      inFlightClientRef.current.set(clean, req);
      return req;
    },
    []
  );

  const stopAll = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressIntervalRef.current !== null) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (sharedAudioRef.current && !isUnlockingRef.current) {
      const audio = sharedAudioRef.current;
      audio.pause();
      audio.onended = null;
      audio.onerror = null;
      audio.ontimeupdate = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const scheduleNext = useCallback(
    (delayMs: number) => {
      if (!autoAdvance) return;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        onCompleteRef.current();
      }, delayMs);
    },
    [autoAdvance]
  );

  // Reset progress when scene changes
  useEffect(() => {
    setProgress(0);
  }, [sceneId]);

  useEffect(() => {
    stopAll();
    if (!isPlaying) return;

    let cancelled = false;

    const startTimerProgress = (totalMs: number) => {
      const startedAt = Date.now();
      if (progressIntervalRef.current !== null) {
        window.clearInterval(progressIntervalRef.current);
      }
      progressIntervalRef.current = window.setInterval(() => {
        if (cancelled) return;
        const elapsed = Date.now() - startedAt;
        const ratio = Math.min(1, elapsed / Math.max(1000, totalMs));
        setProgress(ratio);
      }, 150);
    };

    const speakWithBrowser = () => {
      if (cancelled) return;
      const estimatedMs = Math.round(fallbackDurationMs / playbackRate);

      if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setVoiceEngine('silent');
        setIsSpeaking(false);
        startTimerProgress(estimatedMs);
        scheduleNext(estimatedMs);
        return;
      }

      setVoiceEngine('browser');

      const startSpeech = () => {
        if (cancelled) return;
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const preferred = pickWarmFemaleSpanishVoice(voices);
        if (preferred) {
          utterance.voice = preferred;
        }
        utterance.lang = preferred?.lang || 'es-AR';
        utterance.rate = Math.max(0.72, Math.min(1.1, playbackRate * 0.92));
        utterance.pitch = 1.05;

        utterance.onstart = () => {
          if (!cancelled) {
            setIsSpeaking(true);
            startTimerProgress(estimatedMs);
          }
        };
        utterance.onboundary = (ev) => {
          if (!cancelled && text.length > 0 && typeof ev.charIndex === 'number') {
            setProgress(Math.min(1, ev.charIndex / text.length));
          }
        };
        utterance.onend = () => {
          if (cancelled) return;
          setProgress(1);
          setIsSpeaking(false);
          scheduleNext(1800);
        };
        utterance.onerror = () => {
          if (cancelled) return;
          setIsSpeaking(false);
          startTimerProgress(estimatedMs);
          scheduleNext(estimatedMs);
        };

        window.speechSynthesis.speak(utterance);
      };

      const initialVoices = window.speechSynthesis.getVoices();
      if (initialVoices.length > 0) {
        startSpeech();
      } else {
        let fired = false;
        const onVoicesChanged = () => {
          if (fired) return;
          fired = true;
          window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
          startSpeech();
        };
        window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
        window.setTimeout(() => {
          if (!fired) {
            fired = true;
            window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
            startSpeech();
          }
        }, 350);
      }
    };

    const playWavDataUrl = (dataUrl: string) => {
      const audio = getSharedAudio();
      if (!audio) {
        speakWithBrowser();
        return;
      }

      isUnlockingRef.current = false;
      audio.pause();
      audio.src = dataUrl;
      audio.volume = 1;
      audio.playbackRate = playbackRate;
      quotaExceededRef.current = false;
      setTtsQuotaExceeded(false);
      setTtsNotice(null);
      setVoiceEngine('gemini');
      setIsSpeaking(true);

      audio.ontimeupdate = () => {
        if (cancelled) return;
        if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) {
          setProgress(Math.min(1, audio.currentTime / audio.duration));
        }
      };
      audio.onended = () => {
        if (cancelled) return;
        setProgress(1);
        setIsSpeaking(false);
        scheduleNext(1700);
      };
      audio.onerror = () => {
        if (!cancelled) speakWithBrowser();
      };
      audio.play().catch(() => {
        if (!cancelled) speakWithBrowser();
      });

      // Quietly prefetch next scene audio when quota is available
      if (
        !quotaExceededRef.current &&
        nextText &&
        nextText.trim() &&
        !audioCacheRef.current.has(nextText.trim())
      ) {
        window.setTimeout(() => {
          if (!cancelled && !quotaExceededRef.current) {
            fetchTtsDataUrl(nextText).catch(() => {});
          }
        }, 1200);
      }
    };

    const runNarration = async () => {
      if (muted) {
        const estimatedMs = Math.round(fallbackDurationMs / playbackRate);
        setIsSpeaking(false);
        startTimerProgress(estimatedMs);
        scheduleNext(estimatedMs);
        return;
      }

      const clean = text.trim();
      const cachedDataUrl = audioCacheRef.current.get(clean);
      if (cachedDataUrl) {
        playWavDataUrl(cachedDataUrl);
        return;
      }

      setIsLoadingAudio(true);
      const result = await fetchTtsDataUrl(clean);
      if (cancelled) return;
      setIsLoadingAudio(false);

      if (!result.dataUrl) {
        if (result.quotaExceeded) {
          quotaExceededRef.current = true;
          setTtsQuotaExceeded(true);
          setTtsNotice(
            result.error ||
              'Se alcanzó el límite diario gratuito de la voz cálida (Kore). Para escuchar todos los videos con esa misma voz sin límite, seleccioná una clave con facturación en Settings > Secrets.'
          );
        }
        speakWithBrowser();
        return;
      }

      playWavDataUrl(result.dataUrl);
    };

    runNarration();

    return () => {
      cancelled = true;
      stopAll();
    };
  }, [
    sceneId,
    text,
    nextText,
    isPlaying,
    muted,
    playbackRate,
    fallbackDurationMs,
    scheduleNext,
    stopAll,
    getSharedAudio,
    fetchTtsDataUrl,
  ]);

  useEffect(() => {
    if (sharedAudioRef.current) {
      sharedAudioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  return {
    voiceEngine,
    isLoadingAudio,
    isSpeaking,
    progress,
    ttsQuotaExceeded,
    ttsNotice,
    stopAll,
    unlockAudio,
  };
}
