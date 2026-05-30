import type { TextItemData } from "./types";

export function detectColumns(items: TextItemData[], tolerance = 10): number[] {
  const xs = items.map(it => it.x);
  if (!xs.length) return [];

  const sorted = [...new Set(xs)].sort((a, b) => a - b);
  const clusters: number[][] = [[sorted[0]]];

  for (let i = 1; i < sorted.length; i++) {
    const last = clusters[clusters.length - 1];
    const avg = last.reduce((s, v) => s + v, 0) / last.length;
    if (sorted[i] - avg <= tolerance) {
      last.push(sorted[i]);
    } else {
      clusters.push([sorted[i]]);
    }
  }

  return clusters.map(c => c.reduce((s, v) => s + v, 0) / c.length).sort((a, b) => a - b);
}
