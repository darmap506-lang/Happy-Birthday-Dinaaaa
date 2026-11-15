import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BEAT_SEC,
  HAPPY_BIRTHDAY_NOTES,
  canStartImmediateAutoplay,
  collectNotesInWindow,
  resolveAutoplayGestureAction,
  resyncNoteTime,
  shouldResumeOnLoad,
} from './audioSchedule';

test('HAPPY_BIRTHDAY_NOTES has all 25 notes with positive beats and phrase downbeat bass notes', () => {
  assert.equal(HAPPY_BIRTHDAY_NOTES.length, 25);
  for (const n of HAPPY_BIRTHDAY_NOTES) {
    assert.ok(n.freq > 0);
    assert.ok(n.beats > 0);
  }
  const withBass = HAPPY_BIRTHDAY_NOTES.filter((n) => typeof n.bassFreq === 'number');
  assert.ok(withBass.length >= 6);
});

test('collectNotesInWindow schedules sample-accurate non-overlapping timestamps without drift', () => {
  const start = 10.0;
  const horizon = start + 2.5;
  const result = collectNotesInWindow(0, start, horizon, BEAT_SEC);

  assert.ok(result.events.length >= 4);
  assert.equal(result.events[0].timeSec, start);

  for (let i = 1; i < result.events.length; i++) {
    const prev = result.events[i - 1];
    const curr = result.events[i];
    const expectedGap = (prev.note.gapAfterBeats ?? 0) * BEAT_SEC;
    assert.ok(
      Math.abs(curr.timeSec - (prev.timeSec + prev.durationSec + expectedGap)) < 1e-9,
      'each scheduled note must align cleanly to exact cumulative beats'
    );
  }

  assert.ok(result.nextNoteTime >= horizon);
});

test('collectNotesInWindow wraps cleanly around melody loop boundary', () => {
  const lastStep = HAPPY_BIRTHDAY_NOTES.length - 1;
  const res = collectNotesInWindow(lastStep, 5.0, 8.0, BEAT_SEC);
  assert.equal(res.events[0].step, lastStep);
  assert.equal(res.events[1].step, 0);
});

test('resyncNoteTime snaps forward when tab backgrounding causes lag', () => {
  assert.equal(resyncNoteTime(12.0, 10.5, 0.25, 0.04), 12.04);
  assert.equal(resyncNoteTime(12.0, 11.9, 0.25, 0.04), 11.9);
  assert.equal(resyncNoteTime(12.0, 12.1, 0.25, 0.04), 12.1);
});

test('canStartImmediateAutoplay only starts when context is running and playback is allowed', () => {
  assert.equal(
    canStartImmediateAutoplay('running', { userPaused: false, isMuted: false, isMusicPlaying: false }),
    true
  );
  assert.equal(
    canStartImmediateAutoplay('suspended', { userPaused: false, isMuted: false, isMusicPlaying: false }),
    false
  );
  assert.equal(
    canStartImmediateAutoplay('running', { userPaused: true, isMuted: false, isMusicPlaying: false }),
    false
  );
  assert.equal(
    canStartImmediateAutoplay('running', { userPaused: false, isMuted: true, isMusicPlaying: false }),
    false
  );
  assert.equal(
    canStartImmediateAutoplay('running', { userPaused: false, isMuted: false, isMusicPlaying: true }),
    false
  );
});

test('resolveAutoplayGestureAction prevents double-toggle on music toggle button and respects user pause', () => {
  assert.equal(
    resolveAutoplayGestureAction({
      pendingAutoplay: true,
      userPaused: false,
      isMuted: false,
      isMusicPlaying: false,
      isToggleTarget: false,
    }),
    'start'
  );
  assert.equal(
    resolveAutoplayGestureAction({
      pendingAutoplay: true,
      userPaused: false,
      isMuted: false,
      isMusicPlaying: false,
      isToggleTarget: true,
    }),
    'defer-to-toggle'
  );
  assert.equal(
    resolveAutoplayGestureAction({
      pendingAutoplay: true,
      userPaused: true,
      isMuted: false,
      isMusicPlaying: false,
      isToggleTarget: false,
    }),
    'noop'
  );
  assert.equal(
    resolveAutoplayGestureAction({
      pendingAutoplay: false,
      userPaused: false,
      isMuted: false,
      isMusicPlaying: false,
      isToggleTarget: false,
    }),
    'noop'
  );
});

test('shouldResumeOnLoad only resumes suspended context on load when user activation exists or API is absent', () => {
  assert.equal(shouldResumeOnLoad('running', { hasBeenActive: false, isActive: false }), false);
  assert.equal(shouldResumeOnLoad('suspended', { hasBeenActive: false, isActive: false }), false);
  assert.equal(shouldResumeOnLoad('suspended', { hasBeenActive: true, isActive: false }), true);
  assert.equal(shouldResumeOnLoad('suspended', { hasBeenActive: false, isActive: true }), true);
  assert.equal(shouldResumeOnLoad('suspended', null), true);
});


