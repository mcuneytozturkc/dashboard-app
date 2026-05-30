import type { TableBoundary } from "./types";

export function detectTableBoundaries(
  table: string[][],
  rowYPositions: number[],
  avgRowHeight: number
): TableBoundary[] {
  if (!table.length) return [];

  const gapThreshold = avgRowHeight * 2;
  const boundaries: TableBoundary[] = [];
  let start = 0;

  for (let i = 1; i < rowYPositions.length; i++) {
    const gap = rowYPositions[i] - rowYPositions[i - 1];
    if (gap > gapThreshold) {
      const slice = table.slice(start, i).filter(r => r.some(c => c.trim()));
      if (slice.length) {
        boundaries.push({ data: slice, pageIndex: 0, rowCount: slice.length, colCount: slice[0].length });
      }
      start = i;
    }
  }

  const remaining = table.slice(start).filter(r => r.some(c => c.trim()));
  if (remaining.length) {
    boundaries.push({ data: remaining, pageIndex: 0, rowCount: remaining.length, colCount: remaining[0].length });
  }

  return boundaries;
}
