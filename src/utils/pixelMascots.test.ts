import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAKE_SLICE_PALETTE,
  CAKE_SLICE_ROWS,
  CAT_BLOWN_FRAME,
  CAT_CLAP_FRAMES,
  CAT_FRAMES,
  CONFETTI_POPPER_PALETTE,
  CONFETTI_POPPER_ROWS,
  PANDA_CLAP_FRAMES,
  PANDA_FRAMES,
  PIXEL_MASCOT_CONFIGS,
  generatePixelConfettiStream,
  parsePixelRowsToRects,
} from './pixelMascots';

test('all pixel mascot grids (18x25), popper (8x8), and cake slice (9x9) have uniform dimensions', () => {
  for (const frame of [...PANDA_FRAMES, ...PANDA_CLAP_FRAMES]) {
    assert.equal(frame.length, 25);
    for (const row of frame) {
      assert.equal(row.length, 18);
    }
  }

  for (const frame of [...CAT_FRAMES, ...CAT_CLAP_FRAMES, CAT_BLOWN_FRAME]) {
    assert.equal(frame.length, 25);
    for (const row of frame) {
      assert.equal(row.length, 18);
    }
  }

  assert.equal(CONFETTI_POPPER_ROWS.length, 8);
  for (const row of CONFETTI_POPPER_ROWS) {
    assert.equal(row.length, 8);
  }

  assert.equal(CAKE_SLICE_ROWS.length, 9);
  for (const row of CAKE_SLICE_ROWS) {
    assert.equal(row.length, 9);
  }
});

test('parsePixelRowsToRects merges adjacent horizontal pixels and skips transparent dots', () => {
  const palette = { K: '#000000', W: '#ffffff' };
  const rects = parsePixelRowsToRects(['..KKK.WW..'], palette);

  assert.deepEqual(rects, [
    { x: 2, y: 0, width: 3, height: 1, fill: '#000000' },
    { x: 6, y: 0, width: 2, height: 1, fill: '#ffffff' },
  ]);
});

test('PIXEL_MASCOT_CONFIGS, party hats, confetti popper, and confetti stream generate valid descriptors', () => {
  assert.equal(PIXEL_MASCOT_CONFIGS.length, 2);
  assert.equal(PIXEL_MASCOT_CONFIGS[0].id, 'panda');
  assert.equal(PIXEL_MASCOT_CONFIGS[1].id, 'orange-cat');

  for (const mascot of PIXEL_MASCOT_CONFIGS) {
    const frameARects = parsePixelRowsToRects(mascot.frames[0], mascot.palette);
    const frameBRects = parsePixelRowsToRects(mascot.frames[1], mascot.palette);

    assert.ok(frameARects.length > 25);
    assert.ok(frameBRects.length > 25);
    assert.notDeepEqual(frameARects, frameBRects);
  }

  const popperRects = parsePixelRowsToRects(CONFETTI_POPPER_ROWS, CONFETTI_POPPER_PALETTE);
  assert.ok(popperRects.length > 10);

  const particles = generatePixelConfettiStream(21, 18, 3);
  assert.equal(particles.length, 18);
  for (const p of particles) {
    assert.equal(p.x, 21);
    assert.equal(p.y, 18);
    assert.ok(p.ty < 0, 'confetti should shoot upward');
    assert.ok(p.tx > 0, 'confetti should shoot outward from popper');
    assert.ok(p.durationSec > 0);
  }

  const clapA = parsePixelRowsToRects(PANDA_CLAP_FRAMES[0], PIXEL_MASCOT_CONFIGS[0].palette);
  const clapB = parsePixelRowsToRects(PANDA_CLAP_FRAMES[1], PIXEL_MASCOT_CONFIGS[0].palette);
  assert.notDeepEqual(clapA, clapB);

  const blownCat = parsePixelRowsToRects(CAT_BLOWN_FRAME, PIXEL_MASCOT_CONFIGS[1].palette);
  assert.ok(blownCat.length > 25);

  const cakeSlice = parsePixelRowsToRects(CAKE_SLICE_ROWS, CAKE_SLICE_PALETTE);
  assert.ok(cakeSlice.length > 10);
});

test('getNextMascotQuip cycles through Panda and Orange Cat Easter egg quips', async () => {
  const { PANDA_EASTER_QUIPS, CAT_EASTER_QUIPS, getNextMascotQuip } = await import('./pixelMascots');
  assert.ok(PANDA_EASTER_QUIPS.length >= 4);
  assert.ok(CAT_EASTER_QUIPS.length >= 4);

  const first = getNextMascotQuip('panda', 0);
  assert.equal(first.text, PANDA_EASTER_QUIPS[0]);
  assert.equal(first.nextIndex, 1);

  const wrapped = getNextMascotQuip('orange-cat', CAT_EASTER_QUIPS.length);
  assert.equal(wrapped.text, CAT_EASTER_QUIPS[0]);
  assert.equal(wrapped.nextIndex, 1);
});

