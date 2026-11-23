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
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.14); // E5
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    } else {
      osc.frequency.setValueAtTime(392.0, now); // G4
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

  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onSceneComplete);
  onCompleteRef.current = onSceneComplete;

  const stopAll = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.onended = null;
      audioElRef.current.onerror = null;
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

  useEffect(() => {
    stopAll();
    if (!isPlaying) return;

    let cancelled = false;

    const speakWithBrowser = () => {
      if (cancelled) return;
      if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setVoiceEngine('silent');
        setIsSpeaking(false);
        scheduleNext(Math.round(fallbackDurationMs / playbackRate));
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
        if (!cancelled) setIsSpeaking(true);
      };
      utterance.onend = () => {
        if (cancelled) return;
        setIsSpeaking(false);
        scheduleNext(1800);
      };
      utterance.onerror = () => {
        if (cancelled) return;
        setIsSpeaking(false);
        scheduleNext(Math.round(fallbackDurationMs / playbackRate));
      };

      window.speechSynthesis.speak(utterance);
    };

    const runNarration = async () => {
      if (muted) {
        setIsSpeaking(false);
        scheduleNext(Math.round(fallbackDurationMs / playbackRate));
        return;
      }

      const cachedDataUrl = audioCacheRef.current.get(sceneId);
      if (cachedDataUrl) {
        const audio = new Audio(cachedDataUrl);
        audio.playbackRate = playbackRate;
        audioElRef.current = audio;
        setVoiceEngine('gemini');
        setIsSpeaking(true);
        audio.onended = () => {
          if (cancelled) return;
          setIsSpeaking(false);
          scheduleNext(1700);
        };
        audio.onerror = () => {
          if (!cancelled) speakWithBrowser();
        };
        audio.play().catch(() => {
          if (!cancelled) speakWithBrowser();
        });
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
        const audio = new Audio(dataUrl);
        audio.playbackRate = playbackRate;
        audioElRef.current = audio;
        setVoiceEngine('gemini');
        setIsSpeaking(true);

        audio.onended = () => {
          if (cancelled) return;
          setIsSpeaking(false);
          scheduleNext(1700);
        };
        audio.onerror = () => {
          if (!cancelled) speakWithBrowser();
        };
        audio.play().catch(() => {
          if (!cancelled) speakWithBrowser();
        });
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

  // Update playback rate dynamically if an HTMLAudioElement is active
  useEffect(() => {
    if (audioElRef.current) {
      audioElRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  return { voiceEngine, isLoadingAudio, isSpeaking, stopAll };
}
