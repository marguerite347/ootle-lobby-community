import {selectAlphaVideoSource} from './alpha-video.mjs';
// Shared wheel charge using the licensed Envato plasma master. See electric/PROVENANCE.md.
export function createCharge(stage, {embedded = false} = {}) {
  const video = document.createElement('video');
  const source = selectAlphaVideoSource({userAgent:navigator.userAgent,canPlayType:type=>video.canPlayType(type)},
    {webm:'./electric/plasma-loop.webm',hevc:'./electric/plasma-loop-alpha.mov'});
  if (source) video.src = source;
  video.loop = true;
  video.muted = true; video.playsInline = true; video.preload = 'auto';
  video.playbackRate = 1.2;
  let playing = false;
  const canvas = document.createElement('canvas');
  canvas.className = 'electric-charge';
  canvas.setAttribute('aria-hidden', 'true');
  stage.append(canvas);
  const context = canvas.getContext('2d');
  let width = 0, height = 0, lastFrame = -1;
  const resize = new ResizeObserver(() => {
    width = stage.clientWidth; height = stage.clientHeight;
    const ratio = Math.min(devicePixelRatio, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  });
  resize.observe(stage);
  const sound = document.createElement('button');
  sound.className = 'charge-sound secondary'; sound.textContent = 'Charge sound: off';
  sound.setAttribute('aria-pressed', 'false');
  if (!embedded) stage.after(sound);
  let audio, oscillator, overtone, gain, audible = false;
  sound.onclick = async () => {
    audible = !audible;
    if (audible && !audio) {
      audio = new AudioContext(); gain = audio.createGain(); gain.gain.value = 0;
      const filter = audio.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1100;
      oscillator = audio.createOscillator(); oscillator.type = 'sawtooth';
      overtone = audio.createOscillator(); overtone.type = 'sine';
      oscillator.connect(filter); overtone.connect(filter); filter.connect(gain); gain.connect(audio.destination);
      oscillator.start(); overtone.start();
    }
    if (audible) await audio.resume();
    else if (gain) gain.gain.setTargetAtTime(0, audio.currentTime, 0.015);
    sound.textContent = `Charge sound: ${audible ? 'on' : 'off'}`;
    sound.setAttribute('aria-pressed', String(audible));
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { video.pause(); playing = false; }
    if (document.hidden && gain) gain.gain.setTargetAtTime(0, audio.currentTime, 0.015);
  });
  function paint({now, elapsed, rotation, superActive, disabled}) {
    const visible = Boolean(source) && !disabled && !document.hidden;
    const active = elapsed !== null && visible;
    if (visible !== playing) {
      playing = visible;
      if (visible) video.play().then(() => {if (!playing) video.pause();}).catch(() => {});
      else video.pause();
    }
    const progress = active ? Math.min(elapsed / 6.45, 1) : 0;
    // Keep the same flame phase across idle, spin and payout. Only its energy changes.
    const envelope = active ? Math.min(1, progress / 0.16) * Math.min(1, (1 - progress) / 0.12) : 0;
    const baseline = superActive ? 0.40 : 0.30;
    const peak = superActive ? 1 : 0.65;
    const strength = visible ? baseline + envelope * (peak - baseline) : 0;
    video.playbackRate = active ? 1.2 : 0.8;
    if (gain) {
      gain.gain.setTargetAtTime(audible && active ? strength * 0.028 : 0, audio.currentTime, 0.045);
      oscillator.frequency.setTargetAtTime(70 + progress * (superActive ? 160 : 75), audio.currentTime, 0.08);
      overtone.frequency.setTargetAtTime(141 + progress * (superActive ? 320 : 150), audio.currentTime, 0.08);
    }
    // Move the complete visual assembly together so the peg mask stays aligned.
    const shake = superActive && progress > 0.35 ? strength * 1.8 : 0;
    stage.style.transform = `translate(${Math.sin(now * 0.043) * shake}px,${Math.sin(now * 0.057) * shake * 0.65}px)`;
    canvas.style.opacity = String(video.seeking || video.readyState < 2 ? 0 : strength);
    const frame = Math.floor(video.currentTime * 30);
    if (!visible || frame === lastFrame || video.readyState < 2 || video.seeking) return;
    lastFrame = frame;
    context.clearRect(0, 0, width, height);
    const radius = embedded ? (height < 400 ? 123 : 148) : height * 0.336;
    // Preserve the master's aspect ratio. Its central ring extends past the rim.
    const size = radius * 5.15;
    context.drawImage(video, (width - size) / 2, (height - size * 9 / 16) / 2, size, size * 9 / 16);
    // Feather inward branches off the labels while retaining the outer corona.
    context.save(); context.globalCompositeOperation = 'destination-in';
    const clearance = context.createRadialGradient(width / 2, height / 2, radius * 0.80, width / 2, height / 2, radius * 0.96);
    clearance.addColorStop(0, 'transparent'); clearance.addColorStop(1, 'black');
    context.fillStyle = clearance; context.fillRect(0, 0, width, height); context.restore();
  }
  return {paint};
}
