import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRecipientName,
  validateWish,
  calculatePetalStyle,
  getSpecialMessage,
  PETAL_COLORS,
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
