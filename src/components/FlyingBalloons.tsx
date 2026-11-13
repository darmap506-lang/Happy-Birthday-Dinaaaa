import React, { memo, useMemo } from 'react';
import { generateBalloons } from '../utils/balloons';

interface FlyingBalloonsProps {
  runKey: number;
  count?: number;
}

export const FlyingBalloons: React.FC<FlyingBalloonsProps> = memo(({
  runKey,
  count = 16,
}) => {
  const balloons = useMemo(() => generateBalloons(count, runKey), [count, runKey]);

  return (
    <div
      key={runKey}
      data-testid="flying-balloons"
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none select-none z-[1]"
    >
      {balloons.map((b) => (
        <div
          key={`${runKey}-${b.id}`}
          className="absolute -bottom-36 animate-balloon-rise"
          style={
            {
              left: `${b.leftPercent}%`,
              width: `${b.width}px`,
              animationDuration: `${b.durationSec}s`,
              animationDelay: `${b.delaySec}s`,
              '--balloon-sway': `${b.swayPx}px`,
              '--balloon-tilt': `${b.tiltDeg}deg`,
            } as React.CSSProperties
          }
        >
          <svg
            viewBox="0 0 64 110"
            className="w-full h-auto overflow-visible"
          >
            <defs>
              <radialGradient id={`bGrad-${runKey}-${b.id}`} cx="35%" cy="30%" r="65%">
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
            <path
              d="M28 73 L36 73 L32 69 Z"
              fill={b.color}
            />

            {/* Glossy Balloon Body */}
            <path
              d="M32 6 C14 6, 4 21, 4 38 C4 56, 20 69, 32 70 C44 69, 60 56, 60 38 C60 21, 50 6, 32 6 Z"
              fill={`url(#bGrad-${runKey}-${b.id})`}
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
        </div>
      ))}
    </div>
  );
});
