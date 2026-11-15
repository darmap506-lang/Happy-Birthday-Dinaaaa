import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRecipientName,
  validateWish,
  calculatePetalStyle,
  getSpecialMessage,
  getNextSlideIndex,
  getPrevSlideIndex,
  PETAL_COLORS,
  MAIN_GREETING_MESSAGE,
  splitGraphemes,
  getTypewriterVisibleCount,
  getTypewriterSlice,
} from './greeting';

test('formatRecipientName defaults to Dina when input is null, undefined, or empty', () => {
  assert.equal(formatRecipientName(null), 'Dina');
  assert.equal(formatRecipientName(undefined), 'Dina');
  assert.equal(formatRecipientName(''), 'Dina');
  assert.equal(formatRecipientName('   '), 'Dina');
});

test('formatRecipientName formats and capitalizes properly', () => {
  assert.equal(formatRecipientName('dina'), 'Dina');
  assert.equal(formatRecipientName('dina anggraini'), 'Dina Anggraini');
  assert.equal(formatRecipientName('  DINA   '), 'Dina');
});

test('validateWish validates author and message constraints', () => {
  // Valid wish
  const valid = validateWish('Budi', 'Selamat ulang tahun ya!');
  assert.equal(valid.valid, true);

  // Missing author
  const missingAuthor = validateWish('', 'Selamat!');
  assert.equal(missingAuthor.valid, false);
  assert.match(missingAuthor.error!, /nama/i);

  // Author too long
  const longAuthor = validateWish('A'.repeat(35), 'Selamat!');
  assert.equal(longAuthor.valid, false);

  // Missing message
  const missingMsg = validateWish('Budi', '');
  assert.equal(missingMsg.valid, false);
  assert.match(missingMsg.error!, /pesan/i);

  // Message too long
  const longMsg = validateWish('Budi', 'A'.repeat(350));
  assert.equal(longMsg.valid, false);
});

test('calculatePetalStyle produces deterministic values within bounds', () => {
  const petal1 = calculatePetalStyle(1);
  const petal1Again = calculatePetalStyle(1);
  assert.deepEqual(petal1, petal1Again);

  assert.ok(petal1.width >= 12 && petal1.width <= 22);
  assert.ok(petal1.left >= 0 && petal1.left <= 98);
  assert.ok(petal1.duration >= 6 && petal1.duration <= 11);
  assert.ok(petal1.delay >= 0 && petal1.delay <= 8);
  assert.ok(PETAL_COLORS.includes(petal1.color));
});

test('getSpecialMessage includes recipient name', () => {
  const msg = getSpecialMessage('Dina');
  assert.ok(msg.includes('Dina'));
  assert.ok(msg.includes('taman bunga'));
});

test('getNextSlideIndex and getPrevSlideIndex wrap correctly', () => {
  const total = 3;
  // Next wrapping
  assert.equal(getNextSlideIndex(0, total), 1);
  assert.equal(getNextSlideIndex(1, total), 2);
  assert.equal(getNextSlideIndex(2, total), 0);

  // Prev wrapping
  assert.equal(getPrevSlideIndex(0, total), 2);
  assert.equal(getPrevSlideIndex(2, total), 1);
  assert.equal(getPrevSlideIndex(1, total), 0);

  // Fallback on empty
  assert.equal(getNextSlideIndex(0, 0), 0);
  assert.equal(getPrevSlideIndex(0, 0), 0);
});

test('splitGraphemes keeps multi-codepoint emojis intact', () => {
  const units = splitGraphemes(MAIN_GREETING_MESSAGE);
  assert.ok(units.length > 0);
  // Last 4 units should be the 4 emojis without splitting variation selector U+FE0F
  assert.deepEqual(units.slice(-4), ['🤲', '✌', '☺️', '✌']);
  assert.equal(units.join(''), MAIN_GREETING_MESSAGE);
});

test('getTypewriterVisibleCount progresses smoothly after delay and clamps at total', () => {
  assert.equal(getTypewriterVisibleCount(0, 50, { startDelayMs: 200, msPerUnit: 20 }), 0);
  assert.equal(getTypewriterVisibleCount(200, 50, { startDelayMs: 200, msPerUnit: 20 }), 0);
  assert.equal(getTypewriterVisibleCount(205, 50, { startDelayMs: 200, msPerUnit: 20 }), 1);
  assert.equal(getTypewriterVisibleCount(240, 50, { startDelayMs: 200, msPerUnit: 20 }), 3);
  assert.equal(getTypewriterVisibleCount(5000, 50, { startDelayMs: 200, msPerUnit: 20 }), 50);
  assert.equal(getTypewriterVisibleCount(500, 0), 0);

  // Default relaxed typing cadence (~40ms/unit after 320ms delay)
  assert.equal(getTypewriterVisibleCount(300, 100), 0);
  assert.equal(getTypewriterVisibleCount(720, 100), 11);
});

test('getTypewriterSlice returns clean slices without bounds errors', () => {
  const units = splitGraphemes('Hi ☺️!');
  assert.equal(getTypewriterSlice(units, 0), '');
  assert.equal(getTypewriterSlice(units, 3), 'Hi ');
  assert.equal(getTypewriterSlice(units, 4), 'Hi ☺️');
  assert.equal(getTypewriterSlice(units, 99), 'Hi ☺️!');
});
