import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ConfettiCanvas } from './ConfettiCanvas';
import { sound } from '../utils/audio';
import { ENVELOPE_CHIME_SYNC_DELAY_SEC } from '../utils/audioSchedule';
import {
  ConfettiPopperPhase,
  POPPER_TIMELINE,
  PULL_THRESHOLD_PX,
  clampPullDistance,
  generatePopperStreamers,
  getPopperOpeningText,
  getPullProgress,
  shouldTriggerPop,
} from '../utils/confettiPopper';

interface OpeningConfettiProps {
  onOpenComplete: () => void;
}

export const OpeningConfetti: React.FC<OpeningConfettiProps> = ({ onOpenComplete }) => {
  const [phase, setPhase] = useState<ConfettiPopperPhase>('idle');
  const [pullPx, setPullPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hintNudgeSeq, setHintNudgeSeq] = useState(0);
  const [showPullHint, setShowPullHint] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const dragStartYRef = useRef<number | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const pullPxRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const streamers = useMemo(() => generatePopperStreamers(24), []);
  const openingText = useMemo(() => getPopperOpeningText(), []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const triggerPop = () => {
    if (phase !== 'idle') return;

    dragStartYRef.current = null;
    activePointerIdRef.current = null;
    setIsDragging(false);
    setShowPullHint(false);
    setPullPx(0);
    pullPxRef.current = 0;

    setPhase('popping');
    setConfettiKey((k) => k + 1);
    sound.playConfettiPop();

    if (!sound.getMuted() && !sound.getIsMusicPlaying()) {
      sound.startMusic({ delaySec: ENVELOPE_CHIME_SYNC_DELAY_SEC });
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setPhase('revealed');
      const tExitFast = window.setTimeout(() => setPhase('exiting'), 1600);
      const tDoneFast = window.setTimeout(() => onOpenComplete(), 1950);
      timersRef.current.push(tExitFast, tDoneFast);
      return;
    }

    const tBanner = window.setTimeout(() => setPhase('revealed'), POPPER_TIMELINE.bannerAtMs);
    const tExit = window.setTimeout(() => setPhase('exiting'), POPPER_TIMELINE.exitAtMs);
    const tComplete = window.setTimeout(() => onOpenComplete(), POPPER_TIMELINE.completeAtMs);
    timersRef.current.push(tBanner, tExit, tComplete);
  };

  const triggerPullNudge = () => {
    if (phase !== 'idle') return;
    setShowPullHint(true);
    setHintNudgeSeq((s) => s + 1);
    sound.playSparkle();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (phase !== 'idle') return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointerIdRef.current = e.pointerId;
    dragStartYRef.current = e.clientY;
    setIsDragging(true);
    setShowPullHint(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (
      phase !== 'idle' ||
      !isDragging ||
      dragStartYRef.current === null ||
      activePointerIdRef.current !== e.pointerId
    ) {
      return;
    }

    const nextPull = clampPullDistance(e.clientY - dragStartYRef.current);
    pullPxRef.current = nextPull;
    setPullPx(nextPull);

    if (shouldTriggerPop(nextPull)) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore if already released
      }
      triggerPop();
    }
  };

  const finishDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    const currentPull = pullPxRef.current;
    dragStartYRef.current = null;
    activePointerIdRef.current = null;
    setIsDragging(false);

    if (phase === 'idle') {
      if (shouldTriggerPop(currentPull)) {
        triggerPop();
      } else {
        if (currentPull < 14) {
          triggerPullNudge();
        }
        pullPxRef.current = 0;
        setPullPx(0);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (phase !== 'idle') return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setPullPx(PULL_THRESHOLD_PX);
      pullPxRef.current = PULL_THRESHOLD_PX;
      window.setTimeout(() => triggerPop(), 120);
    }
  };

  const progress = getPullProgress(pullPx);
  const isPopped = phase !== 'idle';
  const isRevealed = phase === 'revealed' || phase === 'exiting';
  const isExiting = phase === 'exiting';

  return (
    <div
      data-testid="opening-confetti"
      data-popper-phase={phase}
      className={`fixed inset-0 z-20 flex flex-col items-center justify-center px-3 pt-14 pb-20 min-[390px]:px-4 min-[390px]:pb-24 sm:p-6 sm:pb-8 overflow-y-auto overscroll-contain transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isExiting ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Fullscreen celebratory confetti canvas triggered when string is pulled */}
      <ConfettiCanvas triggerKey={confettiKey} />

      <div className="relative flex flex-col items-center justify-center w-full max-w-[360px]">
        {/* Ambient Pearl-Blush & Champagne Halo */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-12 rounded-full blur-3xl transition-all duration-1000 ease-out ${
            isPopped
              ? 'bg-gradient-to-tr from-rose-200/65 via-amber-100/60 to-pink-200/65 scale-125 opacity-100'
              : 'bg-gradient-to-tr from-rose-200/40 via-amber-50/45 to-pink-100/40 opacity-80'
          }`}
        />

        {/* Instruction Caption Above Popper (visible before pop) */}
        {!isPopped && (
          <div className="relative z-10 mb-3.5 text-center select-none">
            <p
              className={`font-serif-display text-sm sm:text-[15px] tracking-wide transition-colors duration-300 ${
                showPullHint ? 'text-[#9d174d] font-semibold' : 'text-[#880e4f]/85 font-medium'
              }`}
            >
              {showPullHint
                ? 'Tarik talinya perlahan ke bawah ↓'
                : progress > 0.12
                ? `Tarik ke bawah... ${Math.round(progress * 100)}%`
                : 'Tarik tali di bawah untuk membuka'}
            </p>
          </div>
        )}

        {/* Confetti Popper Stage (Champagne & Rose-Gold Cone + Streamers + Silk Ribbon) */}
        <div
          className={`relative flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isRevealed
              ? 'scale-[0.72] -translate-y-5 opacity-20 pointer-events-none'
              : 'scale-100 opacity-100'
          }`}
        >
          {/* Champagne Shimmer Pulse + Erupting Metallic Streamers from Popper Rim */}
          {isPopped && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[34px] z-20 -translate-x-1/2"
            >
              <span className="animate-popper-rim-shimmer block -ml-10 -mt-3 w-20 h-6 rounded-full border border-[#e6be7e]/80" />
              {streamers.map((s) => {
                const rad = ((s.angleDeg - 90) * Math.PI) / 180;
                const tx = Math.cos(rad) * s.distancePx;
                const ty = Math.sin(rad) * s.distancePx;

                return (
                  <span
                    key={s.id}
                    className="popper-streamer"
                    style={
                      {
                        width: `${s.widthPx}px`,
                        height: `${s.heightPx}px`,
                        backgroundColor: s.color,
                        boxShadow: '0 1px 4px rgba(136, 14, 79, 0.12)',
                        borderRadius:
                          s.shape === 'circle' || s.shape === 'ribbon' ? '9999px' : '1.5px',
                        animationDelay: `${s.delayMs}ms`,
                        '--sx': `${tx.toFixed(1)}px`,
                        '--sy': `${ty.toFixed(1)}px`,
                        '--srot': `${s.rotateDeg}deg`,
                      } as React.CSSProperties
                    }
                  />
                );
              })}
            </div>
          )}

          {/* Luxury Ivory-Pearl & Champagne-Foil Popper Cone */}
          <div
            key={`cone-nudge-${hintNudgeSeq}`}
            onClick={triggerPullNudge}
            role="presentation"
            className={`relative z-10 cursor-pointer select-none ${
              isDragging
                ? 'transition-none'
                : 'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'
            } ${hintNudgeSeq > 0 && !isPopped ? 'animate-popper-wiggle' : ''}`}
            style={{
              transform: !isPopped
                ? `scale(${1 + progress * 0.032}, ${1 - progress * 0.04}) rotate(${
                    isDragging ? (progress * 2.2 - 1.1).toFixed(2) : 0
                  }deg)`
                : undefined,
            }}
          >
            <svg
              viewBox="0 0 180 184"
              className={`w-[138px] min-[360px]:w-[152px] min-[390px]:w-[166px] sm:w-[182px] h-auto overflow-visible drop-shadow-[0_18px_28px_rgba(136,14,79,0.16)] ${
                !isDragging && !isPopped ? 'animate-popper-float' : ''
              }`}
              aria-hidden="true"
            >
              <defs>
                {/* Pearl Ivory & Satin Rose Body Gradient (3D cylindrical shading) */}
                <linearGradient id="popperBodyGrad" x1="0" y1="0" x2="1" y2="0.2">
                  <stop offset="0%" stopColor="#fffdf9" />
                  <stop offset="32%" stopColor="#fff5f7" />
                  <stop offset="68%" stopColor="#fce7f3" />
                  <stop offset="100%" stopColor="#f5c2d7" />
                </linearGradient>

                {/* Brushed Champagne Gold Foil Gradient */}
                <linearGradient id="popperGoldGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f9ebc7" />
                  <stop offset="38%" stopColor="#e6be7e" />
                  <stop offset="72%" stopColor="#d4a373" />
                  <stop offset="100%" stopColor="#b8844c" />
                </linearGradient>

                {/* Velvet Dusty Rose Ribbon Gradient */}
                <linearGradient id="popperRoseRibbonGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="55%" stopColor="#db2777" />
                  <stop offset="100%" stopColor="#9d174d" />
                </linearGradient>

                {/* Pearl Enamel Wax Seal Cap Gradient */}
                <radialGradient id="popperCapGrad" cx="42%" cy="32%" r="72%">
                  <stop offset="0%" stopColor="#fffdf9" />
                  <stop offset="58%" stopColor="#fce7f3" />
                  <stop offset="100%" stopColor="#eab8ce" />
                </radialGradient>

                <clipPath id="coneClip">
                  <path d="M 40 48 L 140 48 L 95 162 Q 90 172 85 162 Z" />
                </clipPath>
              </defs>

              {/* Subtle Editorial Starlight Accents (clean champagne & rose glints) */}
              <g className={`transition-opacity duration-500 ${isPopped ? 'opacity-0' : 'opacity-85'}`}>
                <path
                  d="M 24 72 L 26 65 L 28 72 L 35 74 L 28 76 L 26 83 L 24 76 L 17 74 Z"
                  fill="url(#popperGoldGrad)"
                />
                <path
                  d="M 154 64 L 155.8 59 L 157.6 64 L 162.6 65.8 L 157.6 67.6 L 155.8 72.6 L 154 67.6 L 149 65.8 Z"
                  fill="#db2777"
                  opacity="0.7"
                />
                <circle cx="34" cy="116" r="2.2" fill="#e6be7e" opacity="0.85" />
                <circle cx="148" cy="112" r="2" fill="#db2777" opacity="0.45" />
              </g>

              {/* Top Pearl & Champagne Confetti Lid (lifts smoothly when pulled) */}
              <g
                className={isPopped ? 'animate-cap-fly-away' : ''}
                style={{ transformOrigin: '90px 45px' }}
              >
                {/* Soft Foil Confetti Petals Nestled Under Rim */}
                <circle cx="67" cy="41" r="4.5" fill="#f3d89b" opacity="0.9" />
                <circle cx="81" cy="37" r="5" fill="#fbcfe8" opacity="0.95" />
                <circle cx="99" cy="37" r="4.8" fill="#e6be7e" opacity="0.92" />
                <circle cx="113" cy="41" r="4.2" fill="#f472b6" opacity="0.8" />
                <rect
                  x="86"
                  y="30"
                  width="5.5"
                  height="9"
                  rx="2"
                  transform="rotate(-12 88 34)"
                  fill="url(#popperGoldGrad)"
                />
                <rect
                  x="101"
                  y="31"
                  width="5"
                  height="8.5"
                  rx="2"
                  transform="rotate(15 103 35)"
                  fill="#db2777"
                  opacity="0.85"
                />

                {/* Sculpted Pearl & Gold Cap */}
                <ellipse
                  cx="90"
                  cy="46"
                  rx="50"
                  ry="11.5"
                  fill="url(#popperCapGrad)"
                  stroke="url(#popperGoldGrad)"
                  strokeWidth="1.6"
                />
                <ellipse
                  cx="90"
                  cy="45.5"
                  rx="41"
                  ry="7.5"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="0.9"
                  opacity="0.85"
                />
              </g>

              {/* Inner Velvet Mouth Revealed After Pop */}
              {isPopped && (
                <ellipse
                  cx="90"
                  cy="48"
                  rx="46"
                  ry="10"
                  fill="#701a45"
                  stroke="url(#popperGoldGrad)"
                  strokeWidth="1.8"
                />
              )}

              {/* Confetti Cone Main Stationery Body */}
              <g clipPath="url(#coneClip)">
                <path
                  d="M 40 48 L 140 48 L 95 162 Q 90 172 85 162 Z"
                  fill="url(#popperBodyGrad)"
                />

                {/* Refined Diagonal Champagne Gold & Satin Rose Foil Bands */}
                <path
                  d="M 30 76 L 152 47 L 152 58 L 30 87 Z"
                  fill="url(#popperRoseRibbonGrad)"
                  opacity="0.86"
                />
                <path
                  d="M 30 87 L 152 58 L 152 61.5 L 30 90.5 Z"
                  fill="url(#popperGoldGrad)"
                  opacity="0.95"
                />

                <path
                  d="M 42 114 L 140 90 L 140 100 L 42 124 Z"
                  fill="url(#popperGoldGrad)"
                  opacity="0.88"
                />

                <path
                  d="M 55 142 L 126 125 L 126 135 L 55 152 Z"
                  fill="url(#popperRoseRibbonGrad)"
                  opacity="0.84"
                />
                <path
                  d="M 55 152 L 126 135 L 126 138 L 55 155 Z"
                  fill="url(#popperGoldGrad)"
                  opacity="0.95"
                />

                {/* Cylindrical Specular Satin Highlight */}
                <path
                  d="M 54 50 L 66 50 L 87 165 L 81 165 Z"
                  fill="#ffffff"
                  opacity="0.52"
                />
                <path
                  d="M 46 50 L 50 50 L 79 165 L 77 165 Z"
                  fill="#ffffff"
                  opacity="0.28"
                />
              </g>

              {/* Center Foil Medallion Diamond Accent */}
              <g transform="translate(90 88)" opacity="0.92">
                <path
                  d="M 0 -8 L 6 0 L 0 8 L -6 0 Z"
                  fill="#fffdf9"
                  stroke="url(#popperGoldGrad)"
                  strokeWidth="1.2"
                />
                <circle cx="0" cy="0" r="1.8" fill="url(#popperGoldGrad)" />
              </g>

              {/* Curved Brushed Gold Rim Collar */}
              <path
                d="M 38 48 Q 90 59.5 142 48"
                fill="none"
                stroke="url(#popperGoldGrad)"
                strokeWidth="3.6"
                strokeLinecap="round"
              />
              <path
                d="M 40 47.2 Q 90 58 140 47.2"
                fill="none"
                stroke="#fffdf9"
                strokeWidth="0.9"
                strokeLinecap="round"
                opacity="0.7"
              />

              {/* Delicate Gold Hairline Cone Contour */}
              <path
                d="M 40 48 L 140 48 L 95 162 Q 90 172 85 162 Z"
                fill="none"
                stroke="#c9935b"
                strokeWidth="1.35"
                strokeLinejoin="round"
                opacity="0.85"
              />

              {/* Turned Gold Finial Bead at Tip */}
              <circle
                cx="90"
                cy="167"
                r="5.2"
                fill="url(#popperGoldGrad)"
                stroke="#fffdf9"
                strokeWidth="1.1"
              />
            </svg>
          </div>

          {/* Interactive Silk Pull Cord & Brushed-Gold Pull Medallion */}
          {!isPopped && (
            <div className="relative z-20 flex flex-col items-center -mt-3">
              {/* Slender Satin Silk Ribbon Cord */}
              <svg
                width="36"
                height={50 + pullPx}
                viewBox={`0 0 36 ${50 + pullPx}`}
                className="overflow-visible pointer-events-none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="pullCordGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b8844c" />
                    <stop offset="50%" stopColor="#e6be7e" />
                    <stop offset="100%" stopColor="#be185d" />
                  </linearGradient>
                </defs>
                <path
                  d={`M 18 0 Q ${18 + (isDragging ? 0 : 3.2)} ${(50 + pullPx) * 0.48}, 18 ${46 + pullPx}`}
                  fill="none"
                  stroke="url(#pullCordGrad)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d={`M 18 0 Q ${18 + (isDragging ? 0 : 3.2)} ${(50 + pullPx) * 0.48}, 18 ${46 + pullPx}`}
                  fill="none"
                  stroke="#fffdf9"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </svg>

              {/* Grabbable Pull Medallion (44px+ touch hitbox) */}
              <button
                type="button"
                data-testid="confetti-pull-handle"
                aria-label="Tarik tali confetti ke bawah untuk membuka pesan"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
                onKeyDown={handleKeyDown}
                style={{
                  touchAction: 'none',
                  transform: `translate3d(0, 0, 0) scale(${isDragging ? 1.06 : 1})`,
                }}
                className={`group relative -mt-2 w-14 h-14 flex items-center justify-center rounded-full cursor-grab active:cursor-grabbing select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300 ${
                  isDragging ? 'transition-none' : 'transition-transform duration-300 ease-out'
                } ${!isDragging ? 'animate-pull-tassel-idle' : ''}`}
              >
                {/* Live Pull Progress Halo */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0.5 rounded-full border border-[#d4a373]/75 transition-transform duration-150"
                  style={{
                    opacity: 0.35 + progress * 0.65,
                    transform: `scale(${1 + progress * 0.24})`,
                  }}
                />
                {/* Brushed Champagne Gold & Pearl-Enamel Ring */}
                <span className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-[#f9ebc7] via-[#e6be7e] to-[#c9935b] p-[2.5px] shadow-[0_8px_18px_rgba(136,14,79,0.22)] group-hover:shadow-[0_10px_22px_rgba(136,14,79,0.3)] transition-shadow">
                  <span className="w-full h-full rounded-full bg-[#fffdf9] border border-[#f3d89b]/70 flex items-center justify-center text-[#9d174d]">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 3.25V12.25M8 12.25L4.25 8.5M8 12.25L11.75 8.5"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Celebratory Ivory Stationery Reveal Card */}
        {isRevealed && (
          <div
            data-testid="confetti-reveal-message"
            className="relative z-30 mt-2 w-full max-w-[300px] min-[360px]:max-w-[344px] bg-[#fffdf9]/96 backdrop-blur-md border border-[#e6be7e]/65 rounded-[24px] sm:rounded-[26px] p-1.5 shadow-[0_22px_52px_rgba(136,14,79,0.2)] animate-confetti-banner-in"
          >
            <div className="rounded-[18px] sm:rounded-[20px] border border-pink-200/70 px-5 py-6 min-[390px]:px-6 min-[390px]:py-7 text-center">
              <div
                className="flex items-center justify-center gap-2.5 mb-2.5 text-[#c99b63] text-[11px] tracking-[5px]"
                aria-hidden="true"
              >
                <span>— ✦ —</span>
              </div>

              <p className="font-serif-display text-lg min-[390px]:text-xl font-semibold text-[#ad1457] tracking-wide">
                {openingText.line1}
              </p>
              <h2 className="font-serif-display mt-1.5 text-2xl min-[390px]:text-[28px] font-bold text-[#880e4f] leading-tight text-balance">
                {openingText.line2}
              </h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
