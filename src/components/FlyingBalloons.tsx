import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sound } from '../utils/audio';
import { generateBalloons } from '../utils/balloons';
import {
  BALLOON_POP_DURATION_MS,
  BALLOON_RESPAWN_DELAY_MS,
  createBalloonPopFragments,
} from '../utils/interactiveEffects';

interface FlyingBalloonsProps {
  runKey: number;
  count?: number;
  zIndexClass?: string;
}

type PopState = 'idle' | 'popping' | 'hidden';

export const FlyingBalloons: React.FC<FlyingBalloonsProps> = memo(({
  runKey,
  count = 16,
  zIndexClass = 'z-[5]',
}) => {
  const balloons = useMemo(() => generateBalloons(count, runKey), [count, runKey]);
  const [popStates, setPopStates] = useState<Record<number, PopState>>({});
  const [respawnGenerations, setRespawnGenerations] = useState<Record<number, number>>({});
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    setPopStates({});
    setRespawnGenerations({});
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [runKey]);

  const handlePopBalloon = useCallback((id: number) => {
    setPopStates((prev) => {
      if (prev[id] && prev[id] !== 'idle') return prev;
      return { ...prev, [id]: 'popping' };
    });

    sound.playBalloonPop();

    const hideTimer = window.setTimeout(() => {
      setPopStates((prev) => ({ ...prev, [id]: 'hidden' }));
    }, BALLOON_POP_DURATION_MS);

    const respawnTimer = window.setTimeout(() => {
      setRespawnGenerations((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
      setPopStates((prev) => ({ ...prev, [id]: 'idle' }));
    }, BALLOON_POP_DURATION_MS + BALLOON_RESPAWN_DELAY_MS);

    timersRef.current.push(hideTimer, respawnTimer);
  }, []);

  return (
    <div
      key={runKey}
      data-testid="flying-balloons"
      className={`fixed inset-0 overflow-hidden pointer-events-none select-none ${zIndexClass}`}
    >
      {balloons.map((b) => {
        const popState = popStates[b.id] ?? 'idle';
        const gen = respawnGenerations[b.id] ?? 0;
        const isPopped = popState === 'popping';
        const isHidden = popState === 'hidden';
        const fragments = isPopped
          ? createBalloonPopFragments(b.color, b.highlightColor, b.id + gen * 17)
          : [];

        if (isHidden) return null;

        return (
          <div
            key={`${runKey}-${b.id}-${gen}`}
            className="absolute -bottom-36 animate-balloon-rise"
            style={
              {
                left: `${b.leftPercent}%`,
                width: `${b.width}px`,
                animationDuration: `${b.durationSec}s`,
                animationDelay: gen > 0 ? '0.05s' : `${b.delaySec}s`,
                animationPlayState: isPopped ? 'paused' : 'running',
                '--balloon-sway': `${b.swayPx}px`,
                '--balloon-tilt': `${b.tiltDeg}deg`,
              } as React.CSSProperties
            }
          >
            <button
              type="button"
              data-interactive-balloon="true"
              data-popped={isPopped ? 'true' : 'false'}
              aria-label="Pecahkan balon"
              disabled={isPopped}
              onPointerDown={(e) => {
                e.stopPropagation();
                if (!isPopped) handlePopBalloon(b.id);
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onKeyDown={(e) => {
                if (!isPopped && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePopBalloon(b.id);
                }
              }}
              className="relative block w-full min-w-[44px] min-h-[64px] p-0 bg-transparent border-0 pointer-events-auto cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded-full"
            >
              {isPopped ? (
                <div
                  aria-hidden="true"
                  className="relative w-full aspect-[64/76] flex items-center justify-center pointer-events-none"
                >
                  {/* Expanding pop shockwave ring */}
                  <span
                    className="absolute w-10 h-10 rounded-full border-2 animate-balloon-pop-ring"
                    style={{ borderColor: b.color }}
                  />

                  {/* Radial rubber/confetti droplets */}
                  {fragments.map((frag) => {
                    const rad = (frag.angleDeg * Math.PI) / 180;
                    const fx = Math.cos(rad) * frag.distancePx;
                    const fy = Math.sin(rad) * frag.distancePx;
                    return (
                      <span
                        key={frag.id}
                        className="absolute animate-balloon-fragment"
                        style={
                          {
                            width: `${frag.sizePx}px`,
                            height: `${frag.shape === 'shard' ? frag.sizePx * 1.45 : frag.sizePx}px`,
                            backgroundColor: frag.color,
                            borderRadius: frag.shape === 'circle' ? '9999px' : '2px',
                            '--fx': `${fx.toFixed(1)}px`,
                            '--fy': `${fy.toFixed(1)}px`,
                          } as React.CSSProperties
                        }
                      />
                    );
                  })}
                </div>
              ) : (
                <svg
                  viewBox="0 0 64 110"
                  aria-hidden="true"
                  className="w-full h-auto overflow-visible transition-transform duration-150 hover:scale-105 active:scale-95"
                >
                  <defs>
                    <radialGradient
                      id={`bGrad-${runKey}-${b.id}-${gen}`}
                      cx="35%"
                      cy="30%"
                      r="65%"
                    >
                      <stop offset="0%" stopColor={b.highlightColor} />
                      <stop offset="45%" stopColor={b.color} />
                      <stop offset="100%" stopColor={b.color} stopOpacity="0.92" />
                    </radialGradient>
                  </defs>

                  {/* Curly Balloon String */}
                  <path
                    d="M32 76 C27 84, 37 90, 31 98 C27 103, 34 106, 32 110"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.78)"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />

                  {/* Balloon Knot */}
                  <path d="M28 73 L36 73 L32 69 Z" fill={b.color} />

                  {/* Glossy Balloon Body */}
                  <path
                    d="M32 6 C14 6, 4 21, 4 38 C4 56, 20 69, 32 70 C44 69, 60 56, 60 38 C60 21, 50 6, 32 6 Z"
                    fill={`url(#bGrad-${runKey}-${b.id}-${gen})`}
                  />

                  {/* Specular Shine Highlight */}
                  <ellipse
                    cx="20"
                    cy="25"
                    rx="6"
                    ry="12"
                    transform="rotate(-20 20 25)"
                    fill="#ffffff"
                    opacity="0.45"
                  />
                  <circle cx="16" cy="40" r="2.2" fill="#ffffff" opacity="0.38" />
                </svg>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
});
