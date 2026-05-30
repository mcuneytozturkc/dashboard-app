import type { ChartData } from "chart.js";

export type AppChartData = ChartData;

export interface RawDataset {
  label: string;
  data: number[];
  color?: string;
}

export interface RawChartData {
  labels: string[];
  datasets: RawDataset[];
}

export interface ChartCustomization {
  title: string;
  xLabel: string;
  yLabel: string;
  colorPalette: string[];
  showLegend: boolean;
  showGrid: boolean;
}

export const DEFAULT_COLORS = ["#6366f1", "#34d399", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899"];

export const DEFAULT_CUSTOMIZATION: ChartCustomization = {
  title: "",
  xLabel: "",
  yLabel: "",
  colorPalette: [...DEFAULT_COLORS],
  showLegend: true,
  showGrid: true,
};
