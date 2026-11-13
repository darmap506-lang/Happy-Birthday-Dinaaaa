import test from 'node:test';
import assert from 'node:assert/strict';
import { getCharacterSceneState } from './pixelCharacters';

test('Page 1 (envelope) positions panda bottom-left and cat bottom-right', () => {
  const state = getCharacterSceneState({
    stage: 'envelope',
    isSurpriseOpen: false,
    isBlowing: false,
    candlesBlown: false,
  });
  assert.equal(state.showCornerCharacters, true);
  assert.equal(state.showCakeCharacters, false);
  assert.equal(state.pandaPlacement, 'bottom-left');
  assert.equal(state.catPlacement, 'bottom-right');
  assert.equal(state.catMode, 'idle');
});

test('Page 2 (main card) keeps panda bottom-left and cat bottom-right', () => {
  const state = getCharacterSceneState({
    stage: 'card',
    isSurpriseOpen: false,
    isBlowing: false,
    candlesBlown: false,
  });
  assert.equal(state.showCornerCharacters, true);
  assert.equal(state.showCakeCharacters, false);
  assert.equal(state.pandaPlacement, 'bottom-left');
  assert.equal(state.catPlacement, 'bottom-right');
  assert.equal(state.catMode, 'idle');
});

test('Page 3 (candle blow) positions panda left of cake and cat right of cake', () => {
  const state = getCharacterSceneState({
    stage: 'card',
    isSurpriseOpen: true,
    isBlowing: false,
    candlesBlown: false,
  });
  assert.equal(state.showCornerCharacters, false);
  assert.equal(state.showCakeCharacters, true);
  assert.equal(state.pandaPlacement, 'cake-left');
  assert.equal(state.catPlacement, 'cake-right');
  assert.equal(state.catMode, 'idle');
});

test('Page 3 wind blow triggers wind-fly mode on the orange cat', () => {
  const state = getCharacterSceneState({
    stage: 'card',
    isSurpriseOpen: true,
    isBlowing: true,
    candlesBlown: false,
  });
  assert.equal(state.showCakeCharacters, true);
  assert.equal(state.catMode, 'wind-fly');
});

test('Page 4 (photo slide) keeps panda left of cake and triggers cat walk-in from right', () => {
  const state = getCharacterSceneState({
    stage: 'card',
    isSurpriseOpen: true,
    isBlowing: false,
    candlesBlown: true,
  });
  assert.equal(state.showCornerCharacters, false);
  assert.equal(state.showCakeCharacters, true);
  assert.equal(state.pandaPlacement, 'cake-left');
  assert.equal(state.catPlacement, 'cake-right');
  assert.equal(state.catMode, 'walk-in');
});
