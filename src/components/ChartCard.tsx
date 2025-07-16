import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale);

type ChartCardProps = {
    title: string;
    labels: string[];
    data: number[];
};

export default function ChartCard({ title, labels, data }: ChartCardProps) {
    return (
        <div className="bg-white rounded-lg shadow p-4 w-full max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">{title}</h2>
            <div className="relative h-64"> {/* Sabit yükseklik burada! */}
                <Bar
                    data={{
                        labels,
                        datasets: [
                            {
                                label: title,
                                data,
                                backgroundColor: "#6366f1",
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false, // Sabit yüksekliği dış div belirliyor
                        plugins: { legend: { display: false } },
                    }}
                />
            </div>
        </div>
    );
}
