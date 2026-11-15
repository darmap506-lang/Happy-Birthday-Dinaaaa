/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BloomPalette {
  outerPetal: string;
  innerPetal: string;
  centerGlow: string;
  stamen: string;
}

export interface FlowerBloom {
  id: number;
  x: number;
  y: number;
  sizePx: number;
  rotationDeg: number;
  palette: BloomPalette;
  createdAt: number;
}

export interface BalloonPopFragment {
  id: number;
  angleDeg: number;
  distancePx: number;
  sizePx: number;
  color: string;
  shape: 'circle' | 'shard';
}

export const MAX_ACTIVE_BLOOMS = 14;
export const BLOOM_LIFETIME_MS = 2600;
export const BALLOON_POP_DURATION_MS = 600;
export const BALLOON_RESPAWN_DELAY_MS = 1400;

export const BLOOM_PALETTES: readonly BloomPalette[] = [
  {
    outerPetal: '#f9a8d4',
    innerPetal: '#fdf2f8',
    centerGlow: '#fde68a',
    stamen: '#d4a373',
  },
  {
    outerPetal: '#f472b6',
    innerPetal: '#fce7f3',
    centerGlow: '#fef3c7',
    stamen: '#c9935b',
  },
  {
    outerPetal: '#fda4af',
    innerPetal: '#fff1f2',
    centerGlow: '#fde68a',
    stamen: '#be185d',
  },
  {
    outerPetal: '#fbcfe8',
    innerPetal: '#fffdf9',
    centerGlow: '#f9ebc7',
    stamen: '#d4a373',
  },
];

function seededFraction(seed: number, salt: number): number {
  const x = Math.sin(seed * 911 + salt * 1973) * 10000;
  return x - Math.floor(x);
}

export function createFlowerBloom(
  x: number,
  y: number,
  id: number,
  seed = id,
  now = Date.now()
): FlowerBloom {
  const sizePx = Math.round(58 + seededFraction(seed, 1) * 26); // 58px - 84px
  const rotationDeg = Math.round(seededFraction(seed, 2) * 72 - 36);
  const palette = BLOOM_PALETTES[Math.abs(seed) % BLOOM_PALETTES.length];

  return {
    id,
    x,
    y,
    sizePx,
    rotationDeg,
    palette,
    createdAt: now,
  };
}

export function trimActiveBlooms(
  blooms: readonly FlowerBloom[],
  maxCount = MAX_ACTIVE_BLOOMS
): FlowerBloom[] {
  if (maxCount <= 0) return [];
  if (blooms.length <= maxCount) return [...blooms];
  return blooms.slice(blooms.length - maxCount);
}

export interface BloomTargetCheck {
  isInteractiveElement: boolean;
  isInsideIgnoreRegion: boolean;
}

/**
 * Prevents spawning background flowers when the user clicks buttons, inputs,
 * cards, modals, or interactive balloons.
 */
export function shouldSpawnBackgroundBloom(check: BloomTargetCheck): boolean {
  return !check.isInteractiveElement && !check.isInsideIgnoreRegion;
}

export function createBalloonPopFragments(
  color: string,
  highlightColor: string,
  seed = 1
): BalloonPopFragment[] {
  const count = 8;
  const fragments: BalloonPopFragment[] = [];

  for (let i = 0; i < count; i++) {
    const baseAngle = (360 / count) * i;
    const jitter = (seededFraction(seed + i, 3) - 0.5) * 22;
    const angleDeg = Math.round(baseAngle + jitter);
    const distancePx = Math.round(34 + seededFraction(seed + i, 4) * 32);
    const sizePx = Math.round(6 + seededFraction(seed + i, 5) * 5);
    const fragmentColor =
      i % 3 === 0 ? '#f9ebc7' : i % 2 === 0 ? highlightColor : color;

    fragments.push({
      id: i,
      angleDeg,
      distancePx,
      sizePx,
      color: fragmentColor,
      shape: i % 2 === 0 ? 'shard' : 'circle',
    });
  }

  return fragments;
}
