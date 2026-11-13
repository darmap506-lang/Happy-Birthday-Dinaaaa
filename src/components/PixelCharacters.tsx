import React, { useEffect, useState } from 'react';
import { CatAnimationMode, CharacterPlacement } from '../utils/pixelCharacters';

interface PixelPandaProps {
  placement: CharacterPlacement;
  isBlowing?: boolean;
  className?: string;
}

/**
 * Pixel-art Panda holding a pastel pink pixel balloon.
 */
export const PixelPanda: React.FC<PixelPandaProps> = ({
  placement,
  isBlowing = false,
  className = '',
}) => {
  return (
    <div
      data-testid="pixel-panda"
      data-placement={placement}
      aria-hidden="true"
      className={`pointer-events-none select-none inline-flex flex-col items-center ${
        isBlowing ? 'animate-panda-lean' : 'animate-pixel-idle'
      } ${className}`}
    >
      <svg
        viewBox="0 0 34 44"
        shapeRendering="crispEdges"
        className="w-full h-auto overflow-visible drop-shadow-[0_4px_6px_rgba(136,14,79,0.18)]"
      >
        {/* Pixel Balloon (outer-left, floating with gentle sway) */}
        <g className="animate-pixel-balloon origin-bottom">
          {/* Balloon outline & fill (Pink Heart/Round Pixel Balloon) */}
          <rect x="4" y="1" width="6" height="1" fill="#9d174d" />
          <rect x="3" y="2" width="1" height="1" fill="#9d174d" />
          <rect x="10" y="2" width="1" height="1" fill="#9d174d" />
          <rect x="2" y="3" width="1" height="5" fill="#9d174d" />
          <rect x="11" y="3" width="1" height="5" fill="#9d174d" />
          <rect x="3" y="8" width="1" height="2" fill="#9d174d" />
          <rect x="10" y="8" width="1" height="2" fill="#9d174d" />
          <rect x="4" y="10" width="2" height="1" fill="#9d174d" />
          <rect x="8" y="10" width="2" height="1" fill="#9d174d" />
          <rect x="6" y="11" width="2" height="1" fill="#9d174d" />

          {/* Main Pink Balloon Body */}
          <rect x="4" y="2" width="6" height="8" fill="#f43f5e" />
          <rect x="3" y="3" width="8" height="5" fill="#f43f5e" />
          <rect x="5" y="10" width="4" height="1" fill="#e11d48" />
          {/* Glossy Pixel Highlight */}
          <rect x="4" y="3" width="2" height="2" fill="#ffe4e6" />
          <rect x="4" y="5" width="1" height="1" fill="#fecdd3" />
          {/* Balloon Knot */}
          <rect x="6" y="12" width="2" height="1" fill="#be123c" />

          {/* Stepped Pixel Balloon String to Panda Paw */}
          <rect x="7" y="13" width="1" height="4" fill="#64748b" />
          <rect x="8" y="17" width="1" height="4" fill="#64748b" />
          <rect x="9" y="21" width="1" height="4" fill="#64748b" />
          <rect x="10" y="25" width="1" height="4" fill="#64748b" />
          <rect x="11" y="29" width="1" height="2" fill="#64748b" />
        </g>

        {/* Pixel Panda Sprite */}
        <g>
          {/* Ears */}
          <rect x="12" y="15" width="4" height="3" fill="#1e293b" />
          <rect x="13" y="14" width="2" height="1" fill="#1e293b" />
          <rect x="24" y="15" width="4" height="3" fill="#1e293b" />
          <rect x="25" y="14" width="2" height="1" fill="#1e293b" />

          {/* Head Outline */}
          <rect x="15" y="15" width="10" height="1" fill="#1e293b" />
          <rect x="13" y="16" width="2" height="1" fill="#1e293b" />
          <rect x="25" y="16" width="2" height="1" fill="#1e293b" />
          <rect x="12" y="17" width="1" height="8" fill="#1e293b" />
          <rect x="27" y="17" width="1" height="8" fill="#1e293b" />
          <rect x="13" y="25" width="2" height="1" fill="#1e293b" />
          <rect x="25" y="25" width="2" height="1" fill="#1e293b" />
          <rect x="15" y="26" width="10" height="1" fill="#1e293b" />

          {/* Head White Fill */}
          <rect x="15" y="16" width="10" height="1" fill="#ffffff" />
          <rect x="13" y="17" width="14" height="8" fill="#ffffff" />
          <rect x="15" y="25" width="10" height="1" fill="#ffffff" />
          {/* Subtle shading under chin */}
          <rect x="15" y="25" width="10" height="1" fill="#f1f5f9" />

          {/* Black Eye Patches */}
          <rect x="15" y="19" width="3" height="4" fill="#1e293b" />
          <rect x="14" y="20" width="1" height="2" fill="#1e293b" />
          <rect x="22" y="19" width="3" height="4" fill="#1e293b" />
          <rect x="25" y="20" width="1" height="2" fill="#1e293b" />

          {/* Shiny Eyes */}
          <rect x="16" y="20" width="1" height="1" fill="#ffffff" />
          <rect x="23" y="20" width="1" height="1" fill="#ffffff" />

          {/* Rosy Pixel Cheeks */}
          <rect x="13" y="23" width="2" height="1" fill="#fda4af" />
          <rect x="25" y="23" width="2" height="1" fill="#fda4af" />

          {/* Nose & Cute Smile */}
          <rect x="19" y="22" width="2" height="1" fill="#1e293b" />
          <rect x="18" y="24" width="1" height="1" fill="#475569" />
          <rect x="19" y="24" width="2" height="1" fill="#475569" />
          <rect x="21" y="24" width="1" height="1" fill="#475569" />

          {/* Neck / Black Shoulder Band */}
          <rect x="13" y="27" width="14" height="2" fill="#1e293b" />

          {/* Left Arm Raised Holding Balloon String */}
          <rect x="10" y="29" width="3" height="3" fill="#1e293b" />
          <rect x="11" y="28" width="2" height="1" fill="#1e293b" />
          <rect x="10" y="30" width="1" height="1" fill="#f472b6" />

          {/* Right Arm Resting / Waving */}
          <rect x="27" y="28" width="2" height="5" fill="#1e293b" />
          <rect x="29" y="29" width="1" height="3" fill="#1e293b" />

          {/* Chubby White Belly */}
          <rect x="14" y="29" width="12" height="7" fill="#ffffff" />
          <rect x="13" y="29" width="1" height="7" fill="#1e293b" />
          <rect x="26" y="29" width="1" height="7" fill="#1e293b" />
          <rect x="15" y="36" width="10" height="1" fill="#1e293b" />

          {/* Cute Little Party Belly Patch / Shadow */}
          <rect x="15" y="34" width="10" height="2" fill="#e2e8f0" />

          {/* Black Feet */}
          <rect x="13" y="37" width="5" height="4" fill="#1e293b" />
          <rect x="14" y="41" width="3" height="1" fill="#1e293b" />
          <rect x="15" y="39" width="2" height="1" fill="#fda4af" />

          <rect x="22" y="37" width="5" height="4" fill="#1e293b" />
          <rect x="23" y="41" width="3" height="1" fill="#1e293b" />
          <rect x="24" y="39" width="2" height="1" fill="#fda4af" />
        </g>
      </svg>
    </div>
  );
};

interface PixelCatProps {
  placement: CharacterPlacement;
  mode?: CatAnimationMode;
  className?: string;
}

/**
 * Pixel-art Orange Cat ("Kucing Orange") holding a sky-blue pixel balloon.
 * Supports 3 animation states:
 * - 'idle': gentle pixel bobbing while holding balloon
 * - 'wind-fly': swept rightward & upward when candles are blown
 * - 'walk-in': walks in from the right edge of the page with pixel leg stride, then stands beside the cake
 */
export const PixelCat: React.FC<PixelCatProps> = ({
  placement,
  mode = 'idle',
  className = '',
}) => {
  const [isWalking, setIsWalking] = useState(mode === 'walk-in');

  useEffect(() => {
    if (mode !== 'walk-in') {
      setIsWalking(false);
      return;
    }

    setIsWalking(true);
    const timer = window.setTimeout(() => {
      setIsWalking(false);
    }, 1700);

    return () => window.clearTimeout(timer);
  }, [mode]);

  const wrapperAnimationClass =
    mode === 'wind-fly'
      ? 'animate-cat-wind-fly'
      : mode === 'walk-in'
      ? 'animate-cat-walk-in'
      : 'animate-pixel-idle';

  return (
    <div
      data-testid="pixel-cat"
      data-placement={placement}
      data-cat-mode={mode}
      data-walking={isWalking ? 'true' : 'false'}
      aria-hidden="true"
      className={`pointer-events-none select-none inline-flex flex-col items-center ${wrapperAnimationClass} ${className}`}
    >
      <svg
        viewBox="0 0 34 44"
        shapeRendering="crispEdges"
        className={`w-full h-auto overflow-visible drop-shadow-[0_4px_6px_rgba(194,65,12,0.2)] ${
          isWalking ? 'animate-pixel-step-bob' : ''
        }`}
      >
        {/* Sky-Blue / Sunny Pixel Balloon on Outer-Right */}
        <g className="animate-pixel-balloon origin-bottom">
          {/* Balloon Outline */}
          <rect x="24" y="1" width="6" height="1" fill="#0369a1" />
          <rect x="23" y="2" width="1" height="1" fill="#0369a1" />
          <rect x="30" y="2" width="1" height="1" fill="#0369a1" />
          <rect x="22" y="3" width="1" height="5" fill="#0369a1" />
          <rect x="31" y="3" width="1" height="5" fill="#0369a1" />
          <rect x="23" y="8" width="1" height="2" fill="#0369a1" />
          <rect x="30" y="8" width="1" height="2" fill="#0369a1" />
          <rect x="24" y="10" width="2" height="1" fill="#0369a1" />
          <rect x="28" y="10" width="2" height="1" fill="#0369a1" />
          <rect x="26" y="11" width="2" height="1" fill="#0369a1" />

          {/* Main Sky Blue Balloon Body */}
          <rect x="24" y="2" width="6" height="8" fill="#38bdf8" />
          <rect x="23" y="3" width="8" height="5" fill="#38bdf8" />
          <rect x="25" y="10" width="4" height="1" fill="#0284c7" />
          {/* Glossy Pixel Highlight */}
          <rect x="24" y="3" width="2" height="2" fill="#e0f2fe" />
          <rect x="24" y="5" width="1" height="1" fill="#bae6fd" />
          {/* Knot */}
          <rect x="26" y="12" width="2" height="1" fill="#0369a1" />

          {/* Stepped Pixel String down to Cat's Right Paw */}
          <rect x="26" y="13" width="1" height="4" fill="#64748b" />
          <rect x="25" y="17" width="1" height="4" fill="#64748b" />
          <rect x="24" y="21" width="1" height="4" fill="#64748b" />
          <rect x="23" y="25" width="1" height="4" fill="#64748b" />
          <rect x="22" y="29" width="1" height="2" fill="#64748b" />
        </g>

        {/* Pixel Orange Cat (facing slightly left toward the cake/center) */}
        <g>
          {/* Swishing Striped Orange Tail on the Right */}
          <g className={isWalking ? 'animate-pixel-tail-fast' : 'animate-pixel-tail'}>
            <rect x="22" y="33" width="3" height="2" fill="#9a3412" />
            <rect x="25" y="31" width="3" height="3" fill="#f97316" />
            <rect x="26" y="29" width="3" height="3" fill="#ea580c" />
            <rect x="27" y="27" width="2" height="2" fill="#fb923c" />
            <rect x="27" y="26" width="2" height="1" fill="#fff7ed" />
          </g>

          {/* Pointy Cat Ears */}
          <rect x="9" y="13" width="1" height="3" fill="#9a3412" />
          <rect x="10" y="14" width="2" height="2" fill="#fb923c" />
          <rect x="10" y="15" width="1" height="1" fill="#fda4af" />
          <rect x="12" y="15" width="1" height="1" fill="#9a3412" />

          <rect x="18" y="15" width="1" height="1" fill="#9a3412" />
          <rect x="19" y="14" width="2" height="2" fill="#fb923c" />
          <rect x="20" y="15" width="1" height="1" fill="#fda4af" />
          <rect x="21" y="13" width="1" height="3" fill="#9a3412" />

          {/* Head Outline */}
          <rect x="10" y="16" width="11" height="1" fill="#9a3412" />
          <rect x="8" y="17" width="1" height="8" fill="#9a3412" />
          <rect x="22" y="17" width="1" height="8" fill="#9a3412" />
          <rect x="9" y="25" width="13" height="1" fill="#9a3412" />

          {/* Orange Fur Head */}
          <rect x="9" y="17" width="13" height="8" fill="#fb923c" />

          {/* Forehead Tabby Stripes */}
          <rect x="13" y="17" width="1" height="2" fill="#c2410c" />
          <rect x="15" y="17" width="1" height="2" fill="#c2410c" />
          <rect x="17" y="17" width="1" height="2" fill="#c2410c" />

          {/* Side Cheek Stripes */}
          <rect x="9" y="21" width="1" height="1" fill="#ea580c" />
          <rect x="21" y="21" width="1" height="1" fill="#ea580c" />

          {/* Cream Muzzle */}
          <rect x="11" y="22" width="8" height="3" fill="#fff7ed" />

          {/* Expressive Pixel Eyes */}
          {mode === 'wind-fly' ? (
            <>
              {/* Surprised O_O eyes while flying in the wind! */}
              <rect x="11" y="19" width="2" height="2" fill="#1e293b" />
              <rect x="11" y="19" width="1" height="1" fill="#ffffff" />
              <rect x="17" y="19" width="2" height="2" fill="#1e293b" />
              <rect x="17" y="19" width="1" height="1" fill="#ffffff" />
              {/* Surprised O mouth */}
              <rect x="14" y="23" width="2" height="2" fill="#be123c" />
            </>
          ) : (
            <>
              {/* Happy Sparkly Cat Eyes */}
              <rect x="11" y="19" width="2" height="3" fill="#1e293b" />
              <rect x="11" y="19" width="1" height="1" fill="#ffffff" />
              <rect x="17" y="19" width="2" height="3" fill="#1e293b" />
              <rect x="17" y="19" width="1" height="1" fill="#ffffff" />
              {/* Cute Pink Nose & Mouth */}
              <rect x="14" y="22" width="2" height="1" fill="#f43f5e" />
              <rect x="13" y="23" width="1" height="1" fill="#9a3412" />
              <rect x="16" y="23" width="1" height="1" fill="#9a3412" />
              <rect x="14" y="24" width="2" height="1" fill="#9a3412" />
            </>
          )}

          {/* Body Outline & Orange Torso */}
          <rect x="10" y="26" width="11" height="10" fill="#f97316" />
          <rect x="9" y="27" width="1" height="9" fill="#9a3412" />
          <rect x="21" y="27" width="1" height="9" fill="#9a3412" />
          <rect x="10" y="36" width="11" height="1" fill="#9a3412" />

          {/* Cute Cream Belly */}
          <rect x="12" y="27" width="6" height="8" fill="#fff7ed" />
          {/* Back Tabby Stripes */}
          <rect x="19" y="29" width="2" height="1" fill="#c2410c" />
          <rect x="19" y="32" width="2" height="1" fill="#c2410c" />

          {/* Left Arm */}
          <rect x="7" y="28" width="2" height="4" fill="#fb923c" />
          <rect x="7" y="32" width="2" height="1" fill="#fff7ed" />

          {/* Right Arm Raised Holding Balloon String */}
          <rect x="21" y="29" width="3" height="2" fill="#fb923c" />
          <rect x="22" y="30" width="2" height="1" fill="#fff7ed" />

          {/* Legs (Animated stride when walking in from right!) */}
          <g className={isWalking ? 'animate-pixel-leg-left' : ''}>
            <rect x="10" y="37" width="4" height="4" fill="#ea580c" />
            <rect x="10" y="40" width="4" height="2" fill="#fff7ed" />
          </g>
          <g className={isWalking ? 'animate-pixel-leg-right' : ''}>
            <rect x="17" y="37" width="4" height="4" fill="#ea580c" />
            <rect x="17" y="40" width="4" height="2" fill="#fff7ed" />
          </g>
        </g>
      </svg>
    </div>
  );
};
