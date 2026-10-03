import CrystalCanvas from './CrystalCanvas';
import {crystalCapturePalette} from './crystalCapture';
import type {ReactorMood} from './sparkPresentation';

/** The accepted crystal is shared by question, ready and reward states. */
export default function SparkReactor({mood = 'idle'}: {mood?: ReactorMood}) {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.documentElement.dataset.hubEffects === 'off' || mood === 'dimmed';
  return <div className={`spark-reactor mood-${mood}`} data-art="accepted-spark-crystal-v9" aria-hidden="true">
    <CrystalCanvas query={`reward=1&idle=1&wheel=1${crystalCapturePalette()}${still ? '&still=1' : ''}`} />
  </div>;
}
