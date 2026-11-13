import React, { memo } from 'react';

interface VectorCakeProps {
  candlesBlown: boolean;
  isBlowing: boolean;
  onBlow: () => void;
}

export const VectorCake: React.FC<VectorCakeProps> = memo(({
  candlesBlown,
  isBlowing,
  onBlow,
}) => {
  return (
    <div
      onClick={onBlow}
      className={`relative inline-flex flex-col items-center select-none cursor-pointer group transition-transform duration-300 ${
        !candlesBlown ? 'hover:scale-105 active:scale-95' : ''
      }`}
      title={candlesBlown ? 'Kue Ulang Tahun' : 'Ketuk kue untuk meniup lilin'}
    >
      {/* Dynamic Wind Gust Animation Overlay (Tiupan Angin - Tebal & Jelas) */}
      {isBlowing && (
        <div className="absolute inset-0 -inset-x-12 -inset-y-4 pointer-events-none z-30 overflow-visible">
          {/* Main Thick Wind Swoosh Curves */}
          <svg
            viewBox="0 0 260 170"
            className="w-full h-full animate-wind-stream drop-shadow-[0_0_12px_rgba(255,255,255,1)] drop-shadow-[0_0_20px_rgba(186,230,253,0.9)]"
            fill="none"
          >
            {/* Outer Thick Wind Glow Stream 1 */}
            <path
              d="M-30 42 C30 22, 75 52, 120 34 C165 18, 195 38, 245 26"
              stroke="url(#windGradThick)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Bright Core Wind Stream 1 */}
            <path
              d="M-25 42 C30 22, 75 52, 120 34 C165 18, 195 38, 240 26"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.95"
            />

            {/* Wind swirl loop 1 (Thickened) */}
            <path
              d="M110 36 C124 20, 142 25, 136 42 C129 55, 112 50, 118 36"
              stroke="url(#windGradThick)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <path
              d="M110 36 C124 20, 142 25, 136 42 C129 55, 112 50, 118 36"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* Outer Thick Wind Stream 2 (Middle) */}
            <path
              d="M-45 66 C15 48, 65 76, 125 56 C175 38, 210 58, 255 44"
              stroke="url(#windGradThick)"
              strokeWidth="8.5"
              strokeLinecap="round"
            />
            {/* Bright Core Wind Stream 2 */}
            <path
              d="M-40 66 C15 48, 65 76, 125 56 C175 38, 210 58, 250 44"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              opacity="0.95"
            />

            {/* Thick Wind Stream 3 (Top Near Candle Flames) */}
            <path
              d="M-20 22 C35 12, 85 28, 135 16 C180 6, 215 22, 255 12"
              stroke="url(#windGradThick)"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            <path
              d="M-15 22 C35 12, 85 28, 135 16 C180 6, 215 22, 250 12"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* Wind swirl loop 2 (Near top flame) */}
            <path
              d="M142 16 C154 4, 170 8, 164 22 C158 32, 145 28, 149 18"
              stroke="url(#windGradThick)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Thick Wind Stream 4 (Lower Body) */}
            <path
              d="M-30 92 C30 76, 80 102, 140 84 C185 68, 220 86, 255 74"
              stroke="url(#windGradThick)"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Wind Air Puffs & Sparkle Elements */}
            <circle cx="50" cy="30" r="4" fill="#ffffff" opacity="0.95" />
            <circle cx="70" cy="50" r="3.5" fill="#bae6fd" opacity="0.9" />
            <circle cx="155" cy="52" r="3.5" fill="#ffffff" opacity="0.95" />
            <circle cx="195" cy="24" r="4.5" fill="#ffffff" opacity="0.9" />
            <circle cx="225" cy="46" r="3" fill="#bae6fd" opacity="0.85" />

            <defs>
              <linearGradient id="windGradThick" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="15%" stopColor="#bae6fd" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="85%" stopColor="#7dd3fc" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fbcfe8" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* Vector Cake SVG */}
      <div
        className={`w-36 sm:w-44 transition-transform duration-500 ${
          isBlowing
            ? 'animate-wind-sway'
            : !candlesBlown
            ? 'animate-cake-float'
            : 'scale-100'
        }`}
      >
        <svg
          viewBox="0 0 200 170"
          className="w-full h-auto drop-shadow-[0_8px_16px_rgba(219,39,119,0.18)]"
        >
          <defs>
            {/* Cake tier gradients */}
            <linearGradient id="plateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>

            <linearGradient id="tier1Grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffb3c6" />
              <stop offset="50%" stopColor="#ffccd5" />
              <stop offset="100%" stopColor="#ff85a1" />
            </linearGradient>

            <linearGradient id="tier2Grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffc2d1" />
              <stop offset="50%" stopColor="#ffe5ec" />
              <stop offset="100%" stopColor="#ff9ebb" />
            </linearGradient>

            <linearGradient id="creamDripGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="85%" stopColor="#fff0f5" />
              <stop offset="100%" stopColor="#fde2e4" />
            </linearGradient>

            <linearGradient id="flameOuter" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff3d00" />
              <stop offset="40%" stopColor="#ff9100" />
              <stop offset="100%" stopColor="#ffea00" />
            </linearGradient>

            <linearGradient id="flameInner" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fff176" />
            </linearGradient>

            {/* Candle striped patterns */}
            <pattern id="stripePink" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#f43f5e" strokeWidth="4" />
              <line x1="4" y1="0" x2="4" y2="8" stroke="#ffffff" strokeWidth="4" />
            </pattern>
            <pattern id="stripeTeal" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#06b6d4" strokeWidth="4" />
              <line x1="4" y1="0" x2="4" y2="8" stroke="#ffffff" strokeWidth="4" />
            </pattern>
            <pattern id="stripeGold" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" strokeWidth="4" />
              <line x1="4" y1="0" x2="4" y2="8" stroke="#ffffff" strokeWidth="4" />
            </pattern>
          </defs>

          {/* 1. Cake Plate Stand */}
          <ellipse cx="100" cy="144" rx="76" ry="12" fill="#000000" opacity="0.08" />
          <ellipse cx="100" cy="142" rx="74" ry="12" fill="url(#plateGrad)" stroke="#fbcfe8" strokeWidth="2.5" />
          <ellipse cx="100" cy="140" rx="66" ry="9" fill="#ffffff" />

          {/* 2. Bottom Tier (Tier 1) */}
          <path
            d="M38 102 C38 102 38 134 38 134 C38 141 162 141 162 134 L162 102 Z"
            fill="url(#tier1Grad)"
          />
          {/* Bottom Tier shadow line */}
          <path
            d="M38 126 C55 133 145 133 162 126 L162 134 C162 141 38 141 38 134 Z"
            fill="#f43f5e"
            opacity="0.15"
          />

          {/* Bottom Tier Dripping White Frosting */}
          <path
            d="M38 102 C44 116 52 116 58 104 C64 118 74 118 82 105 C90 120 100 120 110 104 C118 118 126 118 134 105 C142 117 150 117 162 102 L162 96 C162 90 38 90 38 96 Z"
            fill="url(#creamDripGrad)"
            stroke="#fce7f3"
            strokeWidth="1"
          />

          {/* Colorful Sprinkles on Bottom Tier */}
          <circle cx="50" cy="120" r="2.2" fill="#38bdf8" />
          <circle cx="75" cy="124" r="2.5" fill="#facc15" />
          <circle cx="102" cy="122" r="2.2" fill="#ec4899" />
          <circle cx="126" cy="125" r="2.4" fill="#a855f7" />
          <circle cx="150" cy="119" r="2.2" fill="#4ade80" />
          <circle cx="88" cy="115" r="1.8" fill="#fb923c" />
          <circle cx="138" cy="114" r="1.8" fill="#f43f5e" />

          {/* 3. Top Tier (Tier 2) */}
          <path
            d="M58 68 C58 68 58 98 58 98 C58 104 142 104 142 98 L142 68 Z"
            fill="url(#tier2Grad)"
          />
          {/* Top Tier shadow line */}
          <path
            d="M58 92 C72 98 128 98 142 92 L142 98 C142 104 58 104 58 98 Z"
            fill="#f43f5e"
            opacity="0.15"
          />

          {/* Top Tier Dripping Strawberry/Vanilla Cream */}
          <path
            d="M58 68 C64 80 72 80 78 70 C84 82 92 82 100 69 C108 82 116 82 124 71 C130 81 136 81 142 68 L142 62 C142 57 58 57 58 62 Z"
            fill="url(#creamDripGrad)"
            stroke="#fce7f3"
            strokeWidth="1"
          />

          {/* Fresh Strawberries on Top Tier */}
          {/* Strawberry Left */}
          <g transform="translate(68, 52) scale(0.85)">
            <path d="M10 0 C4 0 0 7 2 13 C4 18 10 22 10 22 C10 22 16 18 18 13 C20 7 16 0 10 0 Z" fill="#e11d48" />
            <path d="M10 0 L10 4 M6 2 L10 5 L14 2" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
            <circle cx="7" cy="8" r="0.8" fill="#fef08a" />
            <circle cx="12" cy="10" r="0.8" fill="#fef08a" />
            <circle cx="9" cy="14" r="0.8" fill="#fef08a" />
          </g>

          {/* Strawberry Center */}
          <g transform="translate(90, 48) scale(0.95)">
            <path d="M10 0 C4 0 0 7 2 13 C4 18 10 22 10 22 C10 22 16 18 18 13 C20 7 16 0 10 0 Z" fill="#e11d48" />
            <path d="M10 0 L10 4 M6 2 L10 5 L14 2" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
            <circle cx="6" cy="7" r="0.8" fill="#fef08a" />
            <circle cx="13" cy="9" r="0.8" fill="#fef08a" />
            <circle cx="9" cy="13" r="0.8" fill="#fef08a" />
          </g>

          {/* Strawberry Right */}
          <g transform="translate(114, 52) scale(0.85)">
            <path d="M10 0 C4 0 0 7 2 13 C4 18 10 22 10 22 C10 22 16 18 18 13 C20 7 16 0 10 0 Z" fill="#e11d48" />
            <path d="M10 0 L10 4 M6 2 L10 5 L14 2" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
            <circle cx="7" cy="8" r="0.8" fill="#fef08a" />
            <circle cx="12" cy="10" r="0.8" fill="#fef08a" />
            <circle cx="9" cy="14" r="0.8" fill="#fef08a" />
          </g>

          {/* 4. Three Stylized Birthday Candles */}
          {/* Candle 1 (Left - Pink Stripes) */}
          <g transform="translate(74, 28)">
            <rect x="0" y="8" width="6" height="22" rx="1.5" fill="url(#stripePink)" stroke="#fb7185" strokeWidth="0.8" />
            {/* Wick */}
            <path d="M3 8 L3 3" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

            {/* Candle Flame / Smoke */}
            {!candlesBlown ? (
              <g
                className={`transition-all duration-300 origin-bottom ${
                  isBlowing
                    ? 'rotate-[35deg] skew-x-12 translate-x-1.5 opacity-80'
                    : 'animate-candle-flame'
                }`}
                style={{ animationDelay: '0s' }}
              >
                {/* Outer Glow */}
                <circle cx="3" cy="-4" r="9" fill="#ffb703" opacity="0.35" filter="blur(3px)" />
                {/* Outer Flame */}
                <path
                  d="M3 -11 C-1 -6, -0.5 -1, 3 1 C6.5 -1, 7 -6, 3 -11 Z"
                  fill="url(#flameOuter)"
                />
                {/* Inner Flame */}
                <path
                  d="M3 -7 C1 -4, 1.5 -1, 3 0.5 C4.5 -1, 5 -4, 3 -7 Z"
                  fill="url(#flameInner)"
                />
              </g>
            ) : (
              /* Smoke Wisp */
              <g className="animate-smoke-wisp origin-bottom">
                <path
                  d="M3 2 C0 -3, 6 -7, 2 -13 C-1 -18, 5 -22, 1 -26"
                  stroke="#94a3b8"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.75"
                />
              </g>
            )}
          </g>

          {/* Candle 2 (Center - Gold Stripes, Taller) */}
          <g transform="translate(97, 22)">
            <rect x="0" y="8" width="6.5" height="26" rx="1.5" fill="url(#stripeGold)" stroke="#f59e0b" strokeWidth="0.8" />
            {/* Wick */}
            <path d="M3.25 8 L3.25 3" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

            {/* Candle Flame / Smoke */}
            {!candlesBlown ? (
              <g
                className={`transition-all duration-300 origin-bottom ${
                  isBlowing
                    ? 'rotate-[40deg] skew-x-12 translate-x-2 opacity-80'
                    : 'animate-candle-flame'
                }`}
                style={{ animationDelay: '0.2s' }}
              >
                {/* Outer Glow */}
                <circle cx="3.25" cy="-5" r="11" fill="#ffb703" opacity="0.4" filter="blur(3px)" />
                {/* Outer Flame */}
                <path
                  d="M3.25 -13 C-1.5 -7, -1 -1, 3.25 1 C7.5 -1, 8 -7, 3.25 -13 Z"
                  fill="url(#flameOuter)"
                />
                {/* Inner Flame */}
                <path
                  d="M3.25 -8 C1 -4.5, 1.5 -1, 3.25 0.5 C5 -1, 5.5 -4.5, 3.25 -8 Z"
                  fill="url(#flameInner)"
                />
              </g>
            ) : (
              /* Smoke Wisp */
              <g className="animate-smoke-wisp origin-bottom" style={{ animationDelay: '0.1s' }}>
                <path
                  d="M3.25 2 C6 -4, 0 -8, 4 -15 C8 -20, 2 -25, 5 -30"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.8"
                />
              </g>
            )}
          </g>

          {/* Candle 3 (Right - Teal Stripes) */}
          <g transform="translate(120, 28)">
            <rect x="0" y="8" width="6" height="22" rx="1.5" fill="url(#stripeTeal)" stroke="#06b6d4" strokeWidth="0.8" />
            {/* Wick */}
            <path d="M3 8 L3 3" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

            {/* Candle Flame / Smoke */}
            {!candlesBlown ? (
              <g
                className={`transition-all duration-300 origin-bottom ${
                  isBlowing
                    ? 'rotate-[32deg] skew-x-12 translate-x-1.5 opacity-80'
                    : 'animate-candle-flame'
                }`}
                style={{ animationDelay: '0.4s' }}
              >
                {/* Outer Glow */}
                <circle cx="3" cy="-4" r="9" fill="#ffb703" opacity="0.35" filter="blur(3px)" />
                {/* Outer Flame */}
                <path
                  d="M3 -11 C-1 -6, -0.5 -1, 3 1 C6.5 -1, 7 -6, 3 -11 Z"
                  fill="url(#flameOuter)"
                />
                {/* Inner Flame */}
                <path
                  d="M3 -7 C1 -4, 1.5 -1, 3 0.5 C4.5 -1, 5 -4, 3 -7 Z"
                  fill="url(#flameInner)"
                />
              </g>
            ) : (
              /* Smoke Wisp */
              <g className="animate-smoke-wisp origin-bottom" style={{ animationDelay: '0.2s' }}>
                <path
                  d="M3 2 C-1 -3, 5 -7, 1 -13 C-2 -18, 4 -22, 0 -26"
                  stroke="#94a3b8"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.75"
                />
              </g>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
});
