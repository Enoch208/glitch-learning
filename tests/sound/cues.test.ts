import { describe, expect, test } from "vitest";
import { cueDuration, cues, type CueName } from "@/lib/sound/cues";

const names = Object.keys(cues) as CueName[];

describe("sound cues", () => {
  test("there is a cue for each moment that deserves one", () => {
    expect(names.sort()).toEqual(["boss", "break", "regroup", "tap", "victory"]);
  });

  test("every note is in a comfortable range for young ears", () => {
    const outOfRange = names.flatMap((name) =>
      cues[name].filter((note) => note.frequency < 110 || note.frequency > 1600),
    );
    expect(outOfRange).toEqual([]);
  });

  test("every cue is over in under a second and a half", () => {
    expect(names.filter((name) => cueDuration(name) > 1.5)).toEqual([]);
  });

  test("notes are quiet enough never to startle", () => {
    const loud = names.flatMap((name) => cues[name].filter((note) => note.gain > 0.2));
    expect(loud).toEqual([]);
  });
});
