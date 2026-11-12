import React, { useState } from 'react';
import { Sparkles, Flame, X, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';
import { ConfettiCanvas } from './ConfettiCanvas';

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
  const [wishMade, setWishMade] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  if (!isOpen) return null;

  const handleBlowCandles = () => {
    if (candlesBlown) return;
    setCandlesBlown(true);
    setWishMade(true);
    setConfettiTrigger(Date.now());
    sound.playBlowCandle();
  };

  const handleRelight = () => {
    setCandlesBlown(false);
    setWishMade(false);
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

        {/* Interactive Cake Illustration */}
        <div className="my-2 flex flex-col items-center">
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

        {/* Revealed Photo after blowing candles */}
        {candlesBlown && (
          <div className="mt-4 animate-in zoom-in-95 fade-in duration-500 flex flex-col items-center">
            <div className="relative inline-block bg-white p-3 pb-3.5 rounded-2xl shadow-xl border border-pink-200/90 transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
              <div className="w-56 sm:w-60 aspect-square overflow-hidden rounded-xl border border-pink-100 bg-pink-50 shadow-inner">
                <img
                  src="/assets/aistudio/IMG-20261110-WA0692_a3015910.jpg"
                  alt={`Foto ${recipientName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-2 text-center">
                <p className="font-serif-display text-pink-900 font-bold text-sm tracking-wide">
                  {recipientName} 🌸✨
                </p>
                <p className="text-[11px] text-pink-600 font-medium mt-0.5">
                  Happy Birthday!!! 😋
                </p>
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
