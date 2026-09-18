import { cues, type CueName } from "./cues";

let context: AudioContext | null = null;

const audio = (): AudioContext | null => {
  if (typeof window === "undefined" || typeof window.AudioContext !== "function") return null;
  context ??= new window.AudioContext();
  return context;
};

export function playCue(name: CueName): void {
  const ctx = audio();
  if (ctx === null) return;
  if (ctx.state === "suspended") void ctx.resume();

  const now = ctx.currentTime;
  for (const entry of cues[name]) {
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    const begin = now + entry.start;
    const end = begin + entry.duration;

    oscillator.type = entry.wave;
    oscillator.frequency.setValueAtTime(entry.frequency, begin);
    envelope.gain.setValueAtTime(0, begin);
    envelope.gain.linearRampToValueAtTime(entry.gain, begin + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(envelope).connect(ctx.destination);
    oscillator.start(begin);
    oscillator.stop(end + 0.02);
  }
}
