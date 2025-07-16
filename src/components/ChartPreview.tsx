import { Bar, Pie, Line, Scatter, Doughnut } from "react-chartjs-2";

interface ChartPreviewProps {
    chartType: string;
    chartData: any;
    noDataText?: string;
}

export default function ChartPreview({ chartType, chartData, noDataText = "No chart data" }: ChartPreviewProps) {
    if (!chartData) return <div className="text-gray-500">{noDataText}</div>;

    const commonProps = {
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } } },
        height: 320,
    };

    switch (chartType) {
        case "bar":
            return <Bar key={chartType + JSON.stringify(chartData)} data={chartData} {...commonProps} />;
        case "pie":
            return <Pie key={chartType + JSON.stringify(chartData)} data={chartData} {...commonProps} />;
        case "line":
        case "area":
            return (
                <Line
                    key={chartType + JSON.stringify(chartData)}
                    data={{
                        ...chartData,
                        datasets: chartData.datasets.map((ds: any) => ({
                            ...ds,
                            fill: chartType === "area" ? true : false,
                            backgroundColor: chartType === "area" ? "rgba(99, 102, 241, 0.3)" : ds.backgroundColor,
                            borderColor: "#6366f1"
                        })),
                    }}
                    {...commonProps}
                />
            );
        case "scatter":
            return <Scatter key={chartType + JSON.stringify(chartData)} data={chartData} {...commonProps} />;
        case "doughnut":
            return <Doughnut key={chartType + JSON.stringify(chartData)} data={chartData} {...commonProps} />;
        default:
            return null;
    }
}
