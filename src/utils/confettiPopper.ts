/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ConfettiPopperPhase = 'idle' | 'popping' | 'revealed' | 'exiting';

export const PULL_THRESHOLD_PX = 56;
export const MAX_PULL_PX = 88;

export interface PopperTimeline {
  bannerAtMs: number;
  exitAtMs: number;
  completeAtMs: number;
}

export const POPPER_TIMELINE: PopperTimeline = {
  bannerAtMs: 320,
  exitAtMs: 2800,
  completeAtMs: 3350,
};

export interface PopperStreamer {
  id: number;
  angleDeg: number;
  distancePx: number;
  color: string;
  widthPx: number;
  heightPx: number;
  delayMs: number;
  rotateDeg: number;
  shape: 'rect' | 'circle' | 'ribbon';
}

const STREAMER_COLORS = [
  '#ec4899',
  '#f43f5e',
  '#fbbf24',
  '#a855f7',
  '#38bdf8',
  '#34d399',
  '#fb7185',
];

/**
 * Clamps downward pull distance smoothly with elastic resistance past threshold.
 */
export function clampPullDistance(deltaY: number): number {
  if (!Number.isFinite(deltaY) || deltaY <= 0) return 0;
  if (deltaY <= PULL_THRESHOLD_PX) return deltaY;
  const excess = deltaY - PULL_THRESHOLD_PX;
  return Math.min(MAX_PULL_PX, PULL_THRESHOLD_PX + excess * 0.45);
}

/**
 * Returns normalized tension progress from 0 to 1 for the pull-string interaction.
 */
export function getPullProgress(pullPx: number): number {
  if (!Number.isFinite(pullPx) || pullPx <= 0) return 0;
  return Math.min(1, pullPx / PULL_THRESHOLD_PX);
}

/**
 * Determines whether the user has pulled the confetti string far enough to pop.
 */
export function shouldTriggerPop(pullPx: number): boolean {
  return Number.isFinite(pullPx) && pullPx >= PULL_THRESHOLD_PX;
}

/**
 * Returns the exact celebratory reveal copy shown after pulling the confetti string.
 */
export function getPopperOpeningText(): { line1: string; line2: string } {
  return {
    line1: 'From Darto to Dina',
    line2: 'Happy birthday Dina',
  };
}

/**
 * Generates deterministic burst streamers shooting out of the confetti popper cone.
 */
export function generatePopperStreamers(count = 24): PopperStreamer[] {
  const safeCount = Math.max(0, Math.floor(count));
  const shapes: PopperStreamer['shape'][] = ['ribbon', 'rect', 'circle'];
  const list: PopperStreamer[] = [];

  for (let i = 0; i < safeCount; i++) {
    const spread = safeCount > 1 ? i / (safeCount - 1) - 0.5 : 0;
    const angleDeg = spread * 124 + ((i % 3) - 1) * 6;
    const distancePx = 95 + ((i * 37) % 115);

    list.push({
      id: i,
      angleDeg: Number(angleDeg.toFixed(1)),
      distancePx,
      color: STREAMER_COLORS[i % STREAMER_COLORS.length],
      widthPx: i % 3 === 0 ? 7 : 9,
      heightPx: i % 3 === 0 ? 18 : i % 3 === 1 ? 10 : 9,
      delayMs: (i % 4) * 28,
      rotateDeg: (i % 2 === 0 ? 1 : -1) * (140 + ((i * 53) % 200)),
      shape: shapes[i % shapes.length],
    });
  }

  return list;
}
