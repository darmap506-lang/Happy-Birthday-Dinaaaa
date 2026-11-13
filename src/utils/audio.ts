/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BEAT_SEC,
  HAPPY_BIRTHDAY_NOTES,
  LOOKAHEAD_SEC,
  SCHEDULER_INTERVAL_MS,
  collectNotesInWindow,
  resyncNoteTime,
} from './audioSchedule';

// Web Audio API helper for sound effects and sample-accurate music box melody

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicMasterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private isMusicDucked: boolean = false;
  private userPaused: boolean = false;
  private pendingAutoplay: boolean = false;
  private schedulerInterval: number | null = null;
  private nextNoteTime: number = 0;
  private currentStep: number = 0;
  private activeOscillators: Set<OscillatorNode> = new Set();
  private listeners: Set<(playing: boolean) => void> = new Set();
  private visibilityBound: boolean = false;

  public subscribe(listener: (playing: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isMusicPlaying);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.isMusicPlaying);
      } catch {
        // ignore
      }
    });
  }

  private ensureVisibilityHandler() {
    if (this.visibilityBound || typeof document === 'undefined') return;
    this.visibilityBound = true;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isMusicPlaying && !this.isMuted && this.ctx) {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().then(() => {
            if (this.ctx && this.isMusicPlaying) {
              this.nextNoteTime = this.ctx.currentTime + 0.05;
            }
          }).catch(() => {});
        } else {
          this.nextNoteTime = resyncNoteTime(this.ctx.currentTime, this.nextNoteTime);
        }
      }
    });
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    this.ensureVisibilityHandler();

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && !this.musicMasterGain) {
      const master = this.ctx.createGain();
      master.gain.setValueAtTime(this.isMusicDucked ? 0.08 : 1, this.ctx.currentTime);
      master.connect(this.ctx.destination);
      this.musicMasterGain = master;
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.userPaused = true;
      if (this.isMusicPlaying) {
        this.stopMusic();
      }
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public getIsMusicPlaying() {
    return this.isMusicPlaying;
  }

  public setMusicDucked(ducked: boolean) {
    this.isMusicDucked = ducked;
    if (!this.ctx || !this.musicMasterGain) return;
    const now = this.ctx.currentTime;
    this.musicMasterGain.gain.cancelScheduledValues(now);
    this.musicMasterGain.gain.setTargetAtTime(ducked ? 0.08 : 1, now, 0.05);
  }

  /**
   * Cute gentle envelope open chime (arpeggio of bells)
   */
  public playEnvelopeOpen() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.095;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.7);
    });
  }

  /**
   * Sparkle sound effect for pop-up or confetti
   */
  public playSparkle() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const freqs = [880, 1174.66, 1396.91, 1760];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + i * 0.055;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.14, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.48);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.52);
    });
  }

  /**
   * Candle blow out whoosh, wind gust & magic sparkle
   */
  public playBlowCandle() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.85;

    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const envelope = Math.sin(progress * Math.PI) * Math.pow(1 - progress, 0.4);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const lpFilter = ctx.createBiquadFilter();
    lpFilter.type = 'lowpass';
    lpFilter.frequency.setValueAtTime(1400, now);
    lpFilter.frequency.exponentialRampToValueAtTime(320, now + duration);

    const bpFilter = ctx.createBiquadFilter();
    bpFilter.type = 'bandpass';
    bpFilter.Q.value = 1.4;
    bpFilter.frequency.setValueAtTime(850, now);
    bpFilter.frequency.exponentialRampToValueAtTime(380, now + duration);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.88, now + 0.14);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseSource.connect(lpFilter);
    lpFilter.connect(bpFilter);
    bpFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    const rumbleOsc = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumbleOsc.type = 'sine';
    rumbleOsc.frequency.setValueAtTime(105, now);
    rumbleOsc.frequency.exponentialRampToValueAtTime(40, now + duration * 0.75);

    rumbleGain.gain.setValueAtTime(0.001, now);
    rumbleGain.gain.linearRampToValueAtTime(0.45, now + 0.12);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.75);

    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + duration);
    rumbleOsc.start(now);
    rumbleOsc.stop(now + duration * 0.75);

    window.setTimeout(() => {
      this.playSparkle();
    }, 450);
  }

  /**
   * Toggle music on/off cleanly
   */
  public toggleMusic(onStateChange?: (playing: boolean) => void) {
    if (this.isMusicPlaying) {
      this.userPaused = true;
      this.pendingAutoplay = false;
      this.stopMusic();
      if (onStateChange) onStateChange(false);
    } else {
      this.userPaused = false;
      this.pendingAutoplay = false;
      this.startMusic({ delaySec: 0, restartFromBeginning: true });
      if (onStateChange) onStateChange(true);
    }
  }

  private scheduleNote(freq: number, timeSec: number, durationSec: number, bassFreq?: number) {
    const ctx = this.ctx;
    const master = this.musicMasterGain;
    if (!ctx || !master) return;

    // Main music-box bell voice + gentle 2nd harmonic
    const osc = ctx.createOscillator();
    const oscHarmonic = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, timeSec);

    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(freq * 2, timeSec);

    const releaseSec = Math.min(Math.max(durationSec * 1.45, 0.55), 1.65);
    gain.gain.setValueAtTime(0.0001, timeSec);
    gain.gain.linearRampToValueAtTime(0.115, timeSec + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, timeSec + releaseSec);

    osc.connect(gain);
    oscHarmonic.connect(gain);
    gain.connect(master);

    this.activeOscillators.add(osc);
    this.activeOscillators.add(oscHarmonic);

    const cleanup = (node: OscillatorNode) => {
      node.onended = () => {
        this.activeOscillators.delete(node);
        try {
          node.disconnect();
        } catch {
          // ignore
        }
      };
    };
    cleanup(osc);
    cleanup(oscHarmonic);

    osc.start(timeSec);
    oscHarmonic.start(timeSec);
    osc.stop(timeSec + releaseSec + 0.04);
    oscHarmonic.stop(timeSec + releaseSec + 0.04);

    // Warm downbeat root bass note synced to the exact same Web Audio clock
    if (typeof bassFreq === 'number') {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      const bassRelease = Math.min(durationSec * 1.8, 1.5);

      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(bassFreq, timeSec);

      bassGain.gain.setValueAtTime(0.0001, timeSec);
      bassGain.gain.linearRampToValueAtTime(0.045, timeSec + 0.03);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, timeSec + bassRelease);

      bassOsc.connect(bassGain);
      bassGain.connect(master);

      this.activeOscillators.add(bassOsc);
      cleanup(bassOsc);

      bassOsc.start(timeSec);
      bassOsc.stop(timeSec + bassRelease + 0.04);
    }
  }

  private runSchedulerTick = () => {
    if (!this.isMusicPlaying || !this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;
    this.nextNoteTime = resyncNoteTime(now, this.nextNoteTime);

    const horizon = now + LOOKAHEAD_SEC;
    const { events, nextStep, nextNoteTime } = collectNotesInWindow(
      this.currentStep,
      this.nextNoteTime,
      horizon,
      BEAT_SEC,
      HAPPY_BIRTHDAY_NOTES
    );

    for (const evt of events) {
      this.scheduleNote(evt.note.freq, evt.timeSec, evt.durationSec, evt.note.bassFreq);
    }

    this.currentStep = nextStep;
    this.nextNoteTime = nextNoteTime;
  };

  private beginLookAheadLoop(delaySec = 0) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    if (this.schedulerInterval !== null) {
      window.clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }

    if (this.musicMasterGain) {
      const now = this.ctx.currentTime;
      this.musicMasterGain.gain.cancelScheduledValues(now);
      this.musicMasterGain.gain.setTargetAtTime(this.isMusicDucked ? 0.08 : 1, now, 0.03);
    }

    this.currentStep = 0;
    this.nextNoteTime = this.ctx.currentTime + Math.max(0.03, delaySec);
    this.isMusicPlaying = true;
    this.notify();

    this.runSchedulerTick();
    this.schedulerInterval = window.setInterval(this.runSchedulerTick, SCHEDULER_INTERVAL_MS);
  }

  public startMusic(options?: { delaySec?: number; restartFromBeginning?: boolean }) {
    const delaySec = options?.delaySec ?? 0;
    if (this.isMusicPlaying && !options?.restartFromBeginning) return;
    if (this.isMuted) this.isMuted = false;

    const ctx = this.initCtx();
    if (!ctx) return;

    const launchIfRunning = () => {
      if (this.userPaused || this.isMuted || !this.ctx) return;
      if (this.ctx.state === 'running') {
        if (!this.isMusicPlaying || options?.restartFromBeginning) {
          this.beginLookAheadLoop(delaySec);
        }
      }
    };

    if (ctx.state === 'running') {
      launchIfRunning();
    } else {
      ctx
        .resume()
        .then(() => {
          launchIfRunning();
        })
        .catch(() => {});
    }
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    this.pendingAutoplay = false;

    if (this.schedulerInterval !== null) {
      window.clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }

    if (this.ctx && this.musicMasterGain) {
      const now = this.ctx.currentTime;
      this.musicMasterGain.gain.cancelScheduledValues(now);
      this.musicMasterGain.gain.setTargetAtTime(0.0001, now, 0.02);
    }

    const stopAt = this.ctx ? this.ctx.currentTime + 0.06 : 0;
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop(stopAt);
      } catch {
        // already stopped
      }
    });
    this.activeOscillators.clear();
    this.notify();
  }

  /**
   * Unlocks AudioContext cleanly on the very first user gesture so backsound
   * never starts out-of-sync or triggers blocked-AudioContext warnings on load.
   */
  public startAutoplay() {
    if (typeof window === 'undefined') return;
    if (this.isMusicPlaying || this.userPaused) return;

    this.pendingAutoplay = true;

    const gestureEvents = ['pointerdown', 'touchstart', 'click', 'keydown'];
    const onFirstGesture = () => {
      gestureEvents.forEach((evt) => {
        window.removeEventListener(evt, onFirstGesture);
      });
      if (!this.pendingAutoplay || this.userPaused || this.isMusicPlaying) return;
      this.pendingAutoplay = false;
      this.startMusic({ delaySec: 0.05 });
    };

    gestureEvents.forEach((evt) => {
      window.addEventListener(evt, onFirstGesture, { passive: true, once: true });
    });
  }
}

export const sound = new SoundManager();
