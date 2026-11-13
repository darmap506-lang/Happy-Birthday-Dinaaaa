import React, { useEffect, useMemo, useRef, useState } from 'react';
import { sound } from '../utils/audio';
import {
  CAKE_SLICE_PALETTE,
  CAKE_SLICE_ROWS,
  CAT_BLOWN_FRAME,
  CAT_CLAP_FRAMES,
  CAT_FRAMES,
  CAT_PALETTE,
  CONFETTI_POPPER_PALETTE,
  CONFETTI_POPPER_ROWS,
  MascotId,
  PANDA_CLAP_FRAMES,
  PANDA_FRAMES,
  PANDA_PALETTE,
  PIXEL_MASCOT_CONFIGS,
  PixelRect,
  generatePixelConfettiStream,
  getNextMascotQuip,
  parsePixelRowsToRects,
} from '../utils/pixelMascots';

function renderRects(rects: readonly PixelRect[], prefix: string) {
  return rects.map((r, idx) => (
    <rect
      key={`${prefix}-${idx}`}
      x={r.x}
      y={r.y}
      width={r.width}
      height={r.height}
      fill={r.fill}
    />
  ));
}

function useMascotEasterEgg(mascotId: MascotId) {
  const [quipIndex, setQuipIndex] = useState(0);
  const [activeQuip, setActiveQuip] = useState<string | null>(null);
  const [hopSeq, setHopSeq] = useState(0);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const triggerEasterEgg = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const { text, nextIndex } = getNextMascotQuip(mascotId, quipIndex);
    setQuipIndex(nextIndex);
    setActiveQuip(text);
    setHopSeq((prev) => prev + 1);
    sound.playSparkle();

    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = window.setTimeout(() => {
      setActiveQuip(null);
    }, 2800);
  };

  return { activeQuip, hopSeq, triggerEasterEgg };
}

interface SpeechBubbleProps {
  text: string | null;
  align: 'left' | 'right';
  sparkKey: number;
}

const PixelSpeechBubble: React.FC<SpeechBubbleProps> = ({ text, align, sparkKey }) => {
  if (!text) return null;

  return (
    <div
      key={`${sparkKey}-${text}`}
      role="status"
      aria-live="polite"
      className={`absolute bottom-full mb-1.5 z-20 pointer-events-none animate-pixel-bubble-in ${
        align === 'left' ? 'left-0' : 'right-0'
      }`}
    >
      <div className="relative bg-white/95 border-2 border-pink-300 text-pink-900 text-[11px] leading-snug font-semibold px-2.5 py-1.5 rounded-xl shadow-md w-max max-w-[140px] sm:max-w-[164px] text-left">
        <span>{text}</span>
        <span
          aria-hidden="true"
          className={`absolute -bottom-1.5 w-2.5 h-2.5 bg-white border-r-2 border-b-2 border-pink-300 rotate-45 ${
            align === 'left' ? 'left-4' : 'right-4'
          }`}
        />
      </div>
      <span
        aria-hidden="true"
        className="absolute -top-3 right-1 text-xs animate-easter-spark-up"
      >
        💖
      </span>
    </div>
  );
};

export type PandaMode = 'idle' | 'clap' | 'cake';
export type CatMode = 'idle' | 'wind-blown' | 'walk-cake' | 'clap';

interface PixelPandaProps {
  mode: PandaMode;
  testId?: string;
}

export const PixelPanda: React.FC<PixelPandaProps> = ({
  mode,
  testId = 'pixel-panda-modal',
}) => {
  const { activeQuip, hopSeq, triggerEasterEgg } = useMascotEasterEgg('panda');

  const { idleA, idleB, clapA, clapB, cakeSlice } = useMemo(
    () => ({
      idleA: parsePixelRowsToRects(PANDA_FRAMES[0], PANDA_PALETTE),
      idleB: parsePixelRowsToRects(PANDA_FRAMES[1], PANDA_PALETTE),
      clapA: parsePixelRowsToRects(PANDA_CLAP_FRAMES[0], PANDA_PALETTE),
      clapB: parsePixelRowsToRects(PANDA_CLAP_FRAMES[1], PANDA_PALETTE),
      cakeSlice: parsePixelRowsToRects(CAKE_SLICE_ROWS, CAKE_SLICE_PALETTE),
    }),
    []
  );

  const isClapping = mode === 'clap';

  return (
    <button
      type="button"
      onClick={triggerEasterEgg}
      data-testid={testId}
      data-mode={mode}
      aria-label="Sapa Pixel Panda"
      title="Ketuk Panda untuk kejutan kecil!"
      className={`relative w-12 min-[390px]:w-14 sm:w-[70px] select-none pointer-events-auto cursor-pointer touch-manipulation bg-transparent border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded-xl ${
        isClapping ? 'animate-pixel-clap-hop' : 'animate-pixel-step-bob'
      }`}
    >
      <PixelSpeechBubble text={activeQuip} align="left" sparkKey={hopSeq} />
      <div key={`panda-hop-${hopSeq}`} className={hopSeq > 0 ? 'animate-mascot-easter-hop' : ''}>
        <svg viewBox="0 0 24 27" shapeRendering="crispEdges" className="w-full h-auto overflow-visible">
          <g transform="translate(0, 1)">
            {isClapping ? (
              <>
                <g className="animate-pixel-clap-a">{renderRects(clapA, 'pca')}</g>
                <g className="animate-pixel-clap-b">{renderRects(clapB, 'pcb')}</g>
              </>
            ) : (
              <>
                <g className="animate-pixel-frame-a">{renderRects(idleA, 'pia')}</g>
                <g className="animate-pixel-frame-b">{renderRects(idleB, 'pib')}</g>
              </>
            )}
          </g>

          {mode === 'cake' && (
            <g transform="translate(13, 12)">
              <g className="animate-pixel-cake-bob">{renderRects(cakeSlice, 'pcs')}</g>
            </g>
          )}
        </svg>
      </div>
    </button>
  );
};

interface PixelOrangeCatProps {
  mode: CatMode;
  testId?: string;
}

export const PixelOrangeCat: React.FC<PixelOrangeCatProps> = ({
  mode,
  testId = 'pixel-cat-modal',
}) => {
  const { activeQuip, hopSeq, triggerEasterEgg } = useMascotEasterEgg('orange-cat');

  const { frameA, frameB, clapA, clapB, blownFrame, cakeSlice } = useMemo(
    () => ({
      frameA: parsePixelRowsToRects(CAT_FRAMES[0], CAT_PALETTE),
      frameB: parsePixelRowsToRects(CAT_FRAMES[1], CAT_PALETTE),
      clapA: parsePixelRowsToRects(CAT_CLAP_FRAMES[0], CAT_PALETTE),
      clapB: parsePixelRowsToRects(CAT_CLAP_FRAMES[1], CAT_PALETTE),
      blownFrame: parsePixelRowsToRects(CAT_BLOWN_FRAME, CAT_PALETTE),
      cakeSlice: parsePixelRowsToRects(CAKE_SLICE_ROWS, CAKE_SLICE_PALETTE),
    }),
    []
  );

  const outerAnimClass =
    mode === 'wind-blown'
      ? 'animate-cat-wind-blown'
      : mode === 'walk-cake'
      ? 'animate-cat-walk-from-right'
      : mode === 'clap'
      ? 'animate-pixel-clap-hop'
      : 'animate-pixel-step-bob';

  return (
    <button
      type="button"
      onClick={triggerEasterEgg}
      data-testid={testId}
      data-mode={mode}
      aria-label="Sapa Pixel Kucing Orange"
      title="Ketuk Kucing Orange untuk kejutan kecil!"
      className={`relative w-12 min-[390px]:w-14 sm:w-[70px] select-none pointer-events-auto cursor-pointer touch-manipulation bg-transparent border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded-xl ${outerAnimClass}`}
    >
      <PixelSpeechBubble text={activeQuip} align="right" sparkKey={hopSeq} />
      <div key={`cat-hop-${hopSeq}`} className={hopSeq > 0 ? 'animate-mascot-easter-hop' : ''}>
        {/* Face left toward center */}
        <div style={{ transform: 'scaleX(-1)' }}>
          <svg viewBox="0 0 24 27" shapeRendering="crispEdges" className="w-full h-auto overflow-visible">
            <g transform="translate(0, 1)">
              {mode === 'wind-blown' ? (
                <g>{renderRects(blownFrame, 'cbf')}</g>
              ) : mode === 'clap' ? (
                <>
                  <g className="animate-pixel-clap-a">{renderRects(clapA, 'cca')}</g>
                  <g className="animate-pixel-clap-b">{renderRects(clapB, 'ccb')}</g>
                </>
              ) : mode === 'walk-cake' ? (
                <>
                  <g className="animate-pixel-walk-once-a">{renderRects(frameA, 'cwa')}</g>
                  <g className="animate-pixel-walk-once-b">{renderRects(frameB, 'cwb')}</g>
                </>
              ) : (
                <>
                  <g className="animate-pixel-frame-a">{renderRects(frameA, 'cia')}</g>
                  <g className="animate-pixel-frame-b">{renderRects(frameB, 'cib')}</g>
                </>
              )}
            </g>

            {mode === 'walk-cake' && (
              <g transform="translate(14, 11)">
                <g className="animate-pixel-cake-bob">{renderRects(cakeSlice, 'ccs')}</g>
              </g>
            )}
          </svg>
        </div>
      </div>
    </button>
  );
};

/**
 * Corner mascots for Page 1 (Envelope) and Page 2 (Main Greeting Card):
 * Panda at bottom-left & Orange Cat at bottom-right wearing birthday hats
 * and continuously shooting pixel confetti cannons, with clickable Easter Eggs.
 */
export const PixelMascots: React.FC = () => {
  const pandaEgg = useMascotEasterEgg('panda');
  const catEgg = useMascotEasterEgg('orange-cat');

  const { panda, orangeCat, popperRects, pandaConfetti, catConfetti } = useMemo(() => {
    const [pandaCfg, catCfg] = PIXEL_MASCOT_CONFIGS;
    return {
      panda: {
        frameA: parsePixelRowsToRects(pandaCfg.frames[0], pandaCfg.palette),
        frameB: parsePixelRowsToRects(pandaCfg.frames[1], pandaCfg.palette),
      },
      orangeCat: {
        frameA: parsePixelRowsToRects(catCfg.frames[0], catCfg.palette),
        frameB: parsePixelRowsToRects(catCfg.frames[1], catCfg.palette),
      },
      popperRects: parsePixelRowsToRects(CONFETTI_POPPER_ROWS, CONFETTI_POPPER_PALETTE),
      pandaConfetti: generatePixelConfettiStream(22, 20, 3),
      catConfetti: generatePixelConfettiStream(22, 19, 3),
    };
  }, []);

  return (
    <div
      data-testid="pixel-mascots"
      className="fixed inset-x-0 bottom-[max(0.45rem,env(safe-area-inset-bottom))] sm:bottom-4 overflow-visible pointer-events-none select-none z-[12]"
    >
      <div className="w-full flex items-end justify-between px-2.5 sm:px-8">
        {/* Bottom-Left: Party-hat Panda shooting pixel confetti (clickable Easter Egg) */}
        <button
          type="button"
          onClick={pandaEgg.triggerEasterEgg}
          data-testid="pixel-mascot-panda"
          aria-label="Sapa Pixel Panda"
          title="Ketuk Panda untuk kejutan kecil!"
          className="relative w-[78px] min-[390px]:w-[88px] sm:w-[120px] pointer-events-auto cursor-pointer touch-manipulation bg-transparent border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded-2xl animate-pixel-popper-recoil"
        >
          <PixelSpeechBubble
            text={pandaEgg.activeQuip}
            align="left"
            sparkKey={pandaEgg.hopSeq}
          />
          <div
            key={`corner-panda-hop-${pandaEgg.hopSeq}`}
            className={pandaEgg.hopSeq > 0 ? 'animate-mascot-easter-hop' : ''}
          >
            <svg viewBox="0 0 34 34" shapeRendering="crispEdges" className="w-full h-auto overflow-visible">
              {/* Continuous shooting pixel confetti */}
              <g data-testid="panda-confetti-stream">
                {pandaConfetti.map((p) => (
                  <g
                    key={`pc-${p.id}`}
                    className="animate-pixel-confetti"
                    style={
                      {
                        transformOrigin: `${p.x}px ${p.y}px`,
                        animationDuration: `${p.durationSec}s`,
                        animationDelay: `${p.delaySec}s`,
                        '--tx': `${p.tx}px`,
                        '--ty': `${p.ty}px`,
                        '--rot': `${p.rotDeg}deg`,
                      } as React.CSSProperties
                    }
                  >
                    <rect x={p.x} y={p.y} width={p.width} height={p.height} fill={p.fill} />
                  </g>
                ))}
              </g>

              {/* Panda character wearing birthday hat */}
              <g transform="translate(0, 8)">
                <g className="animate-pixel-frame-a">{renderRects(panda.frameA, 'pa')}</g>
                <g className="animate-pixel-frame-b">{renderRects(panda.frameB, 'pb2')}</g>
              </g>

              {/* Pixel Party Popper held in raised paw */}
              <g transform="translate(15, 20)">
                <g className="animate-pixel-popper-kick">{renderRects(popperRects, 'pp')}</g>
              </g>
            </svg>
          </div>
        </button>

        {/* Bottom-Right: Party-hat Orange Cat shooting pixel confetti (clickable Easter Egg) */}
        <button
          type="button"
          onClick={catEgg.triggerEasterEgg}
          data-testid="pixel-mascot-orange-cat"
          aria-label="Sapa Pixel Kucing Orange"
          title="Ketuk Kucing Orange untuk kejutan kecil!"
          className="relative w-[78px] min-[390px]:w-[88px] sm:w-[120px] pointer-events-auto cursor-pointer touch-manipulation bg-transparent border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded-2xl animate-pixel-popper-recoil"
          style={{ animationDelay: '0.28s' }}
        >
          <PixelSpeechBubble
            text={catEgg.activeQuip}
            align="right"
            sparkKey={catEgg.hopSeq}
          />
          <div
            key={`corner-cat-hop-${catEgg.hopSeq}`}
            className={catEgg.hopSeq > 0 ? 'animate-mascot-easter-hop' : ''}
          >
            <div style={{ transform: 'scaleX(-1)' }}>
              <svg viewBox="0 0 34 34" shapeRendering="crispEdges" className="w-full h-auto overflow-visible">
                {/* Continuous shooting pixel confetti */}
                <g data-testid="cat-confetti-stream">
                  {catConfetti.map((p) => (
                    <g
                      key={`cc-${p.id}`}
                      className="animate-pixel-confetti"
                      style={
                        {
                          transformOrigin: `${p.x}px ${p.y}px`,
                          animationDuration: `${p.durationSec}s`,
                          animationDelay: `${Number((p.delaySec + 0.25).toFixed(2))}s`,
                          '--tx': `${p.tx}px`,
                          '--ty': `${p.ty}px`,
                          '--rot': `${p.rotDeg}deg`,
                        } as React.CSSProperties
                      }
                    >
                      <rect x={p.x} y={p.y} width={p.width} height={p.height} fill={p.fill} />
                    </g>
                  ))}
                </g>

                {/* Orange Cat character wearing birthday hat */}
                <g transform="translate(0, 8)">
                  <g className="animate-pixel-frame-a" style={{ animationDelay: '0.25s' }}>
                    {renderRects(orangeCat.frameA, 'ca')}
                  </g>
                  <g className="animate-pixel-frame-b" style={{ animationDelay: '0.25s' }}>
                    {renderRects(orangeCat.frameB, 'cb2')}
                  </g>
                </g>

                {/* Pixel Party Popper held in raised paw */}
                <g transform="translate(15, 19)">
                  <g className="animate-pixel-popper-kick" style={{ animationDelay: '0.28s' }}>
                    {renderRects(popperRects, 'cp')}
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
