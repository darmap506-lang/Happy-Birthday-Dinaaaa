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
    <div className="relative z-10 w-full max-w-[460px] mx-auto px-1 sm:px-4 py-2 sm:py-6 animate-card-enter">
      <div
        className="relative bg-white/92 backdrop-blur-xl rounded-[24px] px-5 py-6 min-[390px]:px-6 min-[390px]:py-7 sm:px-9 sm:py-10 text-center shadow-[0_15px_35px_rgba(136,14,79,0.15)] border-2 border-white/80 transition-all hover:shadow-[0_20px_45px_rgba(136,14,79,0.22)]"
      >
        {/* Decorative corner blossom */}
        <div className="absolute -top-3 -right-2.5 sm:-top-3.5 sm:-right-3.5 text-xl sm:text-2xl select-none animate-bounce pointer-events-none" style={{ animationDuration: '3s' }}>
          🌸
        </div>
        <div className="absolute -bottom-2.5 -left-2.5 sm:-bottom-3 sm:-left-3 text-xl sm:text-2xl select-none animate-pulse pointer-events-none">
          ✨
        </div>

        {/* Subtitle */}
        <div className="text-[11px] sm:text-sm font-semibold text-[#ad1457] uppercase tracking-[2px] sm:tracking-[2.5px] mb-2.5 sm:mb-3 select-none flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0" />
          <span>Selamat Ulang Tahun</span>
          <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0" />
        </div>

        {/* Main Name Heading */}
        <h1 className="font-serif-display text-[#880e4f] text-[26px] min-[390px]:text-3xl sm:text-4xl font-bold mb-3.5 sm:mb-4 tracking-tight text-balance">
          {recipientName}
        </h1>

        {/* Warm Greeting Message */}
        <p className="text-[#4a4a4a] text-[13.5px] min-[390px]:text-sm sm:text-base leading-relaxed sm:leading-[1.7] mb-6 sm:mb-8 font-normal whitespace-pre-line">
          {`Happy birthday!!!Dinaaaa.  I hope this year brings u new opportunities and plenty of happiness. Sehat terus yaa dan sukses selaluuuu, semoga segala harapan yang belum tercapai segera tercapaii.\nBe happy, be awesome. May peace be upon u!!!🤲✌☺️✌`}
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

        {/* Option to close envelope and return to first screen */}
        <div className="mt-3.5 sm:mt-5 flex justify-center">
          <button
            type="button"
            onClick={onCloseEnvelope}
            aria-label="Tutup dan kembali ke amplop"
            className="min-h-[44px] min-w-[88px] inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm text-pink-700/85 hover:text-pink-950 font-medium transition-colors hover:underline px-4 py-2 touch-manipulation active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 rounded-full"
          >
            <span>✉️</span>
            <span>Tutup</span>
          </button>
        </div>
      </div>
    </div>
  );
};
