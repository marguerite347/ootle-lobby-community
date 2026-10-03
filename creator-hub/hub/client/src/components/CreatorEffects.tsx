import { useEffect, useRef, useState } from "react";
import type { CreateTypes } from "canvas-confetti";
import "./CreatorEffects.css";

export const EFFECT_RECIPES = {
  success: {
    label: "Success burst",
    count: 32,
    spread: 55,
    velocity: 24,
    notes: [523, 659],
  },
  achievement: {
    label: "Achievement reveal",
    count: 64,
    spread: 100,
    velocity: 32,
    notes: [523, 659, 784],
  },
  upgrade: {
    label: "Upgrade feedback",
    count: 24,
    spread: 35,
    velocity: 38,
    notes: [392, 784],
  },
} as const;
type EffectName = keyof typeof EFFECT_RECIPES;

/** Preview sandbox. No game state, reward ledger or analytics counts are mutated. */
export default function CreatorEffects() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const confetti = useRef<CreateTypes | null>(null);
  const mounted = useRef(true);
  const audio = useRef<AudioContext | null>(null);
  const [sound, setSound] = useState(false);
  const [selected, setSelected] = useState<EffectName>("achievement");
  const [notice, setNotice] = useState("Choose an effect and try it.");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      confetti.current?.reset();
      void audio.current?.close();
    };
  }, []);
  function playNotes(notes: readonly number[]) {
    const context = audio.current ?? new AudioContext();
    audio.current = context;
    void context.resume();
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator(),
        gain = context.createGain();
      const start = context.currentTime + index * 0.09;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.04, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.25);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    });
  }
  async function preview() {
    if (busy) return;
    const recipe = EFFECT_RECIPES[selected];
    if (sound)
      try {
        playNotes(recipe.notes);
      } catch {
        setSound(false);
      }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setNotice(`${recipe.label}: motion reduced. Preview complete.`);
      return;
    }
    setBusy(true);
    try {
      const module = await import("canvas-confetti");
      if (!mounted.current || !canvas.current) return;
      confetti.current ??= module.default.create(canvas.current, {
        resize: true,
        useWorker: false,
      });
      confetti.current.reset();
      setNotice(`${recipe.label} · preview only`);
      await confetti.current({
        particleCount: recipe.count,
        spread: recipe.spread,
        startVelocity: recipe.velocity,
        ticks: 85,
        gravity: 1.2,
        origin: { x: 0.5, y: 0.75 },
        colors: ["#c4ff38", "#c9b6ff", "#f7b5da"],
        disableForReducedMotion: true,
      });
    } catch {
      if (mounted.current)
        setNotice("Effect unavailable. Your project is unchanged.");
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <section className="effects-lab">
      <div className="effects-preview">
        <canvas ref={canvas} aria-hidden="true" />
        <div className="effect-emblem" aria-hidden="true">
          ✦
        </div>
        <span className="release-label">YOUR MOMENT TO SHINE</span>
        <h2>{EFFECT_RECIPES[selected].label}</h2>
        <p role="status">{notice}</p>
      </div>
      <div className="effects-controls">
        <div role="group" aria-label="Effect recipe">
          {Object.entries(EFFECT_RECIPES).map(([key, recipe]) => (
            <button
              key={key}
              aria-pressed={selected === key}
              onClick={() => setSelected(key as EffectName)}
            >
              {recipe.label}
            </button>
          ))}
        </div>
        <label>
          <input
            type="checkbox"
            checked={sound}
            onChange={(event) => setSound(event.target.checked)}
          />{" "}
          Enable preview sound
        </label>
        <button className="btn primary" disabled={busy} onClick={preview}>
          {busy ? "Playing…" : "Try this effect"}
        </button>
        <small>
          Canvas Confetti 1.9.3 · maximum 64 particles · reduced motion
          supported · no automatic audio
        </small>
      </div>
    </section>
  );
}
