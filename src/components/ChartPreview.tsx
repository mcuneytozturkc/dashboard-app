import { forwardRef } from "react";
import { Bar, Pie, Line, Scatter, Doughnut } from "react-chartjs-2";
import type { Chart as ChartJS, ChartOptions, ChartData } from "chart.js";
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

// Cast helper — chart.js component generics require specific ChartData<"bar"> etc.
function asType<T>(data: AppChartData): ChartData<T extends string ? T : never> {
  return data as unknown as ChartData<T extends string ? T : never>;
}

const ChartPreview = forwardRef<ChartJS, ChartPreviewProps>(
  ({ chartType, chartData, noDataText = "No chart data", customization = DEFAULT_CUSTOMIZATION }, ref) => {
    if (!chartData) return <div className="text-gray-500">{noDataText}</div>;

    const colored = applyColors(chartData, customization.colorPalette);
    const options = buildOptions(chartType, customization);
    const key = chartType + JSON.stringify(chartData);
    const commonProps = { options, height: 320, ref };

    switch (chartType) {
      case "bar":
        return <Bar key={key} data={asType<"bar">(colored)} {...commonProps} />;
      case "pie":
        return <Pie key={key} data={asType<"pie">(colored)} {...commonProps} />;
      case "line":
      case "area": {
        const lineColored = asType<"line">(colored);
        return (
          <Line
            key={key}
            data={{
              ...lineColored,
              datasets: lineColored.datasets.map(ds => ({
                ...ds,
                fill: chartType === "area",
              })),
            }}
            {...commonProps}
          />
        );
      }
      case "scatter":
        return <Scatter key={key} data={asType<"scatter">(colored)} {...commonProps} />;
      case "doughnut":
        return <Doughnut key={key} data={asType<"doughnut">(colored)} {...commonProps} />;
      default:
        return null;
    }
  }
);

ChartPreview.displayName = "ChartPreview";
export default ChartPreview;
