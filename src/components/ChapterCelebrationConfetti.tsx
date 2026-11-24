import React, { useEffect, useRef, useState } from 'react';
import { Award, PartyPopper, X } from 'lucide-react';
import type { SubjectId } from '../types/lesson';

export interface ChapterCelebrationEvent {
  nonce: number;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  subject: SubjectId;
}

interface ChapterCelebrationConfettiProps {
  event: ChapterCelebrationEvent | null;
  onDismiss: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'rect' | 'circle' | 'star';
  rotation: number;
  rotationSpeed: number;
  tiltAngle: number;
  tiltSpeed: number;
  swayPhase: number;
  swayFreq: number;
  alpha: number;
}

const CONFETTI_COLORS = [
  '#2563EB', // blue-600
  '#059669', // emerald-600
  '#F59E0B', // amber-500
  '#F43F5E', // rose-500
  '#7C3AED', // violet-600
  '#0EA5E9', // sky-500
  '#10B981', // emerald-500
];

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / 4;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < 4; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
    rot += step;
  }
  ctx.closePath();
  ctx.fill();
}

export const ChapterCelebrationConfetti: React.FC<ChapterCelebrationConfettiProps> = ({
  event,
  onDismiss,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Auto-dismiss banner gently after 5.2s
  useEffect(() => {
    if (!event) return;
    const timer = window.setTimeout(() => {
      onDismiss();
    }, 5200);
    return () => window.clearTimeout(timer);
  }, [event, onDismiss]);

  // Run 2D canvas confetti burst when event triggers
  useEffect(() => {
    if (!event || reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const particles: Particle[] = [];
    const totalParticles = w < 640 ? 75 : 115;

    for (let i = 0; i < totalParticles; i++) {
      // Three burst origins: left cannon, right cannon, and gentle top canopy shower
      const bucket = i % 3;
      let startX = w * 0.5;
      let startY = h * 0.22;
      let vx = 0;
      let vy = 0;

      if (bucket === 0) {
        // Left cannon shooting inward and up
        startX = w * 0.14;
        startY = h * 0.68;
        vx = 3.2 + Math.random() * 6.5;
        vy = -(9.5 + Math.random() * 7.5);
      } else if (bucket === 1) {
        // Right cannon shooting inward and up
        startX = w * 0.86;
        startY = h * 0.68;
        vx = -(3.2 + Math.random() * 6.5);
        vy = -(9.5 + Math.random() * 7.5);
      } else {
        // Top celebratory canopy shower
        startX = w * (0.15 + Math.random() * 0.7);
        startY = -12 - Math.random() * 50;
        vx = (Math.random() - 0.5) * 3.6;
        vy = 2.2 + Math.random() * 3.8;
      }

      const shapes: Particle['shape'][] = ['rect', 'rect', 'circle', 'star'];
      particles.push({
        x: startX,
        y: startY,
        vx,
        vy,
        size: 6 + Math.random() * 6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        shape: shapes[i % shapes.length],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.16,
        tiltAngle: Math.random() * Math.PI * 2,
        tiltSpeed: 0.08 + Math.random() * 0.1,
        swayPhase: Math.random() * Math.PI * 2,
        swayFreq: 0.04 + Math.random() * 0.04,
        alpha: 1,
      });
    }

    const startTime = performance.now();
    const durationMs = 3800;

    const frame = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed >= durationMs) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        return;
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const fadeProgress = elapsed > 2600 ? (elapsed - 2600) / (durationMs - 2600) : 0;

      for (const p of particles) {
        p.vy += 0.24; // gentle gravity
        p.vx *= 0.986; // air drag
        p.vy *= 0.992;
        p.swayPhase += p.swayFreq;
        p.x += p.vx + Math.sin(p.swayPhase) * 0.85;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.tiltAngle += p.tiltSpeed;

        const outOfViewFade = p.y > window.innerHeight + 24 ? 0 : 1;
        const alpha = Math.max(0, (1 - fadeProgress) * p.alpha * outOfViewFade);
        if (alpha <= 0.01) continue;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'rect') {
          const flutterWidth = Math.max(2, Math.abs(Math.cos(p.tiltAngle)) * p.size);
          ctx.fillRect(-flutterWidth / 2, -p.size * 0.36, flutterWidth, p.size * 0.72);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.36, 0, Math.PI * 2);
          ctx.fill();
        } else {
          drawStar(ctx, 0, 0, p.size * 0.55, p.size * 0.22);
        }

        ctx.restore();
      }

      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [event, reducedMotion]);

  if (!event) return null;

  const unitLabel = event.subject === 'ingles' ? 'Tema' : 'Capítulo';

  return (
    <>
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-50"
          aria-hidden="true"
        />
      )}

      <div
        role="status"
        aria-live="polite"
        className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md pointer-events-auto"
      >
        <div className="bg-white border-2 border-emerald-500 rounded-2xl shadow-xl px-4 py-3.5 sm:px-5 sm:py-4 flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0">
            <PartyPopper className="w-6 h-6" aria-hidden="true" />
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Award className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>¡100% completado!</span>
            </div>
            <p className="font-display text-sm sm:text-base font-bold text-slate-900 leading-snug">
              ¡Felicitaciones, Lucía! Completaste el {unitLabel} {event.chapterNumber}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-snug">
              {event.chapterTitle} · Cada capítulo terminado es un logro enorme.
            </p>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 shrink-0 cursor-pointer"
            aria-label="Cerrar felicitación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};
