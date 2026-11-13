import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_BLOW_THRESHOLD,
  analyzeBlowSignal,
  isMicrophoneSupported,
  updateSustainedBlowCount,
} from './micBlow';

test('analyzeBlowSignal returns 0 for empty or silent bins', () => {
  assert.deepEqual(analyzeBlowSignal([]), { level: 0, isBlowing: false });
  assert.deepEqual(analyzeBlowSignal(new Uint8Array(32)), { level: 0, isBlowing: false });
});

test('analyzeBlowSignal detects strong low-to-mid frequency breath energy', () => {
  const bins = new Uint8Array(64);
  for (let i = 1; i < 20; i++) {
    bins[i] = 180;
  }
  const result = analyzeBlowSignal(bins);
  assert.ok(result.level >= DEFAULT_BLOW_THRESHOLD);
  assert.equal(result.isBlowing, true);
});

test('analyzeBlowSignal clamps level between 0 and 1 and ignores noise below threshold', () => {
  const quiet = new Uint8Array(32).fill(20);
  const quietRes = analyzeBlowSignal(quiet);
  assert.ok(quietRes.level > 0 && quietRes.level < DEFAULT_BLOW_THRESHOLD);
  assert.equal(quietRes.isBlowing, false);

  const maxed = [999, 999, 999, 999];
  const maxedRes = analyzeBlowSignal(maxed);
  assert.equal(maxedRes.level, 1);
  assert.equal(maxedRes.isBlowing, true);
});

test('updateSustainedBlowCount requires consecutive frames before triggering', () => {
  let state = updateSustainedBlowCount(0, true, 3);
  assert.deepEqual(state, { count: 1, triggered: false });

  state = updateSustainedBlowCount(state.count, true, 3);
  assert.deepEqual(state, { count: 2, triggered: false });

  state = updateSustainedBlowCount(state.count, false, 3);
  assert.deepEqual(state, { count: 1, triggered: false });

  state = updateSustainedBlowCount(state.count, true, 3);
  state = updateSustainedBlowCount(state.count, true, 3);
  assert.deepEqual(state, { count: 3, triggered: true });
});

test('isMicrophoneSupported checks navigator.mediaDevices.getUserMedia safely', () => {
  assert.equal(isMicrophoneSupported(null), false);
  assert.equal(isMicrophoneSupported({} as Navigator), false);
  assert.equal(
    isMicrophoneSupported({
      mediaDevices: {
        getUserMedia: async () => ({} as MediaStream),
      } as MediaDevices,
    }),
    true
  );
});
