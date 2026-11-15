import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_PULL_PX,
  POPPER_TIMELINE,
  PULL_THRESHOLD_PX,
  clampPullDistance,
  generatePopperStreamers,
  getPopperOpeningText,
  getPullProgress,
  shouldTriggerPop,
} from './confettiPopper';

test('clampPullDistance ignores negative drags and applies elastic limit up to MAX_PULL_PX', () => {
  assert.equal(clampPullDistance(-25), 0);
  assert.equal(clampPullDistance(0), 0);
  assert.equal(clampPullDistance(30), 30);
  assert.equal(clampPullDistance(PULL_THRESHOLD_PX), PULL_THRESHOLD_PX);

  const overPulled = clampPullDistance(150);
  assert.ok(overPulled > PULL_THRESHOLD_PX);
  assert.ok(overPulled <= MAX_PULL_PX);
  assert.equal(clampPullDistance(1000), MAX_PULL_PX);
});

test('getPullProgress and shouldTriggerPop enforce pull threshold accurately', () => {
  assert.equal(getPullProgress(0), 0);
  assert.equal(getPullProgress(PULL_THRESHOLD_PX / 2), 0.5);
  assert.equal(getPullProgress(PULL_THRESHOLD_PX), 1);
  assert.equal(getPullProgress(MAX_PULL_PX), 1);

  assert.equal(shouldTriggerPop(0), false);
  assert.equal(shouldTriggerPop(PULL_THRESHOLD_PX - 1), false);
  assert.equal(shouldTriggerPop(PULL_THRESHOLD_PX), true);
  assert.equal(shouldTriggerPop(MAX_PULL_PX), true);
});

test('POPPER_TIMELINE progresses strictly in order: banner -> exit -> complete', () => {
  assert.ok(POPPER_TIMELINE.bannerAtMs > 0);
  assert.ok(POPPER_TIMELINE.exitAtMs > POPPER_TIMELINE.bannerAtMs);
  assert.ok(POPPER_TIMELINE.completeAtMs > POPPER_TIMELINE.exitAtMs);
});

test('getPopperOpeningText returns exact requested greeting lines', () => {
  assert.deepEqual(getPopperOpeningText(), {
    line1: 'From Darto to Dina',
    line2: 'Happy birthday Dina',
  });
});

test('generatePopperStreamers creates valid burst particles', () => {
  const streamers = generatePopperStreamers(20);
  assert.equal(streamers.length, 20);

  for (const s of streamers) {
    assert.ok(Math.abs(s.angleDeg) <= 80);
    assert.ok(s.distancePx >= 95);
    assert.ok(s.color.startsWith('#'));
    assert.ok(['ribbon', 'rect', 'circle'].includes(s.shape));
  }
});
