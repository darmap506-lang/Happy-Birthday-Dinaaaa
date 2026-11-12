import test from 'node:test';
import assert from 'node:assert/strict';
import { getNextSlideIndex, getPrevSlideIndex } from './slider';

test('getNextSlideIndex cycles through 3 slides properly', () => {
  assert.equal(getNextSlideIndex(0, 3), 1);
  assert.equal(getNextSlideIndex(1, 3), 2);
  assert.equal(getNextSlideIndex(2, 3), 0);
});

test('getPrevSlideIndex cycles backwards through 3 slides properly', () => {
  assert.equal(getPrevSlideIndex(0, 3), 2);
  assert.equal(getPrevSlideIndex(2, 3), 1);
  assert.equal(getPrevSlideIndex(1, 3), 0);
});

test('handles edge case when totalSlides is 0 or 1', () => {
  assert.equal(getNextSlideIndex(0, 0), 0);
  assert.equal(getPrevSlideIndex(0, 0), 0);
  assert.equal(getNextSlideIndex(0, 1), 0);
  assert.equal(getPrevSlideIndex(0, 1), 0);
});
