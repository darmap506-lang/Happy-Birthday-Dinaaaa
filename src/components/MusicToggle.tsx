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
      className={`fixed top-4 right-4 z-40 inline-flex items-center gap-1.5 px-3 py-2 rounded-full border shadow-sm backdrop-blur-md text-xs font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-3 focus-visible:ring-pink-300 ${
        isPlaying
          ? 'bg-white/90 hover:bg-white text-pink-900 border-pink-300 shadow-pink-200/50'
          : 'bg-white/70 hover:bg-white text-slate-500 border-slate-200'
      }`}
    >
      {isPlaying ? (
        <>
          <Music className="w-3.5 h-3.5 text-pink-600 animate-spin" style={{ animationDuration: '4s' }} />
          <Volume2 className="w-3.5 h-3.5 text-pink-600" />
          <span className="text-[11px] font-semibold text-pink-900">Musik: On</span>
        </>
      ) : (
        <>
          <VolumeX className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-medium text-slate-500">Musik: Off</span>
        </>
      )}
    </button>
  );
};
