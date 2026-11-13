import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BIRTHDAY_WISH_STORAGE_KEY,
  MAX_BIRTHDAY_WISH_LENGTH,
  StorageLike,
  clearSavedWish,
  loadSavedWish,
  saveBirthdayWish,
  validateBirthdayWish,
} from './birthdayWish';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

test('validateBirthdayWish rejects blank and overly long wishes', () => {
  const blank = validateBirthdayWish('   ');
  assert.equal(blank.valid, false);
  assert.ok(blank.error);

  const tooLong = validateBirthdayWish('a'.repeat(MAX_BIRTHDAY_WISH_LENGTH + 1));
  assert.equal(tooLong.valid, false);
  assert.ok(tooLong.error);
});

test('validateBirthdayWish trims valid wishes', () => {
  const ok = validateBirthdayWish('  Semoga sehat terus dan bahagia!  ');
  assert.equal(ok.valid, true);
  assert.equal(ok.trimmed, 'Semoga sehat terus dan bahagia!');
});

test('saveBirthdayWish, loadSavedWish, and clearSavedWish round-trip cleanly', () => {
  const storage = createMemoryStorage();
  assert.equal(loadSavedWish(storage), null);

  const saved = saveBirthdayWish('  Bismillah sukses selalu 🌸 ', storage, 1700000000000);
  assert.deepEqual(saved, {
    text: 'Bismillah sukses selalu 🌸',
    savedAt: 1700000000000,
  });

  const loaded = loadSavedWish(storage);
  assert.deepEqual(loaded, saved);

  storage.setItem(BIRTHDAY_WISH_STORAGE_KEY, '{invalid-json');
  assert.equal(loadSavedWish(storage), null);

  clearSavedWish(storage);
  assert.equal(loadSavedWish(storage), null);
});
