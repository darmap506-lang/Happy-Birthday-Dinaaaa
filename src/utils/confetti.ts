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
  '#f72585', // bright magenta
  '#7209b7', // purple
  '#3a0ca3', // deep blue
  '#4cc9f0', // sky blue
  '#ffb703', // golden yellow
  '#fb8500', // orange
  '#ff758f', // sweet pink
  '#ffccd5', // blush
  '#52b788', // emerald mint
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
    const speed = Math.random() * 9 + 4; // 4 to 13
    const shapes: Array<'rect' | 'circle' | 'star'> = ['rect', 'rect', 'circle', 'star'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];

    particles.push({
      id: confettiCounter,
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
      vy: Math.sin(angle) * speed - (Math.random() * 5 + 4), // biased upwards
      width: Math.random() * 6 + 6, // 6 to 12
      height: Math.random() * 4 + 4,
      color,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 15,
      wobble: Math.random() * Math.PI * 2,
      vWobble: Math.random() * 0.15 + 0.05,
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
  const newOpacity = p.opacity - 0.007 * deltaRatio;
  if (newOpacity <= 0) return null;

  return {
    ...p,
    x: p.x + p.vx * deltaRatio,
    y: p.y + p.vy * deltaRatio,
    vx: p.vx * Math.pow(0.98, deltaRatio), // air drag
    vy: p.vy * Math.pow(0.98, deltaRatio) + 0.22 * deltaRatio, // gravity
    rotation: p.rotation + p.vRot * deltaRatio,
    wobble: p.wobble + p.vWobble * deltaRatio,
    opacity: newOpacity,
  };
}
