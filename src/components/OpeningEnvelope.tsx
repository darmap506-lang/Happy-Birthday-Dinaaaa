import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../utils/audio';
import { ENVELOPE_CHIME_SYNC_DELAY_SEC } from '../utils/audioSchedule';
import {
  ENVELOPE_TIMELINE,
  getEnvelopeStateFlags,
  type EnvelopePhase,
} from '../utils/envelopeAnimation';

interface OpeningEnvelopeProps {
  recipientName: string;
  onOpenComplete: () => void;
}

export const OpeningEnvelope: React.FC<OpeningEnvelopeProps> = ({
  recipientName,
  onOpenComplete,
}) => {
  const [phase, setPhase] = useState<EnvelopePhase>('idle');
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const handleOpen = () => {
    if (phase !== 'idle') return;

    setPhase('unsealing');
    sound.playEnvelopeOpen();
    if (!sound.getMuted() && !sound.getIsMusicPlaying()) {
      sound.startMusic({ delaySec: ENVELOPE_CHIME_SYNC_DELAY_SEC });
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setPhase('exiting');
      const quickTimer = window.setTimeout(() => onOpenComplete(), 320);
      timersRef.current.push(quickTimer);
      return;
    }

    const tTop = window.setTimeout(() => setPhase('top'), ENVELOPE_TIMELINE.topOpenAtMs);
    const tBottom = window.setTimeout(() => setPhase('bottom'), ENVELOPE_TIMELINE.bottomOpenAtMs);
    const tRight = window.setTimeout(() => setPhase('right'), ENVELOPE_TIMELINE.rightOpenAtMs);
    const tLeft = window.setTimeout(() => setPhase('left'), ENVELOPE_TIMELINE.leftOpenAtMs);
    const tReveal = window.setTimeout(() => setPhase('revealing'), ENVELOPE_TIMELINE.revealAtMs);
    const tExit = window.setTimeout(() => setPhase('exiting'), ENVELOPE_TIMELINE.exitAtMs);
    const tComplete = window.setTimeout(() => onOpenComplete(), ENVELOPE_TIMELINE.completeAtMs);

    timersRef.current.push(tTop, tBottom, tRight, tLeft, tReveal, tExit, tComplete);
  };

  const {
    isUnsealing,
    isTopOpen,
    isBottomOpen,
    isRightOpen,
    isLeftOpen,
    isRevealing,
    isExiting,
  } = getEnvelopeStateFlags(phase);

  return (
    <div
      data-envelope-phase={phase}
      className={`fixed inset-0 z-20 flex flex-col items-center justify-center p-4 pb-24 sm:pb-4 transition-all duration-700 ease-out ${
        isExiting ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="relative envelope-perspective flex flex-col items-center">
        {/* Soft ambient champagne-rose aura behind the stationery */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-12 rounded-full blur-3xl transition-all duration-1000 ${
            isLeftOpen
              ? 'bg-gradient-to-tr from-pink-200/60 via-amber-100/50 to-rose-200/60 scale-125 opacity-95'
              : 'bg-gradient-to-tr from-pink-200/35 via-rose-100/30 to-amber-100/30 opacity-75'
          }`}
        />

        {/* 4-Sided Unfolding Luxury Stationery Envelope */}
        <button
          type="button"
          onClick={handleOpen}
          aria-label={`Buka amplop ucapan ulang tahun untuk ${recipientName}`}
          className={`luxury-envelope group touch-manipulation focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300/80 focus-visible:ring-offset-4 rounded-2xl select-none ${
            isUnsealing ? 'is-unsealing cursor-default' : ''
          } ${isTopOpen ? 'is-top-open' : ''} ${isBottomOpen ? 'is-bottom-open' : ''} ${
            isRightOpen ? 'is-right-open' : ''
          } ${isLeftOpen ? 'is-left-open' : ''} ${isRevealing ? 'is-revealing' : ''} ${
            isExiting ? 'is-exiting' : ''
          }`}
        >
          <div className="luxury-envelope-body">
            {/* Base Wall & Luxury Patterned Inner Liner */}
            <svg
              viewBox="0 0 352 224"
              className="absolute inset-0 w-full h-full rounded-[16px] overflow-hidden"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="envBasePaper" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fdf0f5" />
                  <stop offset="100%" stopColor="#f8dce7" />
                </linearGradient>
                <linearGradient id="envBaseLiner" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f6cade" />
                  <stop offset="55%" stopColor="#f1b4cd" />
                  <stop offset="100%" stopColor="#e89eba" />
                </linearGradient>
                <pattern id="envBaseLattice" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path
                    d="M 12 0 L 24 12 L 12 24 L 0 12 Z"
                    fill="none"
                    stroke="#fff5eb"
                    strokeWidth="0.7"
                    strokeOpacity="0.45"
                  />
                  <circle cx="12" cy="12" r="1.4" fill="#fde68a" fillOpacity="0.55" />
                </pattern>
              </defs>
              <rect width="352" height="224" rx="16" fill="url(#envBasePaper)" />
              <rect x="8" y="8" width="336" height="208" rx="12" fill="url(#envBaseLiner)" />
              <rect x="8" y="8" width="336" height="208" rx="12" fill="url(#envBaseLattice)" />
              <rect
                x="1"
                y="1"
                width="350"
                height="222"
                rx="15"
                fill="none"
                stroke="rgba(216, 178, 114, 0.42)"
                strokeWidth="1.2"
              />
            </svg>

            {/* Letterpress Invitation Card Resting Inside */}
            <div className="luxury-letter-card">
              <div className="luxury-letter-inner">
                <div
                  className="flex items-center justify-center gap-2 mb-2 text-[#c99b63]"
                  aria-hidden="true"
                >
                  <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#d4a373]/70" />
                  <span className="text-[10px] leading-none">✦</span>
                  <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#d4a373]/70" />
                </div>

                <p className="font-serif-display text-[#880e4f] text-base sm:text-lg md:text-xl font-bold tracking-wide text-center leading-snug">
                  from Darto to Wita 🌸
                </p>

                <div
                  className="mt-2 h-px w-12 bg-gradient-to-r from-transparent via-pink-300/80 to-transparent"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Sisi Kiri (Left Flap - Opens 4th) */}
            <div className="luxury-flap luxury-flap-left" aria-hidden="true">
              <div className="luxury-flap-face luxury-flap-front-y">
                <svg viewBox="0 0 190 224" className="w-full h-full">
                  <defs>
                    <linearGradient id="leftFlapFrontGrad" x1="0" y1="0" x2="1" y2="0.4">
                      <stop offset="0%" stopColor="#fff6f9" />
                      <stop offset="100%" stopColor="#f5d1df" />
                    </linearGradient>
                    <linearGradient id="leftGoldTrim" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#d4a373" stopOpacity="0.35" />
                      <stop offset="50%" stopColor="#f3d89b" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#d4a373" stopOpacity="0.35" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 14 0 Q 0 0 0 14 L 0 210 Q 0 224 14 224 L 172 124 Q 186 112 172 100 Z"
                    fill="url(#leftFlapFrontGrad)"
                  />
                  <path
                    d="M 6 12 L 166 103 Q 178 112 166 121 L 6 212"
                    fill="none"
                    stroke="url(#leftGoldTrim)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="luxury-flap-face luxury-flap-back-y">
                <svg viewBox="0 0 190 224" className="w-full h-full">
                  <defs>
                    <linearGradient id="leftFlapBackGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f7cfe0" />
                      <stop offset="100%" stopColor="#eca6c2" />
                    </linearGradient>
                    <pattern id="leftBackLattice" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path
                        d="M 12 0 L 24 12 L 12 24 L 0 12 Z"
                        fill="none"
                        stroke="#fff5eb"
                        strokeWidth="0.7"
                        strokeOpacity="0.45"
                      />
                      <circle cx="12" cy="12" r="1.4" fill="#fde68a" fillOpacity="0.55" />
                    </pattern>
                  </defs>
                  <path
                    d="M 14 0 Q 0 0 0 14 L 0 210 Q 0 224 14 224 L 172 124 Q 186 112 172 100 Z"
                    fill="url(#leftFlapBackGrad)"
                  />
                  <path
                    d="M 12 8 Q 6 8 6 16 L 6 208 Q 6 216 12 216 L 166 122 Q 178 112 166 102 Z"
                    fill="url(#leftBackLattice)"
                  />
                </svg>
              </div>
            </div>

            {/* Sisi Kanan (Right Flap - Opens 3rd) */}
            <div className="luxury-flap luxury-flap-right" aria-hidden="true">
              <div className="luxury-flap-face luxury-flap-front-y">
                <svg viewBox="0 0 190 224" className="w-full h-full">
                  <defs>
                    <linearGradient id="rightFlapFrontGrad" x1="1" y1="0" x2="0" y2="0.4">
                      <stop offset="0%" stopColor="#fef2f6" />
                      <stop offset="100%" stopColor="#f2c6d7" />
                    </linearGradient>
                    <linearGradient id="rightGoldTrim" x1="1" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d4a373" stopOpacity="0.35" />
                      <stop offset="50%" stopColor="#f3d89b" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#d4a373" stopOpacity="0.35" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 176 0 Q 190 0 190 14 L 190 210 Q 190 224 176 224 L 18 124 Q 4 112 18 100 Z"
                    fill="url(#rightFlapFrontGrad)"
                  />
                  <path
                    d="M 184 12 L 24 103 Q 12 112 24 121 L 184 212"
                    fill="none"
                    stroke="url(#rightGoldTrim)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="luxury-flap-face luxury-flap-back-y">
                <svg viewBox="0 0 190 224" className="w-full h-full">
                  <defs>
                    <linearGradient id="rightFlapBackGrad" x1="1" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f7cfe0" />
                      <stop offset="100%" stopColor="#eca6c2" />
                    </linearGradient>
                    <pattern id="rightBackLattice" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path
                        d="M 12 0 L 24 12 L 12 24 L 0 12 Z"
                        fill="none"
                        stroke="#fff5eb"
                        strokeWidth="0.7"
                        strokeOpacity="0.45"
                      />
                      <circle cx="12" cy="12" r="1.4" fill="#fde68a" fillOpacity="0.55" />
                    </pattern>
                  </defs>
                  <path
                    d="M 176 0 Q 190 0 190 14 L 190 210 Q 190 224 176 224 L 18 124 Q 4 112 18 100 Z"
                    fill="url(#rightFlapBackGrad)"
                  />
                  <path
                    d="M 178 8 Q 184 8 184 16 L 184 208 Q 184 216 178 216 L 24 122 Q 12 112 24 102 Z"
                    fill="url(#rightBackLattice)"
                  />
                </svg>
              </div>
            </div>

            {/* Sisi Bawah (Bottom Flap - Opens 2nd) */}
            <div className="luxury-flap luxury-flap-bottom" aria-hidden="true">
              <div className="luxury-flap-face luxury-flap-front-x">
                <svg viewBox="0 0 352 138" className="w-full h-full">
                  <defs>
                    <linearGradient id="bottomFlapFrontGrad" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#f5cfe0" />
                      <stop offset="55%" stopColor="#fce8f0" />
                      <stop offset="100%" stopColor="#fff7fa" />
                    </linearGradient>
                    <linearGradient id="bottomGoldTrim" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#d8b272" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#f2d694" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#d8b272" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 124 Q 0 138 14 138 L 338 138 Q 352 138 352 124 L 194 16 Q 176 4 158 16 Z"
                    fill="url(#bottomFlapFrontGrad)"
                  />
                  <path
                    d="M 10 128 L 160 21 Q 176 10 192 21 L 342 128"
                    fill="none"
                    stroke="url(#bottomGoldTrim)"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="luxury-flap-face luxury-flap-back-x">
                <svg viewBox="0 0 352 138" className="w-full h-full">
                  <defs>
                    <linearGradient id="bottomFlapBackGrad" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f7cfe0" />
                      <stop offset="100%" stopColor="#eca6c2" />
                    </linearGradient>
                    <pattern id="bottomBackLattice" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path
                        d="M 12 0 L 24 12 L 12 24 L 0 12 Z"
                        fill="none"
                        stroke="#fff5eb"
                        strokeWidth="0.7"
                        strokeOpacity="0.45"
                      />
                      <circle cx="12" cy="12" r="1.4" fill="#fde68a" fillOpacity="0.55" />
                    </pattern>
                  </defs>
                  <path
                    d="M 0 124 Q 0 138 14 138 L 338 138 Q 352 138 352 124 L 194 16 Q 176 4 158 16 Z"
                    fill="url(#bottomFlapBackGrad)"
                  />
                  <path
                    d="M 8 126 Q 8 132 16 132 L 336 132 Q 344 132 344 126 L 192 20 Q 176 9 160 20 Z"
                    fill="url(#bottomBackLattice)"
                  />
                </svg>
              </div>
            </div>

            {/* Sisi Atas (Top Flap - Opens 1st) */}
            <div className="luxury-flap luxury-flap-top" aria-hidden="true">
              <div className="luxury-flap-face luxury-flap-front-x">
                <svg viewBox="0 0 352 138" className="w-full h-full">
                  <defs>
                    <linearGradient id="topFlapFrontGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fff8fa" />
                      <stop offset="65%" stopColor="#fbe3ec" />
                      <stop offset="100%" stopColor="#f4c7d8" />
                    </linearGradient>
                    <linearGradient id="topGoldTrim" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#d4a373" stopOpacity="0.35" />
                      <stop offset="50%" stopColor="#f3d89b" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#d4a373" stopOpacity="0.35" />
                    </linearGradient>
                    <linearGradient id="topSheenSweep" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                      <stop offset="50%" stopColor="#ffffff" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 12 Q 0 0 14 0 L 338 0 Q 352 0 352 12 L 194 122 Q 176 134 158 122 Z"
                    fill="url(#topFlapFrontGrad)"
                  />
                  <path
                    d="M 12 6 L 160 113 Q 176 124 192 113 L 340 6"
                    fill="none"
                    stroke="url(#topGoldTrim)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="14"
                    y1="1"
                    x2="338"
                    y2="1"
                    stroke="#ffffff"
                    strokeOpacity="0.7"
                    strokeWidth="1"
                  />
                  <path
                    className="luxury-flap-sheen"
                    d="M 0 12 Q 0 0 14 0 L 338 0 Q 352 0 352 12 L 194 122 Q 176 134 158 122 Z"
                    fill="url(#topSheenSweep)"
                  />
                </svg>
              </div>
              <div className="luxury-flap-face luxury-flap-back-x">
                <svg viewBox="0 0 352 138" className="w-full h-full">
                  <defs>
                    <linearGradient id="topFlapBackGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f7cfe0" />
                      <stop offset="100%" stopColor="#eca6c2" />
                    </linearGradient>
                    <pattern id="topBackLattice" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path
                        d="M 12 0 L 24 12 L 12 24 L 0 12 Z"
                        fill="none"
                        stroke="#fff5eb"
                        strokeWidth="0.7"
                        strokeOpacity="0.45"
                      />
                      <circle cx="12" cy="12" r="1.4" fill="#fde68a" fillOpacity="0.55" />
                    </pattern>
                  </defs>
                  <path
                    d="M 0 12 Q 0 0 14 0 L 338 0 Q 352 0 352 12 L 194 122 Q 176 134 158 122 Z"
                    fill="url(#topFlapBackGrad)"
                  />
                  <path
                    d="M 8 10 Q 8 4 16 4 L 336 4 Q 344 4 344 10 L 192 117 Q 176 128 160 117 Z"
                    fill="url(#topBackLattice)"
                  />
                </svg>
              </div>
            </div>

            {/* Sculpted Velvet-Rose & Gold Wax Seal */}
            <div className="luxury-wax-seal" aria-hidden="true">
              <span className="luxury-seal-ring" />
              <svg
                viewBox="0 0 64 64"
                className="w-full h-full drop-shadow-[0_6px_12px_rgba(136,14,79,0.32)]"
              >
                <defs>
                  <radialGradient id="waxBodyGrad" cx="38%" cy="32%" r="68%">
                    <stop offset="0%" stopColor="#e11d74" />
                    <stop offset="52%" stopColor="#be185d" />
                    <stop offset="100%" stopColor="#831843" />
                  </radialGradient>
                  <radialGradient id="waxInnerWell" cx="45%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#9d174d" />
                    <stop offset="100%" stopColor="#be185d" />
                  </radialGradient>
                  <linearGradient id="sealGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
                <path
                  d="M 32 4 C 38 4, 42 7, 46 8 C 51 9, 55 13, 56 18 C 57 22, 60 27, 60 32 C 60 37, 57 42, 56 46 C 54 51, 50 55, 45 56 C 41 57, 37 60, 32 60 C 27 60, 22 57, 18 56 C 13 54, 9 50, 8 45 C 7 41, 4 37, 4 32 C 4 27, 7 22, 8 18 C 10 13, 14 9, 19 8 C 23 7, 27 4, 32 4 Z"
                  fill="url(#waxBodyGrad)"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="19.5"
                  fill="url(#waxInnerWell)"
                  stroke="url(#sealGold)"
                  strokeWidth="1.2"
                  strokeOpacity="0.85"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="16.5"
                  fill="none"
                  stroke="#fce7f3"
                  strokeOpacity="0.22"
                  strokeWidth="0.7"
                />
                <g transform="translate(32, 32)" fill="url(#sealGold)">
                  <path d="M 0 -10.5 C 3 -8.5, 3.6 -4, 0 -1.5 C -3.6 -4, -3 -8.5, 0 -10.5 Z" />
                  <path
                    d="M 0 -10.5 C 3 -8.5, 3.6 -4, 0 -1.5 C -3.6 -4, -3 -8.5, 0 -10.5 Z"
                    transform="rotate(72)"
                  />
                  <path
                    d="M 0 -10.5 C 3 -8.5, 3.6 -4, 0 -1.5 C -3.6 -4, -3 -8.5, 0 -10.5 Z"
                    transform="rotate(144)"
                  />
                  <path
                    d="M 0 -10.5 C 3 -8.5, 3.6 -4, 0 -1.5 C -3.6 -4, -3 -8.5, 0 -10.5 Z"
                    transform="rotate(216)"
                  />
                  <path
                    d="M 0 -10.5 C 3 -8.5, 3.6 -4, 0 -1.5 C -3.6 -4, -3 -8.5, 0 -10.5 Z"
                    transform="rotate(288)"
                  />
                  <circle cx="0" cy="0" r="2.3" fill="#fef3c7" />
                </g>
                <path
                  d="M 16 14 Q 24 8 34 9"
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.35"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
