import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const css = readFileSync("src/styles/theme.css", "utf8");
const tokens = new Map(
  [...css.matchAll(/--color-([a-z0-9-]+):\s*oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/g)].map(
    (match) => [match[1] ?? "", [Number(match[2]), Number(match[3]), Number(match[4])]] as const,
  ),
);

const toLinearSrgb = ([lightness, chroma, hue]: readonly number[]): number[] => {
  const l0 = (lightness ?? 0) / 100;
  const a = (chroma ?? 0) * Math.cos(((hue ?? 0) * Math.PI) / 180);
  const b = (chroma ?? 0) * Math.sin(((hue ?? 0) * Math.PI) / 180);
  const l = (l0 + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (l0 - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (l0 - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((channel) => Math.min(1, Math.max(0, channel)));
};

const luminance = (name: string): number => {
  const token = tokens.get(name);
  if (token === undefined) throw new Error(`no colour token ${name}`);
  const [r = 0, g = 0, b = 0] = toLinearSrgb(token);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (foreground: string, background: string): number => {
  const [high, low] = [luminance(foreground), luminance(background)].sort((x, y) => y - x);
  return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05);
};

const textPairs: [string, string][] = [
  ["ink", "canvas"],
  ["ink-soft", "surface"],
  ["ink-soft", "canvas"],
  ["ink-muted", "surface"],
  ["ink-muted", "canvas"],
  ["ink-muted", "violet-50"],
  ["violet-500", "surface"],
  ["violet-500", "canvas"],
  ["surface", "violet-500"],
  ["surface", "violet-600"],
  ["violet-600", "violet-50"],
  ["violet-50", "violet-500"],
  ["mint-700", "mint-100"],
  ["peach-700", "peach-100"],
  ["coral-700", "coral-100"],
  ["coral-700", "canvas"],
  ["mint-700", "canvas"],
];

describe("colour contrast", () => {
  test("pure white on pure white is 1:1 and near black on white is high", () => {
    expect(contrast("surface", "surface")).toBeCloseTo(1);
    expect(contrast("ink", "surface")).toBeGreaterThan(12);
  });

  test("every text and background pair the screens use meets 4.5:1", () => {
    const failing = textPairs
      .map(([foreground, background]) => ({
        foreground,
        background,
        ratio: contrast(foreground, background),
      }))
      .filter((pair) => pair.ratio < 4.5);
    expect(failing).toEqual([]);
  });
});
