import type { TextItemData } from "./types";

function nearest(value: number, boundaries: number[]): number {
  return boundaries.reduce((best, b) => Math.abs(b - value) < Math.abs(best - value) ? b : best, boundaries[0]);
}

export function buildTable(
  items: TextItemData[],
  colBoundaries: number[],
  rowBoundaries: number[]
): string[][] {
  const colIdx = new Map(colBoundaries.map((c, i) => [c, i]));
  const rowIdx = new Map(rowBoundaries.map((r, i) => [r, i]));

  const table: string[][] = Array.from(
    { length: rowBoundaries.length },
    () => Array(colBoundaries.length).fill("")
  );

  for (const item of items) {
    const col = colIdx.get(nearest(item.x, colBoundaries));
    const row = rowIdx.get(nearest(item.y, rowBoundaries));
    if (col !== undefined && row !== undefined) {
      table[row][col] = table[row][col]
        ? `${table[row][col]} ${item.str}`
        : item.str;
    }
  }

  return table;
}
