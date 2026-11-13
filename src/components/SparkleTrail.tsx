import React, { memo, useRef, useEffect } from 'react';
import { SparkleParticle, createSparkle, updateSparkle } from '../utils/sparkles';

interface SparkleTrailProps {
  /** If true, tracks cursor anywhere on the window. Default is true for magical fairy dust */
  globalTrack?: boolean;
}

const MAX_SPARKLE_PARTICLES = 140;

export const SparkleTrail: React.FC<SparkleTrailProps> = memo(({ globalTrack = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SparkleParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const lastSpawnPosRef = useRef<{ x: number; y: number }>({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to full window (cap DPR at 2 for mobile smoothness)
    const updateSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const drawStar = (
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number
    ) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      context.beginPath();
      context.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
      context.lineTo(cx, cy - outerRadius);
      context.closePath();
    };

    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 16.666, 2.5);
      lastTimeRef.current = time;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const nextParticles: SparkleParticle[] = [];

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        const updated = updateSparkle(p, dt);
        if (updated) {
          nextParticles.push(updated);

          ctx.save();
          ctx.translate(updated.x, updated.y);
          ctx.rotate((updated.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, Math.min(1, updated.life));

          // Twinkling soft glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = updated.color;
          ctx.fillStyle = updated.color;

          const size = updated.size * (0.35 + updated.life * 0.65);

          if (updated.shape === 'star') {
            drawStar(ctx, 0, 0, 4, size, size * 0.32);
            ctx.fill();
          } else if (updated.shape === 'diamond') {
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size * 0.65, 0);
            ctx.lineTo(0, size);
            ctx.lineTo(-size * 0.65, 0);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      particlesRef.current = nextParticles;

      if (particlesRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(loop);
      } else {
        animFrameRef.current = null;
      }
    };

    const startLoopIfNeeded = () => {
      if (!animFrameRef.current) {
        lastTimeRef.current = performance.now();
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    const spawnSparklesAt = (clientX: number, clientY: number, count = 2, isBurst = false) => {
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(
          createSparkle(clientX, clientY, { burst: isBurst })
        );
      }
      if (particlesRef.current.length > MAX_SPARKLE_PARTICLES) {
        particlesRef.current = particlesRef.current.slice(
          particlesRef.current.length - MAX_SPARKLE_PARTICLES
        );
      }
      startLoopIfNeeded();
    };

    const handlePointerMove = (e: MouseEvent) => {
      const dist = Math.hypot(
        e.clientX - lastSpawnPosRef.current.x,
        e.clientY - lastSpawnPosRef.current.y
      );

      // Spawn every 6-8 pixels of movement
      if (dist > 7) {
        lastSpawnPosRef.current = { x: e.clientX, y: e.clientY };
        spawnSparklesAt(e.clientX, e.clientY, 2, false);
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      spawnSparklesAt(e.clientX, e.clientY, 12, true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const dist = Math.hypot(
          touch.clientX - lastSpawnPosRef.current.x,
          touch.clientY - lastSpawnPosRef.current.y
        );
        if (dist > 8) {
          lastSpawnPosRef.current = { x: touch.clientX, y: touch.clientY };
          spawnSparklesAt(touch.clientX, touch.clientY, 2, false);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        spawnSparklesAt(touch.clientX, touch.clientY, 10, true);
      }
    };

    const target = globalTrack ? window : canvas;
    target.addEventListener('mousemove', handlePointerMove as EventListener, { passive: true });
    target.addEventListener('mousedown', handlePointerDown as EventListener, { passive: true });
    target.addEventListener('touchmove', handleTouchMove as EventListener, { passive: true });
    target.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });

    return () => {
      window.removeEventListener('resize', updateSize);
      target.removeEventListener('mousemove', handlePointerMove as EventListener);
      target.removeEventListener('mousedown', handlePointerDown as EventListener);
      target.removeEventListener('touchmove', handleTouchMove as EventListener);
      target.removeEventListener('touchstart', handleTouchStart as EventListener);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [globalTrack]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40 w-full h-full overflow-hidden"
      aria-hidden="true"
    />
  );
});
