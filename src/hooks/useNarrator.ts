import { useCallback, useEffect, useRef, useState } from 'react';

interface NarratorOptions {
  text: string;
  sceneId: string;
  isPlaying: boolean;
  muted: boolean;
  playbackRate: number;
  fallbackDurationMs: number;
  autoAdvance: boolean;
  onSceneComplete: () => void;
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

  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onSceneComplete);
  onCompleteRef.current = onSceneComplete;

  const stopAll = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressIntervalRef.current !== null) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.onended = null;
      audioElRef.current.onerror = null;
      audioElRef.current.ontimeupdate = null;
      audioElRef.current = null;
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
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => v.lang.toLowerCase() === 'es-ar') ||
        voices.find((v) => v.lang.toLowerCase() === 'es-419') ||
        voices.find((v) => v.lang.toLowerCase().startsWith('es-'));
      if (preferred) {
        utterance.voice = preferred;
      }
      utterance.lang = preferred?.lang || 'es-AR';
      utterance.rate = Math.max(0.7, Math.min(1.15, playbackRate * 0.92));
      utterance.pitch = 1.0;

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

    const playWavDataUrl = (dataUrl: string) => {
      const audio = new Audio(dataUrl);
      audio.playbackRate = playbackRate;
      audioElRef.current = audio;
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
    };

    const runNarration = async () => {
      if (muted) {
        const estimatedMs = Math.round(fallbackDurationMs / playbackRate);
        setIsSpeaking(false);
        startTimerProgress(estimatedMs);
        scheduleNext(estimatedMs);
        return;
      }

      const cachedDataUrl = audioCacheRef.current.get(sceneId);
      if (cachedDataUrl) {
        playWavDataUrl(cachedDataUrl);
        return;
      }

      setIsLoadingAudio(true);
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, sceneId }),
        });

        if (cancelled) return;
        setIsLoadingAudio(false);

        if (!res.ok) {
          speakWithBrowser();
          return;
        }

        const data = await res.json();
        if (!data?.audioBase64) {
          speakWithBrowser();
          return;
        }

        const dataUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
        audioCacheRef.current.set(sceneId, dataUrl);

        if (cancelled) return;
        playWavDataUrl(dataUrl);
      } catch {
        if (cancelled) return;
        setIsLoadingAudio(false);
        speakWithBrowser();
      }
    };

    runNarration();

    return () => {
      cancelled = true;
      stopAll();
    };
  }, [sceneId, text, isPlaying, muted, playbackRate, fallbackDurationMs, scheduleNext, stopAll]);

  useEffect(() => {
    if (audioElRef.current) {
      audioElRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  return { voiceEngine, isLoadingAudio, isSpeaking, progress, stopAll };
}
