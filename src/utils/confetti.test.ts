import test from 'node:test';
import assert from 'node:assert/strict';
import { createConfettiBurst, updateConfettiParticle, CONFETTI_COLORS } from './confetti';

test('createConfettiBurst generates expected count of particles with valid properties', () => {
  const particles = createConfettiBurst(200, 300, 50);
  assert.equal(particles.length, 50);

  const p = particles[0];
  assert.equal(p.x, 200);
  assert.equal(p.y, 300);
  assert.equal(p.opacity, 1.0);
  assert.ok(CONFETTI_COLORS.includes(p.color));
  assert.ok(p.width >= 6 && p.width <= 12);
});

test('updateConfettiParticle applies drag, gravity and decays opacity', () => {
  const particles = createConfettiBurst(100, 100, 1);
  const p = particles[0];
  const updated = updateConfettiParticle(p, 1);

  assert.ok(updated !== null);
  assert.ok(updated.opacity < p.opacity);
  assert.notEqual(updated.x, p.x);
  assert.notEqual(updated.y, p.y);
});

test('updateConfettiParticle returns null when opacity drops to zero', () => {
  const particles = createConfettiBurst(100, 100, 1);
  const p = particles[0];
  p.opacity = 0.001;

  const expired = updateConfettiParticle(p, 1);
  assert.equal(expired, null);
});
