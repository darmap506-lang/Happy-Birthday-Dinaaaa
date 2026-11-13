import test from 'node:test';
import assert from 'node:assert/strict';
import { ENVELOPE_TIMELINE, getEnvelopeStateFlags, type EnvelopePhase } from './envelopeAnimation';

test('ENVELOPE_TIMELINE stages progress strictly in order: top -> bottom -> right -> left -> reveal -> exit', () => {
  assert.ok(ENVELOPE_TIMELINE.topOpenAtMs > 0);
  assert.ok(ENVELOPE_TIMELINE.bottomOpenAtMs > ENVELOPE_TIMELINE.topOpenAtMs);
  assert.ok(ENVELOPE_TIMELINE.rightOpenAtMs > ENVELOPE_TIMELINE.bottomOpenAtMs);
  assert.ok(ENVELOPE_TIMELINE.leftOpenAtMs > ENVELOPE_TIMELINE.rightOpenAtMs);
  assert.ok(ENVELOPE_TIMELINE.revealAtMs > ENVELOPE_TIMELINE.leftOpenAtMs);
  assert.ok(ENVELOPE_TIMELINE.exitAtMs > ENVELOPE_TIMELINE.revealAtMs);
  assert.ok(ENVELOPE_TIMELINE.completeAtMs > ENVELOPE_TIMELINE.exitAtMs);
});

test('getEnvelopeStateFlags activates each side cumulatively in top -> bottom -> right -> left order', () => {
  const sequence: EnvelopePhase[] = [
    'idle',
    'unsealing',
    'top',
    'bottom',
    'right',
    'left',
    'revealing',
    'exiting',
  ];

  assert.deepEqual(getEnvelopeStateFlags(sequence[0]), {
    isUnsealing: false,
    isTopOpen: false,
    isBottomOpen: false,
    isRightOpen: false,
    isLeftOpen: false,
    isRevealing: false,
    isExiting: false,
  });

  assert.deepEqual(getEnvelopeStateFlags('top'), {
    isUnsealing: true,
    isTopOpen: true,
    isBottomOpen: false,
    isRightOpen: false,
    isLeftOpen: false,
    isRevealing: false,
    isExiting: false,
  });

  assert.deepEqual(getEnvelopeStateFlags('bottom'), {
    isUnsealing: true,
    isTopOpen: true,
    isBottomOpen: true,
    isRightOpen: false,
    isLeftOpen: false,
    isRevealing: false,
    isExiting: false,
  });

  assert.deepEqual(getEnvelopeStateFlags('right'), {
    isUnsealing: true,
    isTopOpen: true,
    isBottomOpen: true,
    isRightOpen: true,
    isLeftOpen: false,
    isRevealing: false,
    isExiting: false,
  });

  assert.deepEqual(getEnvelopeStateFlags('left'), {
    isUnsealing: true,
    isTopOpen: true,
    isBottomOpen: true,
    isRightOpen: true,
    isLeftOpen: true,
    isRevealing: false,
    isExiting: false,
  });

  assert.deepEqual(getEnvelopeStateFlags('revealing'), {
    isUnsealing: true,
    isTopOpen: true,
    isBottomOpen: true,
    isRightOpen: true,
    isLeftOpen: true,
    isRevealing: true,
    isExiting: false,
  });

  assert.deepEqual(getEnvelopeStateFlags('exiting'), {
    isUnsealing: true,
    isTopOpen: true,
    isBottomOpen: true,
    isRightOpen: true,
    isLeftOpen: true,
    isRevealing: true,
    isExiting: true,
  });
});
