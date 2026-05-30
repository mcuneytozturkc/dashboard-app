import { forwardRef } from "react";
import { Bar, Pie, Line, Scatter, Doughnut } from "react-chartjs-2";
import type { Chart as ChartJS, ChartDataset, ChartOptions } from "chart.js";
import type { AppChartData, ChartCustomization } from "../types/chart";
import { DEFAULT_CUSTOMIZATION } from "../types/chart";

interface ChartPreviewProps {
  chartType: string;
  chartData: AppChartData | null;
  noDataText?: string;
  customization?: ChartCustomization;
}

function buildOptions(chartType: string, c: ChartCustomization): ChartOptions {
  const hasAxes = !["pie", "doughnut"].includes(chartType);
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: c.showLegend },
      title: c.title ? { display: true, text: c.title, font: { size: 15 } } : { display: false },
    },
    scales: hasAxes ? {
      x: {
        grid: { display: c.showGrid },
        title: c.xLabel ? { display: true, text: c.xLabel } : { display: false },
      },
      y: {
        grid: { display: c.showGrid },
        title: c.yLabel ? { display: true, text: c.yLabel } : { display: false },
      },
    } : undefined,
  };
}

function applyColors(data: AppChartData, palette: string[]): AppChartData {
  return {
    ...data,
    datasets: data.datasets.map((ds, i) => ({
      ...ds,
      backgroundColor: palette[i % palette.length] ?? ds.backgroundColor,
      borderColor: palette[i % palette.length] ?? ds.borderColor,
    })),
  };
}

const ChartPreview = forwardRef<ChartJS, ChartPreviewProps>(
  ({ chartType, chartData, noDataText = "No chart data", customization = DEFAULT_CUSTOMIZATION }, ref) => {
    if (!chartData) return <div className="text-gray-500">{noDataText}</div>;

    const colored = applyColors(chartData, customization.colorPalette);
    const options = buildOptions(chartType, customization);
    const commonProps = { options, height: 320, ref };

    switch (chartType) {
      case "bar":
        return <Bar key={chartType + JSON.stringify(chartData)} data={colored} {...commonProps} />;
      case "pie":
        return <Pie key={chartType + JSON.stringify(chartData)} data={colored} {...commonProps} />;
      case "line":
      case "area":
        return (
          <Line
            key={chartType + JSON.stringify(chartData)}
            data={{
              ...colored,
              datasets: colored.datasets.map((ds: ChartDataset) => ({
                ...ds,
                fill: chartType === "area",
              })),
            }}
            {...commonProps}
          />
        );
      case "scatter":
        return <Scatter key={chartType + JSON.stringify(chartData)} data={colored} {...commonProps} />;
      case "doughnut":
        return <Doughnut key={chartType + JSON.stringify(chartData)} data={colored} {...commonProps} />;
      default:
        return null;
    }
  }
);

ChartPreview.displayName = "ChartPreview";
export default ChartPreview;
