import test from 'node:test';
import assert from 'node:assert/strict';
import { BALLOON_PALETTE, generateBalloons } from './balloons';

test('generateBalloons produces requested count with valid bounded attributes', () => {
  const balloons = generateBalloons(16, 1);
  assert.equal(balloons.length, 16);

  const validColors = new Set(BALLOON_PALETTE.map((p) => p.color));
  for (const b of balloons) {
    assert.ok(b.leftPercent >= 2 && b.leftPercent <= 95);
    assert.ok(b.width >= 42 && b.width <= 62);
    assert.ok(b.height > b.width);
    assert.ok(b.durationSec >= 5.5 && b.durationSec <= 8.2);
    assert.ok(b.delaySec >= 0 && b.delaySec <= 3.6);
    assert.ok(b.swayPx >= -22 && b.swayPx <= 22);
    assert.ok(b.tiltDeg >= -7 && b.tiltDeg <= 7);
    assert.ok(validColors.has(b.color));
  }
});

test('generateBalloons handles zero or negative count gracefully', () => {
  assert.deepEqual(generateBalloons(0), []);
  assert.deepEqual(generateBalloons(-5), []);
});

test('generateBalloons is deterministic for identical count and seedOffset', () => {
  assert.deepEqual(generateBalloons(12, 3), generateBalloons(12, 3));
});
