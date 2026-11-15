import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BLOOM_PALETTES,
  MAX_ACTIVE_BLOOMS,
  createBalloonPopFragments,
  createFlowerBloom,
  shouldSpawnBackgroundBloom,
  trimActiveBlooms,
} from './interactiveEffects';

test('createFlowerBloom generates valid coordinates, size bounds, and curated palette', () => {
  const bloom = createFlowerBloom(240, 380, 1, 7, 1000);
  assert.equal(bloom.id, 1);
  assert.equal(bloom.x, 240);
  assert.equal(bloom.y, 380);
  assert.ok(bloom.sizePx >= 58 && bloom.sizePx <= 84);
  assert.ok(bloom.rotationDeg >= -36 && bloom.rotationDeg <= 36);
  assert.ok(BLOOM_PALETTES.includes(bloom.palette));
});

test('trimActiveBlooms preserves newest blooms up to maxCount', () => {
  const many = Array.from({ length: MAX_ACTIVE_BLOOMS + 4 }, (_, i) =>
    createFlowerBloom(10 + i, 20 + i, i + 1, i + 1)
  );
  const trimmed = trimActiveBlooms(many, MAX_ACTIVE_BLOOMS);
  assert.equal(trimmed.length, MAX_ACTIVE_BLOOMS);
  assert.equal(trimmed[0].id, 5);
  assert.equal(trimmed[trimmed.length - 1].id, MAX_ACTIVE_BLOOMS + 4);
});

test('shouldSpawnBackgroundBloom blocks interactive controls, cards, and balloons while allowing backdrop clicks', () => {
  assert.equal(
    shouldSpawnBackgroundBloom({ isInteractiveElement: false, isInsideIgnoreRegion: false }),
    true
  );
  assert.equal(
    shouldSpawnBackgroundBloom({ isInteractiveElement: true, isInsideIgnoreRegion: false }),
    false
  );
  assert.equal(
    shouldSpawnBackgroundBloom({ isInteractiveElement: false, isInsideIgnoreRegion: true }),
    false
  );
});

test('createBalloonPopFragments creates 8 radial burst particles using balloon colors and champagne gold', () => {
  const fragments = createBalloonPopFragments('#ec4899', '#fbcfe8', 3);
  assert.equal(fragments.length, 8);
  for (const frag of fragments) {
    assert.ok(frag.distancePx >= 34 && frag.distancePx <= 66);
    assert.ok(frag.sizePx >= 6 && frag.sizePx <= 11);
    assert.ok(['#ec4899', '#fbcfe8', '#f9ebc7'].includes(frag.color));
  }
});
