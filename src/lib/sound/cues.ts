export type Note = {
  frequency: number;
  start: number;
  duration: number;
  wave: OscillatorType;
  gain: number;
};

export type CueName = "tap" | "regroup" | "boss" | "break" | "victory";

const note = (
  frequency: number,
  start: number,
  duration: number,
  wave: OscillatorType,
  gain: number,
): Note => ({
  frequency,
  start,
  duration,
  wave,
  gain,
});

export const cues: Record<CueName, Note[]> = {
  tap: [note(660, 0, 0.06, "sine", 0.08)],
  regroup: [note(523, 0, 0.1, "triangle", 0.1), note(784, 0.09, 0.14, "triangle", 0.1)],
  boss: [note(196, 0, 0.35, "sawtooth", 0.06), note(185, 0.3, 0.45, "sawtooth", 0.06)],
  break: [
    note(880, 0, 0.08, "square", 0.05),
    note(622, 0.08, 0.08, "square", 0.05),
    note(440, 0.16, 0.08, "square", 0.05),
    note(262, 0.24, 0.3, "triangle", 0.09),
  ],
  victory: [
    note(523, 0, 0.14, "triangle", 0.1),
    note(659, 0.13, 0.14, "triangle", 0.1),
    note(784, 0.26, 0.14, "triangle", 0.1),
    note(1047, 0.39, 0.4, "triangle", 0.12),
  ],
};

export const cueDuration = (name: CueName): number =>
  Math.max(...cues[name].map((entry) => entry.start + entry.duration));
