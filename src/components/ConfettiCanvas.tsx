import React, { memo, useRef, useEffect } from 'react';
import { ConfettiParticle, createConfettiBurst, updateConfettiParticle } from '../utils/confetti';

interface ConfettiCanvasProps {
  /** Incremented or set to a new timestamp when a burst should trigger */
  triggerKey: number;
}

const MAX_CONFETTI_PARTICLES = 240;

export const ConfettiCanvas: React.FC<ConfettiCanvasProps> = memo(({ triggerKey }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    if (triggerKey <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Burst from middle-upper area where cake is located
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.42;

    const newParticles = createConfettiBurst(originX, originY, 110);
    const merged = [...particlesRef.current, ...newParticles];
    particlesRef.current =
      merged.length > MAX_CONFETTI_PARTICLES
        ? merged.slice(merged.length - MAX_CONFETTI_PARTICLES)
        : merged;

    // Setup / update canvas size only when needed (cap DPR at 2 for high-DPI efficiency)
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetWidth = Math.round(window.innerWidth * dpr);
    const targetHeight = Math.round(window.innerHeight * dpr);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 16.666, 2.5);
      lastTimeRef.current = time;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const nextParticles: ConfettiParticle[] = [];

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        const updated = updateConfettiParticle(p, dt);
        if (updated) {
          nextParticles.push(updated);

          ctx.save();
          ctx.translate(updated.x, updated.y);
          ctx.rotate((updated.rotation * Math.PI) / 180);
          ctx.scale(Math.cos(updated.wobble), 1); // 3D fluttering flip
          ctx.globalAlpha = Math.max(0, Math.min(1, updated.opacity));
          ctx.fillStyle = updated.color;

          if (updated.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, updated.width * 0.45, 0, Math.PI * 2);
            ctx.fill();
          } else if (updated.shape === 'star') {
            const size = updated.width * 0.7;
            ctx.beginPath();
            for (let s = 0; s < 5; s++) {
              ctx.lineTo(
                Math.cos(((18 + s * 72) * Math.PI) / 180) * size,
                -Math.sin(((18 + s * 72) * Math.PI) / 180) * size
              );
              ctx.lineTo(
                Math.cos(((54 + s * 72) * Math.PI) / 180) * (size * 0.4),
                -Math.sin(((54 + s * 72) * Math.PI) / 180) * (size * 0.4)
              );
            }
            ctx.closePath();
            ctx.fill();
          } else {
            // Rectangular paper strip
            ctx.fillRect(
              -updated.width / 2,
              -updated.height / 2,
              updated.width,
              updated.height
            );
          }

          ctx.restore();
        }
      }

      particlesRef.current = nextParticles;

      if (particlesRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(loop);
      } else {
        animFrameRef.current = null;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    if (!animFrameRef.current) {
      lastTimeRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(loop);
    }
  }, [triggerKey]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[80] w-full h-full overflow-hidden"
      aria-hidden="true"
    />
  );
});
