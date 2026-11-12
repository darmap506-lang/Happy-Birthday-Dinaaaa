/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  life: number; // 1 down to 0
  decay: number;
  shape: 'star' | 'circle' | 'diamond';
}

export const SPARKLE_PALETTE = [
  '#ffb703', // warm star gold
  '#ffd166', // soft champagne
  '#ff758f', // sweet rose pink
  '#f72585', // deep magenta pink
  '#ffffff', // sparkling diamond white
  '#ffccd5', // pastel blush
];

let particleIdCounter = 0;

/**
 * Creates a single sparkle particle at (x, y) with a slight velocity spread.
 */
export function createSparkle(
  x: number,
  y: number,
  options?: {
    burst?: boolean;
    color?: string;
  }
): SparkleParticle {
  particleIdCounter = (particleIdCounter + 1) % 100000;
  const isBurst = options?.burst ?? false;

  const speed = isBurst ? Math.random() * 3.5 + 1.5 : Math.random() * 1.5 + 0.4;
  const angle = Math.random() * Math.PI * 2;

  const shapes: Array<'star' | 'circle' | 'diamond'> = ['star', 'star', 'diamond', 'circle'];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];

  const color =
    options?.color ||
    SPARKLE_PALETTE[Math.floor(Math.random() * SPARKLE_PALETTE.length)];

  return {
    id: particleIdCounter,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - (isBurst ? 1.0 : 0.5), // slight upward drift
    size: isBurst ? Math.random() * 6 + 6 : Math.random() * 5 + 4,
    color,
    rotation: Math.random() * 360,
    vRot: (Math.random() - 0.5) * 12,
    life: 1.0,
    decay: isBurst ? Math.random() * 0.025 + 0.02 : Math.random() * 0.035 + 0.025,
    shape,
  };
}

/**
 * Updates a single sparkle particle. Returns null if expired.
 */
export function updateSparkle(
  p: SparkleParticle,
  deltaRatio: number = 1
): SparkleParticle | null {
  const newLife = p.life - p.decay * deltaRatio;
  if (newLife <= 0) return null;

  return {
    ...p,
    x: p.x + p.vx * deltaRatio,
    y: p.y + p.vy * deltaRatio,
    vy: p.vy + 0.04 * deltaRatio, // subtle gravity
    rotation: p.rotation + p.vRot * deltaRatio,
    life: newLife,
  };
}
