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
      className={`fixed inset-0 z-20 flex flex-col items-center justify-center px-3 pt-14 pb-20 min-[390px]:px-4 min-[390px]:pb-24 sm:p-6 sm:pb-8 overflow-y-auto overscroll-contain transition-all duration-500 ease-out ${
        isExiting ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Fullscreen celebratory confetti canvas triggered when string is pulled */}
      <ConfettiCanvas triggerKey={confettiKey} />

      <div className="relative flex flex-col items-center justify-center w-full max-w-[360px]">
        {/* Ambient Rose & Champagne Glow */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-10 rounded-full blur-3xl transition-all duration-700 ${
            isPopped
              ? 'bg-gradient-to-tr from-pink-300/65 via-amber-200/55 to-rose-300/65 scale-125 opacity-100'
              : 'bg-gradient-to-tr from-pink-200/45 via-rose-100/35 to-amber-100/40 opacity-85'
          }`}
        />

        {/* Instruction Caption Above Popper (visible before pop) */}
        {!isPopped && (
          <div className="relative z-10 mb-3 text-center select-none">
            <p
              className={`text-xs sm:text-sm font-semibold transition-colors ${
                showPullHint ? 'text-rose-600 animate-bounce' : 'text-pink-700/90'
              }`}
            >
              {showPullHint
                ? 'Tarik talinya ke bawah ya! ↓'
                : progress > 0.15
                ? `Tarik terus ke bawah... ${Math.round(progress * 100)}%`
                : 'Tarik tali di bawah untuk membuka ✨'}
            </p>
          </div>
        )}

        {/* Confetti Popper Stage (Cone + Streamers + Pull String) */}
        <div
          className={`relative flex flex-col items-center transition-all duration-500 ${
            isRevealed ? 'scale-75 -translate-y-4 opacity-30 pointer-events-none' : 'scale-100 opacity-100'
          }`}
        >
          {/* Erupting SVG Streamers from Popper Rim */}
          {isPopped && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[34px] z-20 -translate-x-1/2"
            >
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
                        borderRadius:
                          s.shape === 'circle'
                            ? '9999px'
                            : s.shape === 'ribbon'
                            ? '9999px'
                            : '2px',
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

          {/* Confetti Popper Cone Illustration (clicking cone nudges user to pull string) */}
          <div
            key={`cone-nudge-${hintNudgeSeq}`}
            onClick={triggerPullNudge}
            role="presentation"
            className={`relative z-10 cursor-pointer select-none transition-transform duration-150 ${
              hintNudgeSeq > 0 && !isPopped ? 'animate-popper-wiggle' : ''
            }`}
            style={{
              transform: !isPopped
                ? `scale(${1 + progress * 0.04}, ${1 - progress * 0.05}) rotate(${
                    isDragging ? (progress * 3 - 1.5).toFixed(2) : 0
                  }deg)`
                : undefined,
            }}
          >
            <svg
              viewBox="0 0 180 180"
              className={`w-[138px] min-[360px]:w-[152px] min-[390px]:w-[168px] sm:w-[184px] h-auto overflow-visible drop-shadow-[0_14px_24px_rgba(136,14,79,0.22)] ${
                !isDragging && !isPopped ? 'animate-popper-float' : ''
              }`}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="popperBodyGrad" x1="0" y1="0" x2="1" y2="0.4">
                  <stop offset="0%" stopColor="#fdf2f8" />
                  <stop offset="45%" stopColor="#fbcfe8" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
                <linearGradient id="popperStripeGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#be185d" />
                </linearGradient>
                <linearGradient id="popperGoldGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <radialGradient id="popperCapGrad" cx="45%" cy="35%" r="70%">
                  <stop offset="0%" stopColor="#fff1f2" />
                  <stop offset="65%" stopColor="#f9a8d4" />
                  <stop offset="100%" stopColor="#db2777" />
                </radialGradient>
                <clipPath id="coneClip">
                  <path d="M 38 48 L 142 48 L 96 164 Q 90 174 84 164 Z" />
                </clipPath>
              </defs>

              {/* Floating Sparkle Accents */}
              <g className={isPopped ? 'opacity-0' : 'opacity-90'}>
                <path d="M 24 68 L 27 60 L 30 68 L 38 71 L 30 74 L 27 82 L 24 74 L 16 71 Z" fill="#fbbf24" />
                <path d="M 152 62 L 154 56 L 156 62 L 162 64 L 156 66 L 154 72 L 152 66 L 146 64 Z" fill="#f472b6" />
                <circle cx="34" cy="112" r="3.5" fill="#fb7185" opacity="0.7" />
                <circle cx="148" cy="108" r="3" fill="#fbbf24" opacity="0.8" />
              </g>

              {/* Top Peeking Confetti Cap (flies upward when popped!) */}
              <g
                className={isPopped ? 'animate-cap-fly-away' : ''}
                style={{ transformOrigin: '90px 44px' }}
              >
                <ellipse cx="90" cy="45" rx="52" ry="13" fill="url(#popperCapGrad)" stroke="#be185d" strokeWidth="1.5" />
                {/* Colorful confetti tufts peeking from rim */}
                <circle cx="64" cy="41" r="6" fill="#fbbf24" />
                <circle cx="80" cy="37" r="7" fill="#38bdf8" />
                <circle cx="98" cy="37" r="6.5" fill="#34d399" />
                <circle cx="114" cy="41" r="6" fill="#a855f7" />
                <rect x="85" y="29" width="7" height="10" rx="2" transform="rotate(-14 88 34)" fill="#f43f5e" />
                <rect x="102" y="31" width="6" height="9" rx="2" transform="rotate(18 105 35)" fill="#fde047" />
              </g>

              {/* Inner Dark Mouth visible after cap pops open */}
              {isPopped && (
                <ellipse cx="90" cy="48" rx="48" ry="11" fill="#831843" stroke="#fde047" strokeWidth="2" />
              )}

              {/* Confetti Cone Body */}
              <g clipPath="url(#coneClip)">
                <path d="M 38 48 L 142 48 L 96 164 Q 90 174 84 164 Z" fill="url(#popperBodyGrad)" />
                {/* Diagonal Festive Stripes */}
                <path d="M 30 74 L 150 48 L 150 66 L 30 92 Z" fill="url(#popperStripeGrad)" opacity="0.92" />
                <path d="M 40 108 L 142 84 L 142 100 L 40 124 Z" fill="url(#popperGoldGrad)" opacity="0.9" />
                <path d="M 52 138 L 128 120 L 128 135 L 52 153 Z" fill="url(#popperStripeGrad)" opacity="0.92" />
                {/* Specular Gloss Highlight */}
                <path d="M 52 50 L 66 50 L 87 166 L 80 166 Z" fill="#ffffff" opacity="0.34" />
              </g>

              {/* Gold Scalloped Rim Band */}
              <path
                d="M 36 48 Q 90 61 144 48"
                fill="none"
                stroke="url(#popperGoldGrad)"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Cone Outline & Bottom Gold Ferrule */}
              <path
                d="M 38 48 L 142 48 L 96 164 Q 90 174 84 164 Z"
                fill="none"
                stroke="#9d174d"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="90" cy="168" r="6" fill="url(#popperGoldGrad)" stroke="#9d174d" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Interactive Pull String & Gold Tassel Ring */}
          {!isPopped && (
            <div className="relative z-20 flex flex-col items-center -mt-3">
              {/* Dynamic Stretching Braided Cord */}
              <svg
                width="36"
                height={48 + pullPx}
                viewBox={`0 0 36 ${48 + pullPx}`}
                className="overflow-visible pointer-events-none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="pullCordGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#db2777" />
                  </linearGradient>
                </defs>
                <path
                  d={`M 18 0 Q ${18 + (isDragging ? 0 : 4)} ${(48 + pullPx) * 0.45}, 18 ${44 + pullPx}`}
                  fill="none"
                  stroke="url(#pullCordGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d={`M 18 0 Q ${18 + (isDragging ? 0 : 4)} ${(48 + pullPx) * 0.45}, 18 ${44 + pullPx}`}
                  fill="none"
                  stroke="#fef08a"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
              </svg>

              {/* Grabbable Pull Ring & Tassel Handle */}
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
                  transform: `translate3d(0, 0, 0) scale(${isDragging ? 1.08 : 1})`,
                }}
                className={`group relative -mt-2 w-14 h-14 flex items-center justify-center rounded-full cursor-grab active:cursor-grabbing select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-400 transition-transform ${
                  !isDragging ? 'animate-pull-tassel-idle' : ''
                }`}
              >
                {/* Live Pull Progress Halo */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border-2 border-amber-400/70 transition-all"
                  style={{
                    opacity: 0.45 + progress * 0.55,
                    transform: `scale(${1 + progress * 0.28})`,
                  }}
                />
                {/* Gold Pull Ring + Rose Bead */}
                <span className="relative flex flex-col items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-rose-500 p-[3px] shadow-[0_6px_16px_rgba(190,24,93,0.32)]">
                  <span className="w-full h-full rounded-full bg-white/95 flex items-center justify-center text-base font-bold text-[#be185d]">
                    ↓
                  </span>
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Celebratory Message Revealed Immediately After Confetti Burst */}
        {isRevealed && (
          <div
            data-testid="confetti-reveal-message"
            className="relative z-30 mt-2 w-full max-w-[300px] min-[360px]:max-w-[340px] bg-white/95 border-2 border-pink-200 rounded-[24px] sm:rounded-[26px] px-5 py-6 min-[390px]:px-6 min-[390px]:py-7 text-center shadow-[0_20px_48px_rgba(136,14,79,0.22)] animate-confetti-banner-in"
          >
            <div
              className="flex items-center justify-center gap-2 mb-2.5 text-[#c99b63] text-xs tracking-[4px]"
              aria-hidden="true"
            >
              <span>— ✦ 🎉 ✦ —</span>
            </div>

            <p className="font-serif-display text-lg min-[390px]:text-xl font-semibold text-[#ad1457] tracking-wide">
              {openingText.line1}
            </p>
            <h2 className="font-serif-display mt-1.5 text-2xl min-[390px]:text-[28px] font-bold text-[#880e4f] leading-tight text-balance">
              {openingText.line2}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};
