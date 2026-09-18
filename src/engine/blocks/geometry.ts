export const ONES_IN_A_TEN = 10;

export type BlockValue = 1 | 10 | 100;

export type BlockGrid = {
  columns: number;
  rows: number;
};

export type BlockSize = {
  width: number;
  height: number;
};

export type DividerLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

const grids: Record<BlockValue, BlockGrid> = {
  1: { columns: 1, rows: 1 },
  10: { columns: 1, rows: ONES_IN_A_TEN },
  100: { columns: ONES_IN_A_TEN, rows: ONES_IN_A_TEN },
};

export const blockGrid = (value: BlockValue): BlockGrid => grids[value];

export function blockSize(value: BlockValue, unit: number): BlockSize {
  const grid = blockGrid(value);
  return { width: grid.columns * unit, height: grid.rows * unit };
}

export function dividerLines(value: BlockValue, unit: number): DividerLine[] {
  const grid = blockGrid(value);
  const { width, height } = blockSize(value, unit);

  const vertical = Array.from({ length: grid.columns - 1 }, (_, index) => {
    const x = (index + 1) * unit;
    return { x1: x, y1: 0, x2: x, y2: height };
  });

  const horizontal = Array.from({ length: grid.rows - 1 }, (_, index) => {
    const y = (index + 1) * unit;
    return { x1: 0, y1: y, x2: width, y2: y };
  });

  return [...vertical, ...horizontal];
}
