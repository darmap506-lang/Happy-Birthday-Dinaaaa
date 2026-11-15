import React, { useEffect, useMemo, useState } from 'react';
import { Gift, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';
import {
  MAIN_GREETING_MESSAGE,
  getTypewriterSlice,
  getTypewriterVisibleCount,
  splitGraphemes,
} from '../utils/greeting';

interface MainCardProps {
  recipientName: string;
  onOpenSurprise: () => void;
  onCloseEnvelope: () => void;
}

export const MainCard: React.FC<MainCardProps> = ({
  recipientName,
  onOpenSurprise,
  onCloseEnvelope,
}) => {
  const graphemes = useMemo(() => splitGraphemes(MAIN_GREETING_MESSAGE), []);
  const totalUnits = graphemes.length;

  const [visibleCount, setVisibleCount] = useState<number>(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return totalUnits;
    }
    return 0;
  });

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisibleCount(totalUnits);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();

    const step = (now: number) => {
      const nextCount = getTypewriterVisibleCount(now - startTime, totalUnits);
      setVisibleCount((prev) => (nextCount > prev ? nextCount : prev));
      if (nextCount < totalUnits) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [totalUnits]);

  const isTypingComplete = visibleCount >= totalUnits;
  const typedText = useMemo(
    () => getTypewriterSlice(graphemes, visibleCount),
    [graphemes, visibleCount]
  );

  const handleRevealFullGreeting = () => {
    if (!isTypingComplete) {
      setVisibleCount(totalUnits);
    }
  };

  const handleSurpriseClick = () => {
    sound.playSparkle();
    onOpenSurprise();
  };

  return (
    <div className="relative z-10 main-card-wrapper animate-card-enter">
      <div
        className="main-card-surface bg-white/92 backdrop-blur-xl shadow-[0_15px_35px_rgba(136,14,79,0.15)] border-2 border-white/80 transition-all hover:shadow-[0_20px_45px_rgba(136,14,79,0.22)]"
      >
        {/* Decorative corner blossom */}
        <div className="absolute -top-3 -right-2.5 sm:-top-3.5 sm:-right-3.5 text-xl sm:text-2xl select-none animate-bounce pointer-events-none" style={{ animationDuration: '3s' }}>
          🌸
        </div>
        <div className="absolute -bottom-2.5 -left-2.5 sm:-bottom-3 sm:-left-3 text-xl sm:text-2xl select-none animate-pulse pointer-events-none">
          ✨
        </div>

        {/* Subtitle */}
        <div className="main-card-subtitle font-semibold text-[#ad1457] uppercase select-none flex items-center justify-center gap-1.5 animate-greeting-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0" />
          <span>Selamat Ulang Tahun</span>
          <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0" />
        </div>

        {/* Main Name Heading */}
        <h1 className="main-card-heading font-serif-display text-[#880e4f] font-bold tracking-tight animate-greeting-fade-in">
          {recipientName}
        </h1>

        {/* Warm Greeting Message with smooth fade-in + typewriter reveal */}
        <p
          onClick={handleRevealFullGreeting}
          data-typing-complete={isTypingComplete ? 'true' : 'false'}
          className="main-card-body relative text-[#4a4a4a] font-normal whitespace-pre-line animate-greeting-fade-in"
        >
          <span className="sr-only">{MAIN_GREETING_MESSAGE}</span>
          {/* Invisible layout-preserving spacer so card height never jumps while typing */}
          <span aria-hidden="true" className="invisible block select-none">
            {MAIN_GREETING_MESSAGE}
          </span>
          <span aria-hidden="true" className="absolute inset-0 block">
            {typedText}
            <span
              className={`typewriter-caret ${isTypingComplete ? 'is-complete' : ''}`}
            />
          </span>
        </p>

        {/* Primary CTA Button: pencet lerrrr */}
        <div>
          <button
            type="button"
            onClick={handleSurpriseClick}
            aria-label="pencet lerrrr"
            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#d81b60] to-[#ad1457] hover:from-[#c2185b] hover:to-[#880e4f] text-white font-semibold text-base rounded-full shadow-[0_6px_20px_rgba(216,27,96,0.4)] hover:shadow-[0_8px_25px_rgba(216,27,96,0.6)] hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300"
          >
            <Gift className="w-5 h-5 text-pink-100 shrink-0" />
            <span className="whitespace-nowrap">pencet lerrrr 🎁</span>
          </button>
        </div>

        {/* Option to close greeting card and return to confetti popper */}
        <div className="mt-3.5 sm:mt-5 flex justify-center">
          <button
            type="button"
            onClick={onCloseEnvelope}
            aria-label="Tutup dan kembali ke pembuka confetti"
            className="min-h-[44px] min-w-[88px] inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm text-pink-700/85 hover:text-pink-950 font-medium transition-colors hover:underline px-4 py-2 touch-manipulation active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 rounded-full cursor-pointer whitespace-nowrap"
          >
            <span>🎉</span>
            <span>Tutup</span>
          </button>
        </div>
      </div>
    </div>
  );
};
