import React, { useState } from 'react';
import { Sparkles, X, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { sound } from '../utils/audio';
import { ConfettiCanvas } from './ConfettiCanvas';
import { VectorCake } from './VectorCake';
import { DEFAULT_PHOTO_SLIDES, getNextSlideIndex, getPrevSlideIndex } from '../utils/greeting';

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
  const [wishMade, setWishMade] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

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

  if (!isOpen) return null;

  const handleBlowCandles = () => {
    if (candlesBlown || isBlowing) return;
    setIsBlowing(true);
    sound.playBlowCandle();

    // The wind gust blows across and extinguishes the candles
    setTimeout(() => {
      setCandlesBlown(true);
      setWishMade(true);
      setConfettiTrigger(Date.now());
    }, 550);

    setTimeout(() => {
      setIsBlowing(false);
    }, 950);
  };

  const handleRelight = () => {
    setCandlesBlown(false);
    setIsBlowing(false);
    setWishMade(false);
    setCurrentSlide(0);
    sound.playSparkle();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kejutan Ulang Tahun"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white/95 backdrop-blur-lg border-2 border-pink-200/90 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl transition-all transform scale-100 animate-in zoom-in-95 duration-200">
        {/* Close icon top-right */}
        <button
          onClick={onClose}
          aria-label="Tutup kejutan"
          className="absolute top-4 right-4 p-2 text-pink-400 hover:text-pink-700 hover:bg-pink-50 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Interactive Vector Cake with Candles & Wind Gust */}
        <div className="my-1 flex flex-col items-center">
          <VectorCake
            candlesBlown={candlesBlown}
            isBlowing={isBlowing}
            onBlow={handleBlowCandles}
          />

          {/* Candle Action Hint */}
          <div className="mt-2.5">
            {!candlesBlown ? (
              <button
                type="button"
                onClick={handleBlowCandles}
                disabled={isBlowing}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full transition-all shadow-sm cursor-pointer ${
                  isBlowing
                    ? 'bg-sky-100 text-sky-800 scale-105 ring-2 ring-sky-300'
                    : 'text-pink-700 bg-pink-100/85 hover:bg-pink-200/95 hover:scale-105 active:scale-95'
                }`}
              >
                <span className={isBlowing ? 'inline-block animate-bounce' : ''}>🌬️</span>
                <span>{isBlowing ? 'Meniup Lilin...' : 'Tiup Lilin'}</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/90 px-3.5 py-1 rounded-full animate-bounce shadow-sm">
                  Kue-nya virtual aja yaaaa😅
                </span>
                <button
                  onClick={handleRelight}
                  title="Nyalakan lilin kembali"
                  className="p-1 text-slate-400 hover:text-pink-600 rounded-full hover:bg-pink-50 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Revealed Photo Carousel after blowing candles */}
        {candlesBlown && (
          <div className="mt-3 animate-in zoom-in-95 fade-in duration-500 flex flex-col items-center w-full">
            <div className="relative bg-white p-3 pb-3 rounded-2xl shadow-xl border border-pink-200/90 transform rotate-[-0.5deg] hover:rotate-0 transition-transform duration-300 max-w-[270px] sm:max-w-[290px] w-full">
              {/* Slide Counter Badge */}
              <div className="absolute top-4 right-4 z-10 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-sm text-[10px] font-semibold text-white tracking-wider">
                {currentSlide + 1} / {DEFAULT_PHOTO_SLIDES.length}
              </div>

              {/* Prev Slide Arrow */}
              <button
                type="button"
                onClick={handlePrevSlide}
                aria-label="Foto sebelumnya"
                title="Foto sebelumnya"
                className="absolute left-[-12px] top-[40%] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-pink-50 text-pink-700 shadow-md border border-pink-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Next Slide Arrow */}
              <button
                type="button"
                onClick={handleNextSlide}
                aria-label="Foto selanjutnya"
                title="Foto selanjutnya"
                className="absolute right-[-12px] top-[40%] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-pink-50 text-pink-700 shadow-md border border-pink-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Image Frame */}
              <div className="w-full aspect-square overflow-hidden rounded-xl border border-pink-100 bg-pink-50 shadow-inner relative">
                <img
                  key={currentSlide}
                  src={activeSlide.src}
                  alt={`Foto ${recipientName} ${currentSlide + 1}`}
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
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  {DEFAULT_PHOTO_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSlide(idx)}
                      aria-label={`Lihat foto ${idx + 1}`}
                      className={`h-2 transition-all rounded-full cursor-pointer ${
                        currentSlide === idx
                          ? 'w-5 bg-gradient-to-r from-pink-600 to-rose-600 shadow-sm'
                          : 'w-2 bg-pink-200 hover:bg-pink-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#d81b60] to-[#ad1457] hover:from-[#c2185b] hover:to-[#880e4f] text-white font-medium text-sm sm:text-base rounded-full shadow-lg shadow-pink-600/30 hover:shadow-pink-600/50 hover:-translate-y-0.5 active:translate-y-0 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Canvas-based Confetti Explosion */}
      <ConfettiCanvas triggerKey={confettiTrigger} />
    </div>
  );
};
