/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EnvelopePhase =
  | 'idle'
  | 'unsealing'
  | 'top'
  | 'bottom'
  | 'right'
  | 'left'
  | 'revealing'
  | 'exiting';

export interface EnvelopeTimeline {
  topOpenAtMs: number;
  bottomOpenAtMs: number;
  rightOpenAtMs: number;
  leftOpenAtMs: number;
  revealAtMs: number;
  exitAtMs: number;
  completeAtMs: number;
}

export const ENVELOPE_TIMELINE: EnvelopeTimeline = {
  topOpenAtMs: 240,
  bottomOpenAtMs: 620,
  rightOpenAtMs: 1000,
  leftOpenAtMs: 1380,
  revealAtMs: 1780,
  exitAtMs: 2320,
  completeAtMs: 2850,
};

export function getEnvelopeStateFlags(phase: EnvelopePhase) {
  const order: EnvelopePhase[] = [
    'idle',
    'unsealing',
    'top',
    'bottom',
    'right',
    'left',
    'revealing',
    'exiting',
  ];
  const idx = order.indexOf(phase);

  return {
    isUnsealing: idx >= 1,
    isTopOpen: idx >= 2,
    isBottomOpen: idx >= 3,
    isRightOpen: idx >= 4,
    isLeftOpen: idx >= 5,
    isRevealing: idx >= 6,
    isExiting: idx >= 7,
  };
}
