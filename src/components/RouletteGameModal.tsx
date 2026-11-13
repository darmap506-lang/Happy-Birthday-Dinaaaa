import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, RotateCw } from 'lucide-react';
import {
  RIGGED_PRIZE_INDEX,
  ROULETTE_PRIZES,
  buildWheelSliceGeometry,
  computeSpinTargetAngle,
  getRouletteHeading,
} from '../utils/roulette';
import { sound } from '../utils/audio';
import { ConfettiCanvas } from './ConfettiCanvas';
import { PixelOrangeCat, PixelPanda } from './PixelMascots';

interface RouletteGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
}

const SPIN_DURATION_MS = 3800;
const WALK_ARRIVAL_MS = 1250;

export const RouletteGameModal: React.FC<RouletteGameModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [rotationDeg, setRotationDeg] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showPrizeStage, setShowPrizeStage] = useState(false);
  const [mascotsClapping, setMascotsClapping] = useState(false);
  const [prizeRunKey, setPrizeRunKey] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const spinTimerRef = useRef<number | null>(null);
  const stageTimerRef = useRef<number | null>(null);
  const clapTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (spinTimerRef.current !== null) {
      window.clearTimeout(spinTimerRef.current);
      spinTimerRef.current = null;
    }
    if (stageTimerRef.current !== null) {
      window.clearTimeout(stageTimerRef.current);
      stageTimerRef.current = null;
    }
    if (clapTimerRef.current !== null) {
      window.clearTimeout(clapTimerRef.current);
      clapTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      clearTimers();
      setIsSpinning(false);
      setShowPrizeStage(false);
      setMascotsClapping(false);
    } else {
      const shoeSrc = ROULETTE_PRIZES[RIGGED_PRIZE_INDEX]?.imageSrc;
      if (shoeSrc) {
        const preloader = new window.Image();
        preloader.src = shoeSrc;
        if (typeof preloader.decode === 'function') {
          preloader.decode().catch(() => {});
        }
      }
    }
    return () => {
      clearTimers();
    };
  }, [isOpen]);

  const wheelSlices = useMemo(
    () =>
      ROULETTE_PRIZES.map((prize, idx) => ({
        prize,
        geom: buildWheelSliceGeometry(idx, ROULETTE_PRIZES.length, 160, 160, 142),
      })),
    []
  );

  const rimDots = useMemo(() => {
    return Array.from({ length: 15 }, (_, idx) => {
      const deg = idx * 24;
      const rad = ((deg - 90) * Math.PI) / 180;
      return {
        cx: 160 + 151 * Math.cos(rad),
        cy: 160 + 151 * Math.sin(rad),
        gold: idx % 2 === 0,
      };
    });
  }, []);

  if (!isOpen) return null;

  const winningPrize = ROULETTE_PRIZES[RIGGED_PRIZE_INDEX];

  const handleSpin = () => {
    if (isSpinning) return;
    clearTimers();
    setShowPrizeStage(false);
    setMascotsClapping(false);
    setIsSpinning(true);
    sound.playSparkle();

    // Small natural jitter inside Sepatu NB wedge (±10 deg, well within ±36 deg wedge bounds)
    const jitter = (Math.random() - 0.5) * 20;
    const nextAngle = computeSpinTargetAngle(
      rotationDeg,
      RIGGED_PRIZE_INDEX,
      ROULETTE_PRIZES.length,
      6,
      jitter
    );
    setRotationDeg(nextAngle);

    spinTimerRef.current = window.setTimeout(() => {
      setIsSpinning(false);
      sound.playSparkle();
      stageTimerRef.current = window.setTimeout(() => {
        setShowPrizeStage(true);
        setMascotsClapping(false);
        setPrizeRunKey((prev) => prev + 1);
        setConfettiTrigger(Date.now());
        sound.playSparkle();

        clapTimerRef.current = window.setTimeout(() => {
          setMascotsClapping(true);
        }, WALK_ARRIVAL_MS);
      }, 280);
    }, SPIN_DURATION_MS);
  };

  const handleSpinAgain = () => {
    clearTimers();
    setShowPrizeStage(false);
    setMascotsClapping(false);
    window.setTimeout(() => {
      handleSpin();
    }, 30);
  };

  const headingText = getRouletteHeading(showPrizeStage);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={headingText}
      data-testid="roulette-game-modal"
      className="fixed inset-0 z-[65] flex items-center justify-center p-2.5 sm:p-4 bg-black/65 animate-in fade-in duration-250"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSpinning) onClose();
      }}
    >
      <div className="relative z-10 bg-white border-2 border-pink-200 rounded-[24px] sm:rounded-3xl p-4 min-[390px]:p-5 sm:p-6 max-w-md w-full max-h-[92dvh] overflow-y-auto overflow-x-hidden overscroll-contain text-center shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={isSpinning}
          aria-label="Tutup game roulette"
          className="absolute top-2 right-2 sm:top-3.5 sm:right-3.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-pink-400 hover:text-pink-700 hover:bg-pink-50 rounded-full transition-colors disabled:opacity-40 touch-manipulation cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <h2
          data-testid="roulette-modal-heading"
          className="font-serif-display text-lg min-[390px]:text-xl sm:text-2xl font-bold text-[#880e4f] mb-3.5 sm:mb-4 px-8"
        >
          {headingText}
        </h2>

        {!showPrizeStage ? (
          <>
            {/* Roulette Wheel Stage */}
            <div className="relative mx-auto w-[min(70vw,268px)] h-[min(70vw,268px)] sm:w-[308px] sm:h-[308px] flex items-center justify-center">
              {/* Top Pointer Needle (12 o'clock) */}
              <div
                aria-hidden="true"
                className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 drop-shadow-md"
              >
                <svg width="32" height="34" viewBox="0 0 32 34">
                  <path
                    d="M 16 32 L 4 8 Q 3 2 10 2 L 22 2 Q 29 2 28 8 Z"
                    fill="#be185d"
                    stroke="#fde68a"
                    strokeWidth="2.5"
                  />
                  <circle cx="16" cy="10" r="3" fill="#fef3c7" />
                </svg>
              </div>

              {/* Spinning Wheel */}
              <div
                data-testid="roulette-wheel"
                data-rotation={rotationDeg.toFixed(2)}
                className="w-full h-full rounded-full shadow-xl"
                style={{
                  transform: `rotate(${rotationDeg}deg)`,
                  transition: isSpinning
                    ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.12, 0.88, 0.18, 1)`
                    : 'none',
                }}
              >
                <svg viewBox="0 0 320 320" className="w-full h-full overflow-visible">
                  {/* Outer Gold Rim */}
                  <circle cx="160" cy="160" r="157" fill="#be185d" stroke="#f59e0b" strokeWidth="4" />
                  <circle cx="160" cy="160" r="144" fill="#fff1f2" />

                  {/* Decorative Rim Dots */}
                  {rimDots.map((dot, i) => (
                    <circle
                      key={`rim-${i}`}
                      cx={dot.cx}
                      cy={dot.cy}
                      r="3.2"
                      fill={dot.gold ? '#fde047' : '#ffffff'}
                    />
                  ))}

                  {/* 5 Equal Prize Slices */}
                  {wheelSlices.map(({ prize, geom }) => (
                    <g key={prize.id}>
                      <path
                        d={geom.pathD}
                        fill={prize.fill}
                        stroke="#ffffff"
                        strokeWidth="2.4"
                        strokeLinejoin="round"
                      />
                      <g
                        transform={`translate(${geom.labelX}, ${geom.labelY}) rotate(${geom.midAngleDeg})`}
                      >
                        <text
                          x="0"
                          y="-18"
                          textAnchor="middle"
                          fontSize="16"
                          dominantBaseline="middle"
                        >
                          {prize.emoji}
                        </text>
                        {prize.shortLines.map((line, lineIdx) => (
                          <text
                            key={`${prize.id}-line-${lineIdx}`}
                            x="0"
                            y={lineIdx * 12}
                            textAnchor="middle"
                            fill={prize.textColor}
                            fontSize="10.2"
                            fontWeight="700"
                            fontFamily="Poppins, sans-serif"
                          >
                            {line}
                          </text>
                        ))}
                      </g>
                    </g>
                  ))}

                  {/* Center Hub Cap */}
                  <circle cx="160" cy="160" r="24" fill="#be185d" stroke="#fde68a" strokeWidth="3.5" />
                  <text
                    x="160"
                    y="161"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="16"
                  >
                    🎁
                  </text>
                </svg>
              </div>
            </div>

            {/* Spin Button */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                data-testid="btn-spin-roulette"
                className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-7 py-2.5 bg-gradient-to-r from-[#d81b60] to-[#ad1457] hover:from-[#c2185b] hover:to-[#880e4f] disabled:opacity-60 text-white font-semibold text-sm sm:text-base rounded-full shadow-lg shadow-pink-600/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all touch-manipulation whitespace-nowrap cursor-pointer"
              >
                <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'Memutar Roda...' : 'Putar Roulette!'}</span>
              </button>
            </div>
          </>
        ) : (
          /* Animated Prize Reveal: Sepatu NB drops from top, Panda walks from left & claps, Cat walks from right & claps */
          <div
            key={`prize-stage-${prizeRunKey}`}
            data-testid="roulette-prize-stage"
            className="relative overflow-hidden py-2"
          >
            <div className="flex items-end justify-center gap-1 min-[390px]:gap-2 sm:gap-3 w-full">
              {/* Panda walks in from left and stops at left side of Sepatu image, clapping */}
              <div className="shrink-0 mb-1 animate-panda-walk-from-left">
                <PixelPanda
                  mode={mascotsClapping ? 'clap' : 'idle'}
                  testId="prize-panda"
                />
              </div>

              {/* Sepatu Image drops from top */}
              <div className="flex-1 min-w-0 max-w-[168px] min-[390px]:max-w-[192px] sm:max-w-[218px] animate-shoe-drop-from-top">
                <div className="rounded-2xl overflow-hidden border-2 border-pink-200 bg-pink-50 shadow-lg aspect-[4/3]">
                  <img
                    src={winningPrize.imageSrc}
                    alt="Sepatu"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <p className="mt-2 font-serif-display text-lg sm:text-xl font-bold text-[#880e4f]">
                  {winningPrize.label} 👟✨
                </p>
              </div>

              {/* Orange Cat walks in from right and stops at right side of Sepatu image, clapping */}
              <div className="shrink-0 mb-1 animate-cat-walk-prize-from-right">
                <PixelOrangeCat
                  mode={mascotsClapping ? 'clap' : 'idle'}
                  testId="prize-cat"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleSpinAgain}
                className="flex-1 sm:flex-initial min-h-[46px] px-4 sm:px-5 py-2.5 bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-200 font-semibold text-sm rounded-full transition-colors active:scale-[0.98] touch-manipulation whitespace-nowrap cursor-pointer"
              >
                Putar Lagi
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial min-h-[46px] px-6 sm:px-7 py-2.5 bg-gradient-to-r from-[#d81b60] to-[#ad1457] hover:from-[#c2185b] hover:to-[#880e4f] text-white font-semibold text-sm rounded-full shadow-md transition-all active:scale-[0.98] touch-manipulation whitespace-nowrap cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Confetti Burst on Prize Reveal */}
      <ConfettiCanvas triggerKey={confettiTrigger} />
    </div>
  );
};
