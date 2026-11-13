import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RIGGED_PRIZE_INDEX,
  ROULETTE_PRIZES,
  buildWheelSliceGeometry,
  computeSpinTargetAngle,
  getPrizeIndexAtPointer,
  getRouletteHeading,
} from './roulette';

test('ROULETTE_PRIZES contains the exact 5 requested prizes with Sepatu at rigged index', () => {
  assert.equal(ROULETTE_PRIZES.length, 5);
  assert.deepEqual(
    ROULETTE_PRIZES.map((p) => p.label),
    [
      'Sepatu',
      'Iphone 18 Pro Max Burgundy',
      'Emas 2 kilo',
      'Rumah di BSD',
      'Jalan-jalan ke Swiss',
    ]
  );
  assert.deepEqual(ROULETTE_PRIZES[RIGGED_PRIZE_INDEX].shortLines, ['Sepatu']);
  assert.equal(ROULETTE_PRIZES[RIGGED_PRIZE_INDEX].label, 'Sepatu');
  assert.equal(ROULETTE_PRIZES[RIGGED_PRIZE_INDEX].imageSrc, '/assets/aistudio/Sepatu_NB_64664b7f.jpg');
});

test('getRouletteHeading switches from Semoga Beruntungggg!!! to Selamat kamu dapet on prize reveal', () => {
  assert.equal(getRouletteHeading(false), 'Semoga Beruntungggg!!!');
  assert.equal(getRouletteHeading(true), 'Selamat kamu dapet');
});

test('computeSpinTargetAngle always lands on Sepatu regardless of prior rotation or safe jitter', () => {
  const startRotations = [0, 36, 145, 720, 2194, 4812];
  const jitters = [-25, -15, -5, 0, 7, 15, 25];

  for (const start of startRotations) {
    for (const jitter of jitters) {
      const next = computeSpinTargetAngle(start, RIGGED_PRIZE_INDEX, 5, 6, jitter);
      assert.ok(next >= start + 6 * 360, 'wheel should spin at least 6 full turns forward');
      assert.equal(
        getPrizeIndexAtPointer(next, 5),
        RIGGED_PRIZE_INDEX,
        `expected pointer to land on Sepatu from start=${start}, jitter=${jitter}, got angle=${next}`
      );
    }
  }
});

test('buildWheelSliceGeometry generates valid SVG wedge path and midpoint angles', () => {
  const s0 = buildWheelSliceGeometry(0, 5, 160, 160, 142);
  assert.ok(s0.pathD.startsWith('M 160 160 L '));
  assert.ok(s0.pathD.endsWith(' Z'));
  assert.equal(s0.midAngleDeg, 36);
});
