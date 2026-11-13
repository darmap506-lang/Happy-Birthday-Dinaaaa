export interface MelodyNote {
  freq: number;
  beats: number;
  bassFreq?: number;
  gapAfterBeats?: number;
}

export interface ScheduledNoteEvent {
  step: number;
  note: MelodyNote;
  timeSec: number;
  durationSec: number;
}

export const BEAT_SEC = 0.52;
export const LOOKAHEAD_SEC = 0.16;
export const SCHEDULER_INTERVAL_MS = 30;
export const ENVELOPE_CHIME_SYNC_DELAY_SEC = 0.42;

/**
 * Happy Birthday in F major, strictly aligned to 3/4 waltz meter
 * with subtle root bass accompaniment on downbeats.
 */
export const HAPPY_BIRTHDAY_NOTES: readonly MelodyNote[] = [
  // Phrase 1: Happy birthday to you
  { freq: 261.63, beats: 0.75 },
  { freq: 261.63, beats: 0.25 },
  { freq: 293.66, beats: 1, bassFreq: 174.61 }, // F3
  { freq: 261.63, beats: 1 },
  { freq: 349.23, beats: 1 },
  { freq: 329.63, beats: 2, bassFreq: 130.81 }, // C3

  // Phrase 2: Happy birthday to you
  { freq: 261.63, beats: 0.75 },
  { freq: 261.63, beats: 0.25 },
  { freq: 293.66, beats: 1, bassFreq: 130.81 }, // C3
  { freq: 261.63, beats: 1 },
  { freq: 392.0, beats: 1 },
  { freq: 349.23, beats: 2, bassFreq: 174.61 }, // F3

  // Phrase 3: Happy birthday dear Dina
  { freq: 261.63, beats: 0.75 },
  { freq: 261.63, beats: 0.25 },
  { freq: 523.25, beats: 1, bassFreq: 174.61 }, // F3
  { freq: 440.0, beats: 1 },
  { freq: 349.23, beats: 1 },
  { freq: 329.63, beats: 1, bassFreq: 116.54 }, // Bb2
  { freq: 293.66, beats: 2, gapAfterBeats: 1 },

  // Phrase 4: Happy birthday to you
  { freq: 466.16, beats: 0.75 },
  { freq: 466.16, beats: 0.25 },
  { freq: 440.0, beats: 1, bassFreq: 174.61 }, // F3
  { freq: 349.23, beats: 1 },
  { freq: 392.0, beats: 1, bassFreq: 130.81 }, // C3
  { freq: 349.23, beats: 2, bassFreq: 174.61, gapAfterBeats: 2.5 },
];

export function resyncNoteTime(
  currentTime: number,
  nextNoteTime: number,
  maxLagSec = 0.25,
  leadInSec = 0.04
): number {
  if (nextNoteTime < currentTime - maxLagSec) {
    return currentTime + leadInSec;
  }
  return nextNoteTime;
}

export function collectNotesInWindow(
  startStep: number,
  startNoteTime: number,
  horizonTime: number,
  beatSec = BEAT_SEC,
  notes: readonly MelodyNote[] = HAPPY_BIRTHDAY_NOTES
): {
  events: ScheduledNoteEvent[];
  nextStep: number;
  nextNoteTime: number;
} {
  if (notes.length === 0) {
    return { events: [], nextStep: 0, nextNoteTime: startNoteTime };
  }

  const events: ScheduledNoteEvent[] = [];
  let step = ((startStep % notes.length) + notes.length) % notes.length;
  let noteTime = startNoteTime;

  while (noteTime < horizonTime) {
    const note = notes[step];
    const durationSec = note.beats * beatSec;
    events.push({
      step,
      note,
      timeSec: noteTime,
      durationSec,
    });
    const gapSec = (note.gapAfterBeats ?? 0) * beatSec;
    noteTime += durationSec + gapSec;
    step = (step + 1) % notes.length;
  }

  return {
    events,
    nextStep: step,
    nextNoteTime: noteTime,
  };
}
