/** Original procedural cues on one master bus. Enabled by a player gesture; mute cuts the bus immediately. */
import type { SparkCue } from './sparkPresentation';

const MASTER_GAIN = 0.18;
const UI_GAIN = 0.85;
const SFX_GAIN = 0.9;
const PITCH_FLOOR = 0.96;
const PITCH_SPAN = 0.08;

type SparkAudioOptions = {
  createContext?: () => AudioContext;
  random?: () => number;
};

export function createSparkAudio(options: SparkAudioOptions = {}) {
  let context: AudioContext | null = null;
  let master: GainNode | null = null;
  let uiBus: GainNode | null = null;
  let sfxBus: GainNode | null = null;
  const random = options.random ?? Math.random;

  function ensure() {
    if (context && master && uiBus && sfxBus) return;
    context = options.createContext ? options.createContext() : new AudioContext();
    master = context.createGain();
    uiBus = context.createGain();
    sfxBus = context.createGain();
    master.gain.value = MASTER_GAIN;
    uiBus.gain.value = UI_GAIN;
    sfxBus.gain.value = SFX_GAIN;
    uiBus.connect(master);
    sfxBus.connect(master);
    master.connect(context.destination);
  }

  function setAudible(audible: boolean) {
    if (!context || !master) return;
    const now = context.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(audible ? MASTER_GAIN : 0, now);
  }

  function enable() {
    ensure();
    const resumed = context?.resume();
    setAudible(true);
    return Promise.resolve(resumed);
  }

  function varied(frequency: number) {
    return frequency * (PITCH_FLOOR + random() * PITCH_SPAN);
  }

  function tone(bus: GainNode | null, frequency: number, start: number, duration: number, type: OscillatorType = 'sine', end = frequency, level = 0.3) {
    if (!context || !bus) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const at = context.currentTime + start;
    const destinationFrequency = Math.max(end, 0.001);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, at);
    oscillator.frequency.exponentialRampToValueAtTime(destinationFrequency, at + duration);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(level, at + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    oscillator.connect(gain);
    gain.connect(bus);
    oscillator.start(at);
    oscillator.stop(at + duration + 0.03);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }

  function duckUi() {
    if (!context || !uiBus) return;
    const now = context.currentTime;
    uiBus.gain.cancelScheduledValues(now);
    uiBus.gain.setValueAtTime(UI_GAIN, now);
    uiBus.gain.linearRampToValueAtTime(0.25, now + 0.04);
    uiBus.gain.linearRampToValueAtTime(UI_GAIN, now + 0.7);
  }

  function bell(note: number, start = 0, level = 0.22, duration = 0.55) {
    tone(sfxBus, note, start, duration, 'sine', note, level);
    tone(sfxBus, note * 2.76, start, duration * 0.36, 'sine', note * 2.76, level * 0.18);
  }

  // A low punch plus a short bright transient reads on both speakers and headphones.
  function impact(start = 0, strength = 1) {
    tone(sfxBus, 170, start, 0.24, 'triangle', 48, 0.85 * strength);
    tone(sfxBus, 1450, start, 0.055, 'triangle', 180, 0.25 * strength);
  }

  function jackpotChord(start: number, duration = 0.7) {
    [261.63, 329.63, 392, 523.25].forEach(note => {
      tone(sfxBus, note, start, duration, 'triangle', note, 0.22);
      bell(note * 2, start, 0.19, duration);
    });
  }

  function play(cue: SparkCue) {
    if (!context || !uiBus || !sfxBus) return;
    if (cue === 'start') {
      tone(uiBus, 140, 0, 0.09, 'triangle', 75, 0.45);
      [392, 523, 784].forEach((note, i) => bell(note, 0.05 + i * 0.07, 0.16));
    }
    if (cue === 'select') {
      tone(uiBus, varied(185), 0, 0.065, 'triangle', 70, 0.45);
      tone(uiBus, varied(1100), 0.012, 0.035, 'sine', 650, 0.14);
    }
    if (cue === 'tick') tone(uiBus, varied(900), 0, 0.045, 'sine', varied(600), 0.13);
    if (cue === 'clack') {
      tone(uiBus, varied(460), 0, 0.032, 'triangle', 125, 0.32);
      tone(uiBus, varied(1900), 0, 0.022, 'sine', 700, 0.09);
    }
    if (cue === 'miss') {
      tone(sfxBus, 294, 0, 0.18, 'triangle', 247, 0.2);
      tone(sfxBus, 196, 0.16, 0.3, 'sine', 196, 0.2);
    }
    if (cue === 'win' || cue === 'unlock') {
      duckUi();
      impact();
      jackpotChord(0, 0.45);
      const notes = cue === 'unlock' ? [392, 523, 659, 784, 1047, 1568] : [523, 659, 784, 1047];
      notes.forEach((note, i) => bell(note, 0.08 + i * 0.09, 0.34, 0.65));
      jackpotChord(cue === 'unlock' ? 0.68 : 0.5, 0.85);
    }
    if (cue === 'bank') bell(784, 0, 0.22, 0.45);
    if (cue === 'spin' || cue === 'superSpin') {
      tone(sfxBus, 65, 0, 0.42, 'triangle', 260, 0.38);
      tone(sfxBus, 900, 0, 0.075, 'triangle', 130, 0.22);
      if (cue === 'superSpin') {
        tone(sfxBus, 98, 0.06, 0.8, 'sawtooth', 392, 0.06);
        tone(sfxBus, 101, 0.06, 0.8, 'sawtooth', 398, 0.06);
        bell(1568, 0.25, 0.14);
      }
    }
    if (cue === 'payout' || cue === 'bigPayout' || cue === 'jackpot') {
      duckUi();
      const big = cue === 'jackpot';
      const count = big ? 30 : cue === 'bigPayout' ? 16 : 9;
      const notes = [523, 659, 784, 1047, 1319, 1568];
      impact(0, big ? 1 : 0.65);
      if (big) jackpotChord(0, 0.65);
      for (let i = 0; i < count; i++) {
        // Short repeating cash-register runs build momentum toward the final chord.
        const note = notes[i % notes.length] * (i >= 18 ? 1.25 : 1);
        bell(note, i * 0.052, big ? 0.3 : 0.24, 0.28);
      }
      if (big) {
        // Three accented hits follow the wallet's three arrival shockwaves.
        impact(0.44, 0.7);
        impact(0.88, 0.8);
        jackpotChord(0.88, 0.55);
        impact(1.6);
        jackpotChord(1.6, 1.3);
        [1568, 2093, 2637].forEach((note, i) => bell(note, 1.72 + i * 0.1, 0.2, 0.9));
      } else if (cue === 'bigPayout') {
        jackpotChord(0.88, 0.65);
      }

    }
  }

  function dispose() {
    setAudible(false);
    if (context) void context.close();
    context = null;
    master = null;
    uiBus = null;
    sfxBus = null;
  }

  return { enable, play, setAudible, dispose };
}
