import React from 'react';
import { Gift, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

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
  const handleSurpriseClick = () => {
    sound.playSparkle();
    onOpenSurprise();
  };

  return (
    <div className="relative z-10 w-full max-w-[460px] mx-auto px-4 py-6 animate-in fade-in zoom-in-95 duration-700">
      <div
        className="relative bg-white/90 backdrop-blur-xl rounded-[24px] px-6 py-8 sm:px-9 sm:py-10 text-center shadow-[0_15px_35px_rgba(136,14,79,0.15)] border-2 border-white/80 transition-all hover:shadow-[0_20px_45px_rgba(136,14,79,0.22)]"
      >
        {/* Decorative corner blossom */}
        <div className="absolute -top-3.5 -right-3.5 text-2xl select-none animate-bounce" style={{ animationDuration: '3s' }}>
          🌸
        </div>
        <div className="absolute -bottom-3 -left-3 text-2xl select-none animate-pulse">
          ✨
        </div>

        {/* Subtitle */}
        <div className="text-xs sm:text-sm font-semibold text-[#ad1457] uppercase tracking-[2.5px] mb-3 select-none flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Selamat Ulang Tahun</span>
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
        </div>

        {/* Main Name Heading */}
        <h1 className="font-serif-display text-[#880e4f] text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
          {recipientName} 🎉
        </h1>

        {/* Warm Greeting Message */}
        <p className="text-[#4a4a4a] text-sm sm:text-base leading-relaxed sm:leading-[1.7] mb-8 font-normal">
          Semoga di usia yang baru ini, hari-harimu dipenuhi dengan kebahagiaan, senyuman, kesuksesan, dan tercapainya semua impian indahmu. Tetap jadi pribadi yang inspiratif ya! 🌸✨
        </p>

        {/* Primary CTA Button: pencet lerrrr */}
        <div>
          <button
            type="button"
            onClick={handleSurpriseClick}
            aria-label="pencet lerrrr"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-3.5 bg-gradient-to-r from-[#d81b60] to-[#ad1457] hover:from-[#c2185b] hover:to-[#880e4f] text-white font-semibold text-base rounded-full shadow-[0_6px_20px_rgba(216,27,96,0.4)] hover:shadow-[0_8px_25px_rgba(216,27,96,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300"
          >
            <Gift className="w-5 h-5 text-pink-100" />
            <span>pencet lerrrr 🎁</span>
          </button>
        </div>

        {/* Option to close envelope and return to first screen */}
        <div className="mt-5">
          <button
            type="button"
            onClick={onCloseEnvelope}
            aria-label="Tutup amplop dan kembali ke halaman pertama"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-pink-700/80 hover:text-pink-950 font-medium transition-colors hover:underline px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 rounded-md"
          >
            <span>✉️</span>
            <span>Tutup Amplop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
