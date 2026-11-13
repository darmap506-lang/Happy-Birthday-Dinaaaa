/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BalloonConfig {
  id: number;
  leftPercent: number;
  width: number;
  height: number;
  durationSec: number;
  delaySec: number;
  swayPx: number;
  tiltDeg: number;
  color: string;
  highlightColor: string;
  zLayer: 'front' | 'back';
}

export const BALLOON_PALETTE: ReadonlyArray<{ color: string; highlight: string }> = [
  { color: '#ec4899', highlight: '#fbcfe8' }, // Hot Pink
  { color: '#f43f5e', highlight: '#fecdd3' }, // Rose Coral
  { color: '#a855f7', highlight: '#e9d5ff' }, // Soft Purple
  { color: '#fbbf24', highlight: '#fef3c7' }, // Warm Gold
  { color: '#38bdf8', highlight: '#e0f2fe' }, // Sky Blue
  { color: '#34d399', highlight: '#d1fae5' }, // Mint
  { color: '#fb7185', highlight: '#ffe4e6' }, // Blossom Pink
];

/**
 * Generates deterministic rising balloon configurations for the surprise celebration.
 */
export function generateBalloons(count = 16, seedOffset = 0): BalloonConfig[] {
  if (count <= 0) return [];

  const pseudoRand = (seed: number, offset: number) => {
    const x = Math.sin((seed + seedOffset * 31) * 733 + offset * 1597) * 10000;
    return x - Math.floor(x);
  };

  const balloons: BalloonConfig[] = [];
  for (let i = 0; i < count; i++) {
    // Distribute evenly across horizontal lanes with slight jitter so balloons frame the screen nicely
    const laneWidth = 92 / count;
    const baseLeft = 4 + i * laneWidth;
    const jitter = (pseudoRand(i + 1, 1) - 0.5) * Math.min(laneWidth * 0.9, 6);
    const leftPercent = Number(Math.max(2, Math.min(95, baseLeft + jitter)).toFixed(2));

    const width = Math.round(42 + pseudoRand(i + 1, 2) * 20); // 42px - 62px
    const height = Math.round(width * 1.24);
    const durationSec = Number((5.5 + pseudoRand(i + 1, 3) * 2.7).toFixed(2)); // 5.5s - 8.2s
    // Ensure immediate first wave (even indices start within 0 - 1.0s) and staggered second wave (1.2s - 3.6s)
    const delaySec =
      i % 2 === 0
        ? Number((pseudoRand(i + 1, 4) * 1.0).toFixed(2))
        : Number((1.2 + pseudoRand(i + 1, 4) * 2.4).toFixed(2));
    const swayPx = Math.round((pseudoRand(i + 1, 5) - 0.5) * 44); // -22px to +22px
    const tiltDeg = Math.round((pseudoRand(i + 1, 6) - 0.5) * 14); // -7deg to +7deg
    const paletteItem = BALLOON_PALETTE[i % BALLOON_PALETTE.length];
    const zLayer = i % 3 === 0 ? 'front' : 'back';

    balloons.push({
      id: i,
      leftPercent,
      width,
      height,
      durationSec,
      delaySec,
      swayPx,
      tiltDeg,
      color: paletteItem.color,
      highlightColor: paletteItem.highlight,
      zLayer,
    });
  }

  return balloons;
}
