import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const sourceRoots = ["src/components", "src/app"];

const collectTsxFiles = (root: string): string[] => {
  const entries = readdirSync(root, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".tsx"))
    .map((entry) => join(entry.parentPath, entry.name));
};

const files = sourceRoots.flatMap(collectTsxFiles);

const offendersMatching = (pattern: RegExp) =>
  files
    .filter((file) => pattern.test(readFileSync(file, "utf8")))
    .map((file) => file.replace(`${process.cwd()}/`, ""));

describe("design token discipline", () => {
  test("there is component source to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  test("no raw hex colours outside the theme", () => {
    expect(offendersMatching(/#[0-9a-fA-F]{3,8}\b/)).toEqual([]);
  });

  test("no raw rgba or hsl colours", () => {
    expect(offendersMatching(/\b(?:rgba?|hsla?)\(/)).toEqual([]);
  });

  test("no Tailwind arbitrary values", () => {
    expect(offendersMatching(/(?:^|\s)[a-z-]+-\[[^\]]+\]/)).toEqual([]);
  });

  test("inline styles may only pass data through custom properties", () => {
    expect(offendersMatching(/style=\{\{(?!\s*["']--)/)).toEqual([]);
  });
});
