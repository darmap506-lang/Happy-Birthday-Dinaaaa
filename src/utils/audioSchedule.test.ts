import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BEAT_SEC,
  HAPPY_BIRTHDAY_NOTES,
  collectNotesInWindow,
  resyncNoteTime,
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
