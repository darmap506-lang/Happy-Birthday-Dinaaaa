import React, { useCallback, useEffect, useRef, useState } from 'react';
import { sound } from '../utils/audio';
import {
  BLOOM_LIFETIME_MS,
  FlowerBloom,
  MAX_ACTIVE_BLOOMS,
  createFlowerBloom,
  shouldSpawnBackgroundBloom,
  trimActiveBlooms,
} from '../utils/interactiveEffects';

interface BloomingFlowerLayerProps {
  /** Incremented externally (e.g. clicking corner sakura on MainCard) to spawn a cluster */
  bouquetTrigger?: { seq: number; x?: number; y?: number } | null;
}

const PETAL_ANGLES = [0, 72, 144, 216, 288];

export const BloomingFlowerLayer: React.FC<BloomingFlowerLayerProps> = ({
  bouquetTrigger,
}) => {
  const [blooms, setBlooms] = useState<FlowerBloom[]>([]);
  const nextIdRef = useRef(1);
  const timeoutsRef = useRef<Map<number, number>>(new Map());

  const spawnBloomAt = useCallback((x: number, y: number) => {
    const id = nextIdRef.current++;
    const bloom = createFlowerBloom(x, y, id, id + Math.round(x + y));

    setBlooms((prev) => trimActiveBlooms([...prev, bloom], MAX_ACTIVE_BLOOMS));

    const timerId = window.setTimeout(() => {
      timeoutsRef.current.delete(id);
      setBlooms((prev) => prev.filter((item) => item.id !== id));
    }, BLOOM_LIFETIME_MS);

    timeoutsRef.current.set(id, timerId);
  }, []);

  // Spawn multi-flower cascade when triggered externally (e.g. corner sakura button)
  useEffect(() => {
    if (!bouquetTrigger || bouquetTrigger.seq === 0 || typeof window === 'undefined') return;
    const baseX = bouquetTrigger.x ?? window.innerWidth * 0.5;
    const baseY = bouquetTrigger.y ?? window.innerHeight * 0.36;

    const offsets = [
      { dx: 0, dy: 0, delay: 0 },
      { dx: -44, dy: 28, delay: 90 },
      { dx: 42, dy: -22, delay: 160 },
      { dx: -18, dy: -46, delay: 230 },
    ];

    const cascadeTimers: number[] = [];
    offsets.forEach(({ dx, dy, delay }) => {
      const t = window.setTimeout(() => {
        spawnBloomAt(baseX + dx, baseY + dy);
      }, delay);
      cascadeTimers.push(t);
    });

    return () => {
      cascadeTimers.forEach((t) => window.clearTimeout(t));
    };
  }, [bouquetTrigger, spawnBloomAt]);

  // Global background click/tap spawns an unfurling sakura blossom at cursor/touch point
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;

      const isInteractiveElement = Boolean(
        target.closest(
          'button, a, input, textarea, select, label, [role="button"], [data-interactive-balloon="true"], [data-music-toggle="true"]'
        )
      );
      const isInsideIgnoreRegion = Boolean(
        target.closest('[data-bloom-ignore="true"], [role="dialog"]')
      );

      if (!shouldSpawnBackgroundBloom({ isInteractiveElement, isInsideIgnoreRegion })) {
        return;
      }

      spawnBloomAt(e.clientX, e.clientY);
      sound.playFlowerBloom();
    };

    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [spawnBloomAt]);

  useEffect(() => {
    const map = timeoutsRef.current;
    return () => {
      map.forEach((id) => window.clearTimeout(id));
      map.clear();
    };
  }, []);

  if (blooms.length === 0) return null;

  return (
    <div
      data-testid="blooming-flower-layer"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-[15]"
    >
      {blooms.map((bloom) => (
        <div
          key={bloom.id}
          data-testid="blooming-flower"
          className="absolute animate-flower-bloom"
          style={
            {
              left: `${bloom.x}px`,
              top: `${bloom.y}px`,
              width: `${bloom.sizePx}px`,
              height: `${bloom.sizePx}px`,
              '--bloom-rot': `${bloom.rotationDeg}deg`,
            } as React.CSSProperties
          }
        >
          {/* Soft champagne ripple halo */}
          <span
            className="absolute inset-1 rounded-full border border-[#e6be7e]/75 animate-flower-halo"
          />

          <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible drop-shadow-[0_6px_14px_rgba(190,24,93,0.22)]"
          >
            <g className="animate-flower-inner">
              {/* Outer 5 sculpted sakura petals */}
              {PETAL_ANGLES.map((angle) => (
                <g key={`outer-${angle}`} transform={`rotate(${angle} 50 50)`}>
                  <path
                    d="M50 48 C39 36, 36 16, 46 8 C48.5 11, 50 13, 50 13 C50 13, 51.5 11, 54 8 C64 16, 61 36, 50 48 Z"
                    fill={bloom.palette.outerPetal}
                    stroke="#ffffff"
                    strokeWidth="0.9"
                    strokeOpacity="0.7"
                  />
                </g>
              ))}

              {/* Inner 5 offset blush petals */}
              {PETAL_ANGLES.map((angle) => (
                <g key={`inner-${angle}`} transform={`rotate(${angle + 36} 50 50)`}>
                  <path
                    d="M50 49 C42 40, 41 25, 50 19 C59 25, 58 40, 50 49 Z"
                    fill={bloom.palette.innerPetal}
                    fillOpacity="0.92"
                  />
                </g>
              ))}

              {/* Delicate golden stamens & pearl core */}
              {PETAL_ANGLES.map((angle) => (
                <g key={`stamen-${angle}`} transform={`rotate(${angle + 18} 50 50)`}>
                  <line
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="37"
                    stroke={bloom.palette.stamen}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <circle cx="50" cy="36" r="1.7" fill={bloom.palette.centerGlow} />
                </g>
              ))}
              <circle cx="50" cy="50" r="6" fill={bloom.palette.centerGlow} />
              <circle cx="50" cy="50" r="3" fill={bloom.palette.stamen} opacity="0.85" />
            </g>
          </svg>
        </div>
      ))}
    </div>
  );
};
