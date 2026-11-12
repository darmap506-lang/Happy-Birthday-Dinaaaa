import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Flame, X, RotateCcw, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { sound } from '../utils/audio';
import { ConfettiCanvas } from './ConfettiCanvas';
import { getNextSlideIndex, getPrevSlideIndex } from '../utils/slider';

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
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [customPhotos, setCustomPhotos] = useState<Record<number, string>>({});
  const touchStartX = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load any user-uploaded custom photos from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPhotos: Record<number, string> = {};
      [0, 1, 2].forEach((idx) => {
        const stored = localStorage.getItem(`bday_photo_slide_${idx}`);
        if (stored) savedPhotos[idx] = stored;
      });
      setCustomPhotos(savedPhotos);
    }
  }, []);

  if (!isOpen) return null;

  const defaultPhotos = [
    {
      url: customPhotos[0] || '/assets/images/photo1.jpg',
      title: `${recipientName} 🌸✨`,
      caption: 'Happy Birthday!!! 😋',
    },
    {
      url: customPhotos[1] || '/assets/images/photo2.jpg',
      title: 'Hehehehe✌😁',
      caption: '',
    },
    {
      url: customPhotos[2] || '/assets/images/photo3.jpg',
      title: 'Bismillah jadi BA vaseline',
      caption: '',
    },
  ];

  const handleBlowCandles = () => {
    if (candlesBlown) return;
    setCandlesBlown(true);
    setConfettiTrigger(Date.now());
    sound.playBlowCandle();
  };

  const handleRelight = () => {
    setCandlesBlown(false);
    sound.playSparkle();
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => getNextSlideIndex(prev, 3));
    sound.playSparkle();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => getPrevSlideIndex(prev, 3));
    sound.playSparkle();
  };

  // Touch swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  // Custom photo upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          const updated = { ...customPhotos, [currentSlide]: result };
          setCustomPhotos(updated);
          localStorage.setItem(`bday_photo_slide_${currentSlide}`, result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kejutan Ulang Tahun"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-md animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white/95 backdrop-blur-lg border-2 border-pink-200/90 rounded-3xl p-5 sm:p-7 max-w-sm sm:max-w-md w-full text-center shadow-2xl transition-all transform scale-100 animate-in zoom-in-95 duration-200">
        {/* Close icon top-right */}
        <button
          onClick={onClose}
          aria-label="Tutup kejutan"
          className="absolute top-3.5 right-3.5 p-2 text-pink-400 hover:text-pink-700 hover:bg-pink-50 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Interactive Cake Illustration */}
        <div className="my-1.5 flex flex-col items-center">
          <div className="relative inline-flex flex-col items-center select-none">
            {/* Candles flame cluster */}
            <div className="flex items-end justify-center gap-4 h-7 mb-0.5">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="flex flex-col items-center">
                  {!candlesBlown ? (
                    <span
                      className="text-amber-500 animate-candle-flame inline-block text-lg cursor-pointer transition-transform hover:scale-125"
                      onClick={handleBlowCandles}
                      title="Ketuk lilin untuk meniup"
                    >
                      <Flame className="w-5 h-5 fill-amber-400 stroke-amber-500" />
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs animate-fade-out opacity-60">
                      💨
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Cake Emoji / Graphic */}
            <div
              onClick={handleBlowCandles}
              className={`text-5xl cursor-pointer transition-transform duration-300 ${
                !candlesBlown ? 'animate-pulse-heart hover:scale-110' : 'scale-100'
              }`}
              title="Ketuk kue untuk meniup lilin"
            >
              🎂
            </div>
          </div>

          {/* Candle Action Hint */}
          <div className="mt-2">
            {!candlesBlown ? (
              <button
                type="button"
                onClick={handleBlowCandles}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-700 bg-pink-100/80 hover:bg-pink-200/90 px-3.5 py-1.5 rounded-full transition-colors shadow-sm"
              >
                <span>🌬️</span>
                <span>Tiup Lilin</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/90 px-3 py-1 rounded-full animate-bounce">
                  Maaf✌✌
                </span>
                <button
                  onClick={handleRelight}
                  title="Nyalakan lilin kembali"
                  className="p-1 text-slate-400 hover:text-pink-600 rounded-full hover:bg-pink-50 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3-Photo Slider Revealed after blowing candles */}
        {candlesBlown && (
          <div className="mt-3 animate-in zoom-in-95 fade-in duration-500 flex flex-col items-center">
            <div
              className="relative inline-block bg-white p-3 pb-3.5 rounded-2xl shadow-xl border border-pink-200/90 transform rotate-[-0.5deg] hover:rotate-0 transition-transform duration-300 w-full max-w-[275px] sm:max-w-[290px]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Photo Viewport */}
              <div className="relative w-full aspect-square overflow-hidden rounded-xl border border-pink-100 bg-pink-50 shadow-inner group">
                <img
                  src={defaultPhotos[currentSlide].url}
                  alt={defaultPhotos[currentSlide].title}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />

                {/* Slide Counter Badge */}
                <div className="absolute top-2 right-2 bg-black/55 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full select-none">
                  {currentSlide + 1} / 3
                </div>

                {/* Optional Change Photo Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Ganti foto slide ini"
                  className="absolute top-2 left-2 bg-white/80 hover:bg-white text-pink-700 p-1.5 rounded-full shadow-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Navigation Arrows */}
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Foto sebelumnya"
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 text-white p-1.5 rounded-full backdrop-blur-xs transition-all active:scale-95 focus:outline-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Foto selanjutnya"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 text-white p-1.5 rounded-full backdrop-blur-xs transition-all active:scale-95 focus:outline-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-center items-center gap-1.5 mt-2.5">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentSlide(idx);
                      sound.playSparkle();
                    }}
                    aria-label={`Slide foto ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentSlide === idx
                        ? 'w-6 bg-pink-600'
                        : 'w-2 bg-pink-200 hover:bg-pink-300'
                    }`}
                  />
                ))}
              </div>

              {/* Photo Caption & Title */}
              <div className="mt-2 text-center min-h-[44px] flex flex-col justify-center items-center">
                {defaultPhotos[currentSlide].title && (
                  <p className="font-serif-display text-pink-900 font-bold text-sm tracking-wide">
                    {defaultPhotos[currentSlide].title}
                  </p>
                )}
                {defaultPhotos[currentSlide].caption ? (
                  <p className="text-[11px] text-pink-600 font-medium mt-0.5">
                    {defaultPhotos[currentSlide].caption}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center gap-3 mt-4 sm:mt-5">
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
