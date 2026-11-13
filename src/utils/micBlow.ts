/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BlowAnalysisResult {
  level: number;
  isBlowing: boolean;
}

export interface SustainedBlowState {
  count: number;
  triggered: boolean;
}

export const DEFAULT_BLOW_THRESHOLD = 0.36;
export const DEFAULT_REQUIRED_BLOW_FRAMES = 4;

/**
 * Analyzes Web Audio FFT frequency bins to estimate breath/wind intensity.
 * Breath into a microphone concentrates energy in low-to-mid frequencies (bins 1..28).
 */
export function analyzeBlowSignal(
  frequencyBins: ArrayLike<number>,
  threshold = DEFAULT_BLOW_THRESHOLD
): BlowAnalysisResult {
  const len = frequencyBins?.length ?? 0;
  if (len === 0) {
    return { level: 0, isBlowing: false };
  }

  const startIdx = len > 2 ? 1 : 0;
  const endIdx = Math.min(len, 28);
  let sum = 0;
  let peak = 0;
  let count = 0;

  for (let i = startIdx; i < endIdx; i++) {
    const raw = Number(frequencyBins[i]) || 0;
    const clamped = Math.max(0, Math.min(255, raw));
    sum += clamped;
    if (clamped > peak) peak = clamped;
    count++;
  }

  if (count === 0) {
    return { level: 0, isBlowing: false };
  }

  const avgNorm = sum / (count * 255);
  const peakNorm = peak / 255;
  const rawLevel = 0.65 * avgNorm + 0.35 * peakNorm;
  const level = Math.max(0, Math.min(1, Number(rawLevel.toFixed(3))));

  return {
    level,
    isBlowing: level >= threshold,
  };
}

/**
 * Tracks consecutive frames above threshold so brief accidental taps do not trigger.
 */
export function updateSustainedBlowCount(
  currentCount: number,
  isAboveThreshold: boolean,
  requiredFrames = DEFAULT_REQUIRED_BLOW_FRAMES
): SustainedBlowState {
  const nextCount = isAboveThreshold
    ? currentCount + 1
    : Math.max(0, currentCount - 1);

  return {
    count: nextCount,
    triggered: nextCount >= requiredFrames,
  };
}

/**
 * Checks whether browser getUserMedia microphone capture is supported.
 */
export function isMicrophoneSupported(nav?: Partial<Navigator> | null): boolean {
  const target = nav ?? (typeof navigator !== 'undefined' ? navigator : null);
  return Boolean(target?.mediaDevices && typeof target.mediaDevices.getUserMedia === 'function');
}
