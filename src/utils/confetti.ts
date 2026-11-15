/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  vRot: number;
  wobble: number;
  vWobble: number;
  opacity: number;
  shape: 'rect' | 'circle' | 'star';
}

export const CONFETTI_COLORS = [
  '#e6be7e', // champagne gold
  '#f3d89b', // pale gold foil
  '#d4a373', // rose bronze
  '#be185d', // velvet rose
  '#ec4899', // satin pink
  '#f9a8d4', // dusty blush
  '#ffccd5', // petal pink
  '#fff1f2', // ivory pearl
];

let confettiCounter = 0;

/**
 * Creates an array of confetti particles bursting from an origin point.
 */
export function createConfettiBurst(
  originX: number,
  originY: number,
  count: number = 90
): ConfettiParticle[] {
  const particles: ConfettiParticle[] = [];

  for (let i = 0; i < count; i++) {
    confettiCounter = (confettiCounter + 1) % 100000;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 3.5; // gentle spread
    const shapes: Array<'rect' | 'circle' | 'star'> = ['rect', 'rect', 'circle', 'star'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];

    particles.push({
      id: confettiCounter,
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 1.6,
      vy: Math.sin(angle) * speed - (Math.random() * 4.5 + 3.5),
      width: Math.random() * 5 + 6, // 6 to 11 (within 6..12)
      height: Math.random() * 3.5 + 3.5,
      color,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      wobble: Math.random() * Math.PI * 2,
      vWobble: Math.random() * 0.1 + 0.04,
      opacity: 1.0,
      shape,
    });
  }

  return particles;
}

/**
 * Updates a single confetti particle. Returns null if expired.
 */
export function updateConfettiParticle(
  p: ConfettiParticle,
  deltaRatio: number = 1
): ConfettiParticle | null {
  const newOpacity = p.opacity - 0.0055 * deltaRatio;
  if (newOpacity <= 0) return null;

  return {
    ...p,
    x: p.x + p.vx * deltaRatio,
    y: p.y + p.vy * deltaRatio,
    vx: p.vx * Math.pow(0.975, deltaRatio), // silky air drag
    vy: p.vy * Math.pow(0.975, deltaRatio) + 0.16 * deltaRatio, // gentler gravity float
    rotation: p.rotation + p.vRot * deltaRatio,
    wobble: p.wobble + p.vWobble * deltaRatio,
    opacity: newOpacity,
  };
}
