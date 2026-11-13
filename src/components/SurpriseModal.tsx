import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import {
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Sparkles,
  Pencil,
  Gamepad2,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { ConfettiCanvas } from './ConfettiCanvas';
import { VectorCake } from './VectorCake';
import { FlyingBalloons } from './FlyingBalloons';
import { PixelPanda, PixelOrangeCat } from './PixelMascots';
import { DEFAULT_PHOTO_SLIDES, getNextSlideIndex, getPrevSlideIndex } from '../utils/greeting';
import { ROULETTE_PRIZES, RIGGED_PRIZE_INDEX } from '../utils/roulette';
import {
  DEFAULT_BLOW_THRESHOLD,
  DEFAULT_REQUIRED_BLOW_FRAMES,
  analyzeBlowSignal,
  isMicrophoneSupported,
  updateSustainedBlowCount,
} from '../utils/micBlow';
import {
  MAX_BIRTHDAY_WISH_LENGTH,
  SavedBirthdayWish,
  loadSavedWish,
  saveBirthdayWish,
  validateBirthdayWish,
} from '../utils/birthdayWish';

const RouletteGameModal = lazy(() =>
  import('./RouletteGameModal').then((m) => ({ default: m.RouletteGameModal }))
);

interface SurpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
}

export const SurpriseModal: React.FC<SurpriseModalProps> = ({
  isOpen,
  onClose,
  recipientName,
}) => {

  const [candlesBlown, setCandlesBlown] = useState(false);
  const [isBlowing, setIsBlowing] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [balloonRunKey, setBalloonRunKey] = useState(0);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const blowTimersRef = useRef<number[]>([]);
  const touchStartXRef = useRef<number | null>(null);

  // Microphone blow-detection state
  const [micActive, setMicActive] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micCtxRef = useRef<AudioContext | null>(null);
  const micRafRef = useRef<number | null>(null);
  const sustainedCountRef = useRef(0);

  // Make-a-Wish state
  const [savedWish, setSavedWish] = useState<SavedBirthdayWish | null>(null);
  const [wishDraft, setWishDraft] = useState('');
  const [isEditingWish, setIsEditingWish] = useState(false);
  const [wishError, setWishError] = useState<string | null>(null);
  const [wishJustSaved, setWishJustSaved] = useState(false);

  const clearBlowTimers = () => {
    blowTimersRef.current.forEach((id) => window.clearTimeout(id));
    blowTimersRef.current = [];
  };

  const stopMicrophone = useCallback(() => {
    if (micRafRef.current !== null) {
      window.cancelAnimationFrame(micRafRef.current);
      micRafRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (micCtxRef.current) {
      micCtxRef.current.close().catch(() => {});
      micCtxRef.current = null;
    }
    sustainedCountRef.current = 0;
    setMicActive(false);
    setMicLevel(0);
  }, []);

  const triggerBlowSequence = useCallback(() => {
    stopMicrophone();
    setMicError(null);
    setIsBlowing(true);
    sound.playBlowCandle();

    // The wind gust blows across, cat flies away, panda claps, then candles extinguish
    const extinguishTimer = window.setTimeout(() => {
      setCandlesBlown(true);
      setConfettiTrigger(Date.now());
    }, 950);

    const stopWindTimer = window.setTimeout(() => {
      setIsBlowing(false);
    }, 1000);

    blowTimersRef.current.push(extinguishTimer, stopWindTimer);
  }, [stopMicrophone]);

  // Reset candles, load saved wish, and trigger rising balloons every time SurpriseModal opens
  useEffect(() => {
    if (isOpen) {
      clearBlowTimers();
      stopMicrophone();
      setCandlesBlown(false);
      setIsBlowing(false);
      setCurrentSlide(0);
      setMicError(null);
      setWishError(null);
      setWishJustSaved(false);
      const saved = loadSavedWish();
      setSavedWish(saved);
      setWishDraft(saved?.text ?? '');
      setIsEditingWish(!saved);
      setBalloonRunKey((prev) => prev + 1);
      setIsGameOpen(false);
    } else {
      clearBlowTimers();
      stopMicrophone();
      setIsGameOpen(false);
    }
    return () => {
      clearBlowTimers();
      stopMicrophone();
      sound.setMusicDucked(false);
    };
  }, [isOpen, stopMicrophone]);

  // Duck background music softly while microphone is listening so speaker audio won't falsely trigger blow detection
  useEffect(() => {
    sound.setMusicDucked(isOpen && micActive);
    return () => {
      sound.setMusicDucked(false);
    };
  }, [isOpen, micActive]);

  // Preload Page 4 carousel photos, Roulette modal chunk, and Sepatu NB image once candles are blown
  useEffect(() => {
    if (!isOpen || !candlesBlown || typeof window === 'undefined') return;
    void import('./RouletteGameModal');
    const urls = [
      ...DEFAULT_PHOTO_SLIDES.map((s) => s.src),
      ROULETTE_PRIZES[RIGGED_PRIZE_INDEX].imageSrc,
    ].filter((u): u is string => Boolean(u));

    urls.forEach((url) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
    });
  }, [isOpen, candlesBlown]);

  const activeSlide = DEFAULT_PHOTO_SLIDES[currentSlide] || DEFAULT_PHOTO_SLIDES[0];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => getNextSlideIndex(prev, DEFAULT_PHOTO_SLIDES.length));
    sound.playSparkle();
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => getPrevSlideIndex(prev, DEFAULT_PHOTO_SLIDES.length));
    sound.playSparkle();
  };

  const handleSelectSlide = (index: number) => {
    setCurrentSlide(index);
    sound.playSparkle();
  };

  const handleToggleMicrophone = async () => {
    if (micActive) {
      stopMicrophone();
      return;
    }

    if (candlesBlown || isBlowing) return;

    setMicError(null);

    if (!isMicrophoneSupported()) {
      setMicError('Mikrofon tidak didukung di browser ini — gunakan tombol Tiup Lilin ya!');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) {
        stream.getTracks().forEach((t) => t.stop());
        setMicError('Audio browser tidak tersedia — gunakan tombol Tiup Lilin ya!');
        return;
      }

      const audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.45;
      source.connect(analyser);

      micStreamRef.current = stream;
      micCtxRef.current = audioCtx;
      sustainedCountRef.current = 0;
      setMicActive(true);

      const bins = new Uint8Array(analyser.frequencyBinCount);

      const monitorLoop = () => {
        if (!micStreamRef.current) return;
        analyser.getByteFrequencyData(bins);
        const analysis = analyzeBlowSignal(bins, DEFAULT_BLOW_THRESHOLD);
        setMicLevel(analysis.level);

        const sustained = updateSustainedBlowCount(
          sustainedCountRef.current,
          analysis.isBlowing,
          DEFAULT_REQUIRED_BLOW_FRAMES
        );
        sustainedCountRef.current = sustained.count;

        if (sustained.triggered) {
          triggerBlowSequence();
          return;
        }

        micRafRef.current = window.requestAnimationFrame(monitorLoop);
      };

      micRafRef.current = window.requestAnimationFrame(monitorLoop);
    } catch {
      stopMicrophone();
      setMicError('Mikrofon tidak tersedia / izin ditolak — pakai tombol Tiup Lilin ya!');
    }
  };

  const handleWishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateBirthdayWish(wishDraft);
    if (!validation.valid) {
      setWishError(validation.error ?? 'Tulis dulu harapan ulang tahunmu ya ✨');
      return;
    }

    const stored = saveBirthdayWish(validation.trimmed);
    if (stored) {
      setSavedWish(stored);
      setWishDraft(stored.text);
      setIsEditingWish(false);
      setWishError(null);
      setWishJustSaved(true);
      sound.playSparkle();
    }
  };

  const handleBlowCandles = useCallback(() => {
    if (candlesBlown || isBlowing) return;
    triggerBlowSequence();
  }, [candlesBlown, isBlowing, triggerBlowSequence]);

  const handleRelight = () => {
    clearBlowTimers();
    stopMicrophone();
    setMicError(null);
    setCandlesBlown(false);
    setIsBlowing(false);
    setCurrentSlide(0);
    sound.playSparkle();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kejutan Ulang Tahun"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-rose-950/55 animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Flying Balloons rising from the bottom of the screen */}
      <FlyingBalloons runKey={balloonRunKey} count={12} />

      <div className="relative z-10 bg-white/97 border-2 border-pink-200/90 rounded-[24px] sm:rounded-3xl p-4 min-[390px]:p-5 sm:p-7 max-w-md w-full max-h-[90dvh] overflow-y-auto overscroll-contain text-center shadow-2xl transition-all transform scale-100 animate-in zoom-in-95 duration-200">
        {/* Close icon top-right */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup kejutan"
          className="absolute top-2 right-2 sm:top-3.5 sm:right-3.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-pink-400 hover:text-pink-700 hover:bg-pink-50 rounded-full transition-colors touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Interactive Vector Cake flanked by Pixel Panda (left) & Orange Cat (right) */}
        <div className="my-0.5 flex flex-col items-center">
          <div className="relative flex items-end justify-center gap-1 min-[390px]:gap-2 sm:gap-3 w-full pt-4 sm:pt-3">
            <div className="mb-1 shrink-0">
              <PixelPanda mode={candlesBlown ? 'cake' : isBlowing ? 'clap' : 'idle'} />
            </div>

            <div className="shrink-0">
              <VectorCake
                candlesBlown={candlesBlown}
                isBlowing={isBlowing}
                onBlow={handleBlowCandles}
              />
            </div>

            <div className="mb-1 shrink-0">
              <PixelOrangeCat
                key={candlesBlown ? 'cat-walk-cake' : isBlowing ? 'cat-blown' : 'cat-idle'}
                mode={candlesBlown ? 'walk-cake' : isBlowing ? 'wind-blown' : 'idle'}
              />
            </div>
          </div>

          {/* Candle Action Controls (Fallback Button + Optional Real Microphone Blow) */}
          <div className="mt-2.5 flex flex-col items-center gap-2 w-full">
            {!candlesBlown ? (
              <>
                <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={handleBlowCandles}
                    disabled={isBlowing}
                    className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-sm cursor-pointer touch-manipulation whitespace-nowrap ${
                      isBlowing
                        ? 'bg-sky-100 text-sky-800 scale-105 ring-2 ring-sky-300'
                        : 'text-pink-700 bg-pink-100/85 hover:bg-pink-200/95 hover:scale-105 active:scale-95'
                    }`}
                  >
                    <span className={isBlowing ? 'inline-block animate-bounce' : ''}>🌬️</span>
                    <span>{isBlowing ? 'Meniup Lilin...' : 'Tiup Lilin'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleMicrophone}
                    disabled={isBlowing}
                    aria-pressed={micActive}
                    className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-sm cursor-pointer touch-manipulation whitespace-nowrap border ${
                      micActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-200'
                        : 'bg-white text-rose-700 border-pink-200 hover:bg-pink-50 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {micActive ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Stop Mic</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-rose-600" />
                        <span>Tiup pakai Mic</span>
                      </>
                    )}
                  </button>
                </div>

                {micActive && (
                  <div
                    data-testid="mic-meter-panel"
                    className="w-full max-w-[260px] bg-emerald-50/90 border border-emerald-200 rounded-2xl px-3 py-2 text-left"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 mb-1">
                      <span>Tiup ke mikrofon sekarang...</span>
                      <span>{Math.round(micLevel * 100)}%</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label="Kekuatan tiupan mikrofon"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(micLevel * 100)}
                      className="w-full h-2 bg-emerald-200/70 rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-75 rounded-full"
                        style={{ width: `${Math.max(4, Math.round(micLevel * 100))}%` }}
                      />
                    </div>
                  </div>
                )}

                {micError && (
                  <p
                    role="status"
                    data-testid="mic-fallback-notice"
                    className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 max-w-[300px]"
                  >
                    {micError}
                  </p>
                )}
              </>
            ) : (
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/90 px-3.5 py-1 rounded-full animate-bounce shadow-sm">
                  Kue-nya virtual aja yaaaa😅
                </span>
                <button
                  type="button"
                  onClick={handleRelight}
                  title="Nyalakan lilin kembali"
                  aria-label="Nyalakan lilin kembali"
                  className="p-1 text-slate-400 hover:text-pink-600 rounded-full hover:bg-pink-50 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Make a Wish / Harapan Ulang Tahun Section (Page 3 only, hidden after candles blown) */}
        {!candlesBlown && (
          <section
            aria-label="Make a Wish"
            data-testid="make-a-wish-section"
            className="mt-3.5 bg-gradient-to-br from-rose-50/90 via-pink-50/75 to-amber-50/70 border border-pink-200/80 rounded-2xl p-3 text-left shadow-sm"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="inline-block animate-wish-star-float text-sm" aria-hidden="true">
                  🌟
                </span>
                <h3 className="text-xs font-bold text-pink-900 tracking-wide uppercase">
                  Make a Wish
                </h3>
              </div>
              {savedWish && !isEditingWish && (
                <button
                  type="button"
                  onClick={() => {
                    setWishDraft(savedWish.text);
                    setIsEditingWish(true);
                    setWishError(null);
                  }}
                  className="min-h-[36px] inline-flex items-center gap-1 text-[11px] font-semibold text-pink-700 hover:text-pink-900 bg-white/85 hover:bg-white px-3 py-1 rounded-full border border-pink-200 transition-colors touch-manipulation cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Ubah</span>
                </button>
              )}
            </div>

            {!savedWish || isEditingWish ? (
              <form onSubmit={handleWishSubmit} className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={wishDraft}
                    onChange={(e) => {
                      setWishDraft(e.target.value);
                      if (wishError) setWishError(null);
                    }}
                    maxLength={MAX_BIRTHDAY_WISH_LENGTH}
                    placeholder="Tulis harapan ulang tahunmu..."
                    aria-label="Tulis harapan ulang tahunmu"
                    className="flex-1 min-w-0 min-h-[44px] bg-white/95 border border-pink-200 rounded-xl px-3 py-2 text-base sm:text-xs text-slate-700 placeholder:text-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <button
                    type="submit"
                    className="shrink-0 min-h-[44px] inline-flex items-center justify-center gap-1 px-3.5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-95 touch-manipulation cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Simpan</span>
                  </button>
                </div>
                {wishError && (
                  <p role="alert" className="text-[11px] font-medium text-rose-600">
                    {wishError}
                  </p>
                )}
                {savedWish && isEditingWish && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingWish(false);
                      setWishError(null);
                    }}
                    className="text-[11px] text-slate-500 hover:text-pink-700 underline cursor-pointer"
                  >
                    Batal
                  </button>
                )}
              </form>
            ) : (
              <div
                data-testid="saved-wish-card"
                className={`bg-white/90 border border-pink-100 rounded-xl px-3 py-2 ${
                  wishJustSaved ? 'animate-in zoom-in-95 duration-300' : ''
                }`}
              >
                <p className="text-xs sm:text-[13px] text-pink-950 font-medium italic leading-relaxed break-words">
                  “{savedWish.text}”
                </p>
                <p className="mt-1.5 text-[11px] font-semibold text-pink-600">
                  Semoga harapan kamu terkabul, Aamiin☺️🤲
                </p>
              </div>
            )}
          </section>
        )}

        {/* Revealed Photo Carousel after blowing candles */}
        {candlesBlown && (
          <div className="mt-3 animate-in zoom-in-95 fade-in duration-500 flex flex-col items-center w-full">
            <div
              onTouchStart={(e) => {
                touchStartXRef.current = e.touches[0]?.clientX ?? null;
              }}
              onTouchEnd={(e) => {
                if (touchStartXRef.current === null) return;
                const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
                const deltaX = endX - touchStartXRef.current;
                touchStartXRef.current = null;
                if (Math.abs(deltaX) > 36) {
                  if (deltaX < 0) handleNextSlide();
                  else handlePrevSlide();
                }
              }}
              className="relative bg-white p-2.5 sm:p-3 pb-3 rounded-2xl shadow-xl border border-pink-200/90 transform rotate-[-0.5deg] hover:rotate-0 transition-transform duration-300 max-w-[228px] min-[390px]:max-w-[254px] sm:max-w-[290px] w-full touch-pan-y"
            >
              {/* Prev Slide Arrow */}
              <button
                type="button"
                onClick={handlePrevSlide}
                aria-label="Foto sebelumnya"
                title="Foto sebelumnya"
                className="absolute -left-3.5 sm:-left-3 top-[40%] -translate-y-1/2 z-20 w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-pink-50 text-pink-700 shadow-md border border-pink-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>

              {/* Next Slide Arrow */}
              <button
                type="button"
                onClick={handleNextSlide}
                aria-label="Foto selanjutnya"
                title="Foto selanjutnya"
                className="absolute -right-3.5 sm:-right-3 top-[40%] -translate-y-1/2 z-20 w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-pink-50 text-pink-700 shadow-md border border-pink-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>

              {/* Image Frame */}
              <div className="w-full aspect-square overflow-hidden rounded-xl border border-pink-100 bg-pink-50 shadow-inner relative">
                <img
                  key={currentSlide}
                  src={activeSlide.src}
                  alt={`Foto ${recipientName} ${currentSlide + 1}`}
                  decoding="async"
                  className="w-full h-full object-cover object-center animate-in fade-in duration-300 select-none"
                />
              </div>

              {/* Name & Dynamic Caption for Current Slide */}
              <div className="mt-2 text-center px-1">
                <p className="font-serif-display text-pink-900 font-bold text-sm tracking-wide">
                  {recipientName} 🌸✨
                </p>
                <p className="text-xs text-pink-600 font-semibold mt-0.5 min-h-[1.25rem]">
                  {activeSlide.caption}
                </p>

                {/* Dot Indicators */}
                <div className="flex items-center justify-center gap-0.5 mt-1.5">
                  {DEFAULT_PHOTO_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSlide(idx)}
                      aria-label={`Lihat foto ${idx + 1}`}
                      className="p-1.5 flex items-center justify-center cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded-full"
                    >
                      <span
                        className={`block h-2 transition-all rounded-full ${
                          currentSlide === idx
                            ? 'w-5 bg-gradient-to-r from-pink-600 to-rose-600 shadow-sm'
                            : 'w-2 bg-pink-200 hover:bg-pink-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3 mt-4">
          {candlesBlown && (
            <button
              type="button"
              onClick={() => {
                sound.playSparkle();
                setIsGameOpen(true);
              }}
              data-testid="btn-main-game"
              className="flex-1 sm:flex-initial min-h-[46px] inline-flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500 hover:from-amber-500 hover:via-pink-600 hover:to-rose-600 text-white font-semibold text-sm sm:text-base rounded-full shadow-lg shadow-pink-500/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all touch-manipulation whitespace-nowrap focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300 cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4 shrink-0" />
              <span>Main game</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`${
              candlesBlown ? 'flex-1 sm:flex-initial px-5 sm:px-8' : 'w-full sm:w-auto px-8'
            } min-h-[46px] py-2.5 bg-gradient-to-r from-[#d81b60] to-[#ad1457] hover:from-[#c2185b] hover:to-[#880e4f] text-white font-medium text-sm sm:text-base rounded-full shadow-lg shadow-pink-600/30 hover:shadow-pink-600/50 hover:-translate-y-0.5 active:scale-[0.98] transition-all touch-manipulation whitespace-nowrap focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300 cursor-pointer`}
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Canvas-based Confetti Explosion */}
      <ConfettiCanvas triggerKey={confettiTrigger} />

      {/* Lazy-loaded Roulette Game Modal (Page 4) */}
      {isGameOpen && (
        <Suspense fallback={null}>
          <RouletteGameModal
            isOpen={isGameOpen}
            onClose={() => setIsGameOpen(false)}
            recipientName={recipientName}
          />
        </Suspense>
      )}
    </div>
  );
};
