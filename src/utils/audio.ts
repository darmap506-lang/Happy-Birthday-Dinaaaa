/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API helper for sound effects and gentle music box melody

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicTimeout: number | null = null;
  private listeners: Set<(playing: boolean) => void> = new Set();

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

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isMusicPlaying) {
      this.stopMusic();
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public getIsMusicPlaying() {
    return this.isMusicPlaying;
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

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.1 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.1 + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.75);
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

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.06 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.55);
    });
  }

  /**
   * Candle blow out whoosh & magic sparkle
   */
  public playBlowCandle() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    // Breath / white noise puff
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.35);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();

    // Follow with cheerful chime
    setTimeout(() => {
      this.playSparkle();
    }, 250);
  }

  /**
   * Gentle music box Happy Birthday lullaby
   */
  public toggleMusic(onStateChange?: (playing: boolean) => void) {
    if (this.isMusicPlaying) {
      this.stopMusic();
      if (onStateChange) onStateChange(false);
    } else {
      this.startMusic();
      if (onStateChange) onStateChange(true);
    }
  }

  public startMusic() {
    if (this.isMusicPlaying) return;
    if (this.isMuted) this.isMuted = false;
    const ctx = this.initCtx();
    if (!ctx) return;

    this.isMusicPlaying = true;
    this.notify();

    // Happy birthday melody notes & durations: [freq, duration in beats]
    // Happy Birthday in F major:
    // C4, C4, D4, C4, F4, E4
    // C4, C4, D4, C4, G4, F4
    // C4, C4, C5, A4, F4, E4, D4
    // Bb4, Bb4, A4, F4, G4, F4
    const melody: Array<[number, number]> = [
      [261.63, 0.75], [261.63, 0.25], [293.66, 1], [261.63, 1], [349.23, 1], [329.63, 2],
      [261.63, 0.75], [261.63, 0.25], [293.66, 1], [261.63, 1], [392.00, 1], [349.23, 2],
      [261.63, 0.75], [261.63, 0.25], [523.25, 1], [440.00, 1], [349.23, 1], [329.63, 1], [293.66, 1.5],
      [466.16, 0.75], [466.16, 0.25], [440.00, 1], [349.23, 1], [392.00, 1], [349.23, 2.5]
    ];

    const tempoMs = 520; // gentle slow music box tempo
    let step = 0;

    const playNext = () => {
      if (!this.isMusicPlaying) return;
      const [freq, beats] = melody[step];
      const durationSec = (beats * tempoMs) / 1000;

      // Play soft music box bell note
      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freq * 2, ctx.currentTime);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(durationSec * 1.5, 1.8));

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + 2);
      oscHarmonic.stop(now + 2);

      step = (step + 1) % melody.length;
      const pauseDuration = step === 0 ? 2500 : beats * tempoMs;
      this.musicTimeout = window.setTimeout(playNext, pauseDuration);
    };

    playNext();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
    this.notify();
  }

  /**
   * Attempts automatic playback on load and safely unlocks AudioContext on first user interaction.
   */
  public startAutoplay() {
    if (typeof window === 'undefined') return;
    if (this.isMusicPlaying) return;

    const tryPlay = () => {
      this.startMusic();
    };

    // Attempt immediate playback
    tryPlay();

    // Listen to first gesture in case browser policy requires it
    const gestureEvents = ['click', 'touchstart', 'pointerdown', 'keydown'];
    const onFirstGesture = () => {
      tryPlay();
      gestureEvents.forEach((evt) => {
        window.removeEventListener(evt, onFirstGesture);
      });
    };

    gestureEvents.forEach((evt) => {
      window.addEventListener(evt, onFirstGesture, { passive: true, once: true });
    });
  }
}

export const sound = new SoundManager();
