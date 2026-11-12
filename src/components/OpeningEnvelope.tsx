import React, { useState } from 'react';
import { sound } from '../utils/audio';

interface OpeningEnvelopeProps {
  recipientName: string;
  onOpenComplete: () => void;
}

export const OpeningEnvelope: React.FC<OpeningEnvelopeProps> = ({
  recipientName,
  onOpenComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    sound.startMusic();
    sound.playEnvelopeOpen();

    // Sequence timing matching original HTML logic
    setTimeout(() => {
      setIsHiding(true);
      setTimeout(() => {
        onOpenComplete();
      }, 700);
    }, 1250);
  };

  return (
    <div
      className={`fixed inset-0 z-20 flex flex-col items-center justify-center p-4 transition-all duration-700 ease-out ${
        isHiding ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="relative envelope-perspective flex flex-col items-center">
        {/* Envelope 3D Container */}
        <button
          type="button"
          onClick={handleOpen}
          aria-label={`Buka amplop ucapan ulang tahun untuk ${recipientName}`}
          className={`envelope-wrapper group focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-400 focus-visible:ring-offset-2 rounded-b-2xl select-none ${
            isOpen ? 'open cursor-default' : ''
          }`}
        >
          {/* Top Flap */}
          <div className="envelope-flap-top" />

          {/* Letter inside */}
          <div className="letter-content">
            <p className="font-serif-display text-pink-900 text-base sm:text-lg md:text-xl font-bold tracking-wide text-center">
              from Darto to Wita 🌸
            </p>
          </div>

          {/* Front triangular pocket */}
          <div className="envelope-front-pocket" />
        </button>

      </div>
    </div>
  );
};
