import { describe, expect, test } from "vitest";
import { blockGrid, blockSize, dividerLines, type BlockValue } from "@/engine/blocks/geometry";

const values: BlockValue[] = [1, 10, 100];

describe("base ten block geometry", () => {
  test("every block is subdivided into exactly as many unit squares as it is worth", () => {
    const mismatches = values.filter((value) => {
      const grid = blockGrid(value);
      return grid.columns * grid.rows !== value;
    });

    expect(mismatches).toEqual([]);
  });

  test("a ten is a single column of ten units", () => {
    expect(blockGrid(10)).toEqual({ columns: 1, rows: 10 });
  });

  test("a hundred is ten columns of ten units", () => {
    expect(blockGrid(100)).toEqual({ columns: 10, rows: 10 });
  });

  test("a ten draws the nine dividers that make ten visible segments", () => {
    expect(dividerLines(10, 20)).toHaveLength(9);
  });

  test("a one draws no dividers", () => {
    expect(dividerLines(1, 20)).toHaveLength(0);
  });

  test("a hundred draws nine dividers in each direction", () => {
    expect(dividerLines(100, 20)).toHaveLength(18);
  });

  test("dividers stay inside the block they subdivide", () => {
    const unit = 20;
    const outside = values.flatMap((value) => {
      const { width, height } = blockSize(value, unit);
      return dividerLines(value, unit).filter(
        (line) => line.x1 < 0 || line.x2 > width || line.y1 < 0 || line.y2 > height,
      );
    });

    expect(outside).toEqual([]);
  });

  test("block size follows the grid at the given unit", () => {
    expect(blockSize(10, 20)).toEqual({ width: 20, height: 200 });
    expect(blockSize(100, 20)).toEqual({ width: 200, height: 200 });
  });
});
