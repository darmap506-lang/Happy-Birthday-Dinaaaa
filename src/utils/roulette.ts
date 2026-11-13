/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RoulettePrize {
  id: string;
  label: string;
  shortLines: readonly string[];
  emoji: string;
  fill: string;
  textColor: string;
  imageSrc?: string;
}

export const ROULETTE_PRIZES: readonly RoulettePrize[] = [
  {
    id: 'sepatu',
    label: 'Sepatu',
    shortLines: ['Sepatu'],
    emoji: '👟',
    fill: '#fbcfe8',
    textColor: '#831843',
    imageSrc: '/assets/aistudio/Sepatu_NB_64664b7f.jpg',
  },
  {
    id: 'iphone',
    label: 'Iphone 18 Pro Max Burgundy',
    shortLines: ['Iphone 18', 'Pro Max', 'Burgundy'],
    emoji: '📱',
    fill: '#fde68a',
    textColor: '#78350f',
  },
  {
    id: 'emas',
    label: 'Emas 2 kilo',
    shortLines: ['Emas', '2 kilo'],
    emoji: '🪙',
    fill: '#fed7aa',
    textColor: '#7c2d12',
  },
  {
    id: 'rumah',
    label: 'Rumah di BSD',
    shortLines: ['Rumah', 'di BSD'],
    emoji: '🏡',
    fill: '#bae6fd',
    textColor: '#0c4a6e',
  },
  {
    id: 'swiss',
    label: 'Jalan-jalan ke Swiss',
    shortLines: ['Jalan-jalan', 'ke Swiss'],
    emoji: '✈️',
    fill: '#ddd6fe',
    textColor: '#4c1d95',
  },
];

export const RIGGED_PRIZE_INDEX = 0; // Always lands on 'Sepatu NB'

export function getRouletteHeading(showPrizeStage: boolean): string {
  return showPrizeStage ? 'Selamat kamu dapet' : 'Semoga Beruntungggg!!!';
}

/**
 * Computes the next cumulative clockwise rotation angle (in degrees) so the wheel
 * spins `extraSpins` full turns and lands reliably inside `targetIndex`.
 * Slice `i` spans `[i * sliceDeg, (i + 1) * sliceDeg)` clockwise from 12 o'clock (0 deg).
 */
export function computeSpinTargetAngle(
  currentRotationDeg: number,
  targetIndex = RIGGED_PRIZE_INDEX,
  totalSlices = ROULETTE_PRIZES.length,
  extraSpins = 6,
  jitterDeg = 0
): number {
  const sliceDeg = 360 / totalSlices;
  const maxSafeJitter = sliceDeg * 0.25; // ±18 deg inside a 72 deg wedge
  const clampedJitter = Math.max(-maxSafeJitter, Math.min(maxSafeJitter, jitterDeg));

  const centerDeg = targetIndex * sliceDeg + sliceDeg / 2;
  const targetPointDeg = centerDeg + clampedJitter;
  const desiredMod = (((360 - (targetPointDeg % 360)) % 360) + 360) % 360;
  const currentMod = ((currentRotationDeg % 360) + 360) % 360;
  const deltaMod = ((desiredMod - currentMod) + 360) % 360;

  return currentRotationDeg + extraSpins * 360 + deltaMod;
}

/**
 * Inverse calculation: returns which slice index sits under the top 12-o'clock pointer
 * for a given clockwise wheel rotation.
 */
export function getPrizeIndexAtPointer(
  rotationDeg: number,
  totalSlices = ROULETTE_PRIZES.length
): number {
  const sliceDeg = 360 / totalSlices;
  const originalAngleAtPointer = (((0 - rotationDeg) % 360) + 360) % 360;
  return Math.floor(originalAngleAtPointer / sliceDeg) % totalSlices;
}

export interface SliceGeometry {
  pathD: string;
  labelX: number;
  labelY: number;
  midAngleDeg: number;
}

/**
 * Builds SVG wedge path and label anchor coordinates where 0 deg is 12 o'clock (straight UP).
 */
export function buildWheelSliceGeometry(
  index: number,
  totalSlices = ROULETTE_PRIZES.length,
  cx = 160,
  cy = 160,
  radius = 142
): SliceGeometry {
  const sliceDeg = 360 / totalSlices;
  const startClockDeg = index * sliceDeg;
  const endClockDeg = (index + 1) * sliceDeg;
  const midClockDeg = startClockDeg + sliceDeg / 2;

  const toRad = (clockDeg: number) => ((clockDeg - 90) * Math.PI) / 180;
  const x1 = cx + radius * Math.cos(toRad(startClockDeg));
  const y1 = cy + radius * Math.sin(toRad(startClockDeg));
  const x2 = cx + radius * Math.cos(toRad(endClockDeg));
  const y2 = cy + radius * Math.sin(toRad(endClockDeg));

  const largeArcFlag = sliceDeg > 180 ? 1 : 0;
  const pathD = [
    `M ${cx} ${cy}`,
    `L ${x1.toFixed(3)} ${y1.toFixed(3)}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`,
    'Z',
  ].join(' ');

  const labelRadius = radius * 0.62;
  const labelX = cx + labelRadius * Math.cos(toRad(midClockDeg));
  const labelY = cy + labelRadius * Math.sin(toRad(midClockDeg));

  return {
    pathD,
    labelX: Number(labelX.toFixed(2)),
    labelY: Number(labelY.toFixed(2)),
    midAngleDeg: midClockDeg,
  };
}
