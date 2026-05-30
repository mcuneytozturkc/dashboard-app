import { forwardRef } from "react";
import { Bar, Pie, Line, Scatter, Doughnut } from "react-chartjs-2";
import type { Chart as ChartJS, ChartData } from "chart.js";
import type { AppChartData, ChartCustomization } from "../types/chart";
import { DEFAULT_CUSTOMIZATION } from "../types/chart";

interface ChartPreviewProps {
  chartType: string;
  chartData: AppChartData | null;
  noDataText?: string;
  customization?: ChartCustomization;
}

function buildOptions(chartType: string, c: ChartCustomization) {
  const hasAxes = !["pie", "doughnut"].includes(chartType);
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: c.showLegend },
      title: c.title
        ? { display: true, text: c.title, font: { size: 15 } }
        : { display: false },
    },
    ...(hasAxes && {
      scales: {
        x: {
          grid: { display: c.showGrid },
          ...(c.xLabel && { title: { display: true, text: c.xLabel } }),
        },
        y: {
          grid: { display: c.showGrid },
          ...(c.yLabel && { title: { display: true, text: c.yLabel } }),
        },
      },
    }),
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
  (
    { chartType, chartData, noDataText = "No chart data", customization = DEFAULT_CUSTOMIZATION },
    ref
  ) => {
    if (!chartData) return <div className="text-gray-500">{noDataText}</div>;

    const colored = applyColors(chartData, customization.colorPalette);
    const key = chartType + JSON.stringify(chartData);

    // chart.js component generics (ChartOptions<"bar">, ref type ChartJSOrUndefined<"bar">, etc.)
    // are overly strict for our generic wrapper — cast to any, runtime is correct.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = { options: buildOptions(chartType, customization), height: 320, ref } as any;

    switch (chartType) {
      case "bar":
        return (
          <Bar key={key} data={colored as unknown as ChartData<"bar">} {...props} />
        );
      case "pie":
        return (
          <Pie key={key} data={colored as unknown as ChartData<"pie">} {...props} />
        );
      case "line":
      case "area": {
        const lineData = colored as unknown as ChartData<"line">;
        return (
          <Line
            key={key}
            data={{
              ...lineData,
              datasets: lineData.datasets.map(ds => ({
                ...ds,
                fill: chartType === "area",
              })),
            }}
            {...props}
          />
        );
      }
      case "scatter":
        return (
          <Scatter key={key} data={colored as unknown as ChartData<"scatter">} {...props} />
        );
      case "doughnut":
        return (
          <Doughnut key={key} data={colored as unknown as ChartData<"doughnut">} {...props} />
        );
      default:
        return null;
    }
  }
);

ChartPreview.displayName = "ChartPreview";
export default ChartPreview;
