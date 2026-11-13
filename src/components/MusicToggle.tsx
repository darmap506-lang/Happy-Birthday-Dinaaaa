import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { sound } from '../utils/audio';

export const MusicToggle: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(sound.getIsMusicPlaying());

  useEffect(() => {
    const unsubscribe = sound.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    sound.toggleMusic();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isPlaying ? 'Matikan background musik' : 'Nyalakan background musik'}
      title={isPlaying ? 'Matikan Background Musik' : 'Nyalakan Background Musik'}
      className={`fixed top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-40 inline-flex items-center gap-1.5 min-h-[42px] px-3.5 py-2 rounded-full border shadow-sm backdrop-blur-md text-xs font-medium transition-all cursor-pointer touch-manipulation select-none active:scale-95 focus:outline-none focus-visible:ring-3 focus-visible:ring-pink-300 ${
        isPlaying
          ? 'bg-white/92 hover:bg-white text-pink-900 border-pink-300 shadow-pink-200/50'
          : 'bg-white/80 hover:bg-white text-slate-600 border-pink-200/80'
      }`}
    >
      {isPlaying ? (
        <>
          <Music className="w-3.5 h-3.5 text-pink-600 motion-safe:animate-spin" style={{ animationDuration: '4s' }} />
          <Volume2 className="w-3.5 h-3.5 text-pink-600" />
          <span className="text-[11px] sm:text-xs font-semibold text-pink-900 whitespace-nowrap">Musik: On</span>
        </>
      ) : (
        <>
          <VolumeX className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px] sm:text-xs font-medium text-slate-600 whitespace-nowrap">Musik: Off</span>
        </>
      )}
    </button>
  );
};
