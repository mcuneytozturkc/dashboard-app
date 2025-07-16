import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { chartTemplates, type ChartType } from "../model/ChartTemplate";
import { parseExcelToChartData } from "../services/excelToChart.service";
import ChartPreview from "../components/ChartPreview";
import {
    Chart as ChartJS,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";

// KAYIT (register) ET
ChartJS.register(
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler
);

export default function ExcelToChartPage() {
    const { t } = useTranslation();
    const fileInput = useRef<HTMLInputElement>(null);

    const [selectedChart, setSelectedChart] = useState<ChartType>("bar");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [chartData, setChartData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Dosya seçimi
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage("");
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    };
    const chartRef = useRef<any>(null);

    const handleDownloadChart = () => {
        if (!chartRef.current) return;
        const chartInstance = chartRef.current;
        const canvas = chartInstance.canvas || chartInstance.canvasEl;
        if (canvas && canvas.toDataURL) {
            const url = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = url;
            a.download = "chart.png";
            a.click();
        } else {
            alert("Grafik bulunamadı!");
        }
    };


    // Chart oluşturma
    const handleCreateChart = async () => {
        if (!selectedFile) {
            setMessage(t("file_not_supported"));
            return;
        }
        setLoading(true);
        setMessage("");
        try {
            const data = await parseExcelToChartData(selectedFile, selectedChart);
            setChartData(data);
            setMessage(t("chart_generation_success"));
        } catch (err) {
            setMessage(typeof err === "string" ? err : t("file_not_supported"));
        }
        setLoading(false);
    };

    return (
        <div className="
            flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center
            bg-gradient-to-br from-indigo-100 to-white
            dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800
        ">
            {/* Başlık */}
            <h1 className="text-2xl font-bold mb-2 dark:text-white">{t("excel")}</h1>
            <p className="text-gray-600 dark:text-white mb-6">{t("description")}</p>

            {/* Grafik Tipi Seçici */}
            <div className="flex gap-4 mb-6 flex-wrap">
                {chartTemplates.map((ct) => (
                    <button
                        key={ct.type}
                        type="button"
                        className={`flex flex-col items-center border rounded-lg px-5 py-3 cursor-pointer transition
                        ${selectedChart === ct.type
                                ? "border-indigo-600 shadow-lg bg-indigo-50 dark:bg-gray-800 dark:text-white dark:border-indigo-400"
                                : "border-gray-200 hover:border-indigo-300 bg-white dark:text-white dark:bg-gray-900 dark:border-gray-700 dark:hover:border-indigo-500"
                            }`}
                        onClick={() => setSelectedChart(ct.type)}
                    >
                        <span className="font-semibold mb-2">{ct.label}</span>
                    </button>
                ))}
            </div>

            {/* Seçili grafik tipine uygun şablon indir butonu */}
            <div className="mb-6">
                <a
                    href={chartTemplates.find(ct => ct.type === selectedChart)?.file.excel}
                    download
                    className="inline-block px-4 py-2 rounded bg-indigo-600 text-white text-xs font-semibold shadow hover:bg-indigo-700 transition"
                >
                    Excel {t("download_chart")}
                </a>
            </div>

            {/* Dosya Yükleme */}
            <div className="relative flex flex-col sm:flex-row gap-3 items-center">
                <input
                    id="file-upload"
                    ref={fileInput}
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <label
                    htmlFor="file-upload"
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded cursor-pointer font-semibold hover:bg-indigo-100 transition dark:bg-gray-800 dark:text-indigo-300 dark:hover:bg-gray-700"
                >
                    {t("choose_file")}
                </label>
                <span className="text-sm text-gray-400 dark:text-gray-300">
                    {selectedFile ? selectedFile.name : t("no_file_selected")}
                </span>
                <button
                    className="ml-0 sm:ml-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    onClick={handleCreateChart}
                    disabled={loading}
                >
                    {loading ? t("file_processing") : t("generate_chart")}
                </button>
                {chartData && (
                    <button
                        className="ml-0 sm:ml-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                        disabled={loading}
                        onClick={handleDownloadChart}
                    >
                        {loading ? t("file_processing") : t("download_chart_png")}
                    </button>
                )}
            </div>

            {message && (
                <div className={`mb-4 text-sm ${message.toLowerCase().includes("hata") ? "text-red-500" : "text-green-600"}`}>
                    {message}
                </div>
            )}



            {/* Grafik Önizleme */}
            <div className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded p-5 mt-6 w-full h-[350px] flex items-center justify-center transition-colors">
                <div className="w-full h-full">
                    <ChartPreview
                        ref={chartRef}
                        chartType={selectedChart}
                        chartData={chartData}
                        noDataText={t("chart_not_available")}
                    />
                </div>
            </div>

        </div>
    );
}
