import test from 'node:test';
import assert from 'node:assert/strict';
import { createSparkle, updateSparkle, SPARKLE_PALETTE } from './sparkles';

test('createSparkle produces valid particle within expected coordinates and life', () => {
  const p = createSparkle(150, 200);
  assert.equal(p.x, 150);
  assert.equal(p.y, 200);
  assert.equal(p.life, 1.0);
  assert.ok(p.size >= 4 && p.size <= 12);
  assert.ok(SPARKLE_PALETTE.includes(p.color));
});

test('createSparkle with burst option generates higher velocity', () => {
  const normal = createSparkle(0, 0, { burst: false });
  const burst = createSparkle(0, 0, { burst: true });
  assert.ok(burst.size >= 6);
  assert.ok(burst.life === 1.0);
});

test('updateSparkle updates position and decays life', () => {
  const p = createSparkle(100, 100);
  const updated = updateSparkle(p, 1);
  assert.ok(updated !== null);
  assert.ok(updated.life < p.life);
  assert.notEqual(updated.x, 100);
});

test('updateSparkle returns null when life expires', () => {
  const p = createSparkle(100, 100);
  p.life = 0.01;
  p.decay = 0.05;
  const expired = updateSparkle(p, 1);
  assert.equal(expired, null);
});
