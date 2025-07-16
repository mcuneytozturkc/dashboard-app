import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ChartPreview from "../components/ChartPreview";
import { chartTemplates, type ChartType } from "../model/ChartTemplate";
import { parsePdfToChartData } from "../services/pdfToChart.service";

export default function PdfToChartPage() {
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
        setChartData(null);
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
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
            const data = await parsePdfToChartData(selectedFile, selectedChart);
            setChartData(data);
            setMessage(t("chart_generation_success"));
        } catch (err: any) {
            setChartData(null);
            setMessage(typeof err === "string" ? err : t("file_processing_error"));
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
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">{t("pdf")}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{t("description")}</p>

            {/* Grafik Tipi Seçici */}
            <div className="flex gap-4 mb-6 flex-wrap">
                {chartTemplates.map((ct) => (
                    <button
                        key={ct.type}
                        type="button"
                        className={`flex flex-col items-center border rounded-lg px-5 py-3 cursor-pointer transition 
                        ${selectedChart === ct.type
                                ? "border-emerald-600 shadow-lg bg-emerald-50 dark:bg-emerald-950"
                                : "border-gray-200 dark:border-gray-700 hover:border-emerald-300 bg-white dark:bg-gray-800"
                            }`}
                        onClick={() => setSelectedChart(ct.type as ChartType)}
                    >
                        <span className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{ct.label}</span>
                    </button>
                ))}
            </div>

            {/* Şablon indirme */}
            <div className="mb-6">
                <a
                    href={chartTemplates.find(ct => ct.type === selectedChart)?.file.pdf}
                    download
                    className="inline-block px-4 py-2 rounded bg-emerald-600 text-white text-xs font-semibold shadow hover:bg-emerald-700 transition"
                >
                    PDF {t("download_chart")}
                </a>
            </div>

            {/* Dosya Yükleme */}
            <div className="relative flex flex-col sm:flex-row gap-3 items-center">
                <input
                    id="pdf-upload"
                    ref={fileInput}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <label
                    htmlFor="pdf-upload"
                    className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-200 rounded cursor-pointer font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900 transition"
                >
                    {t("choose_file")}
                </label>
                <span className="text-sm text-gray-400 dark:text-gray-300">
                    {selectedFile ? selectedFile.name : t("no_file_selected")}
                </span>
                <button
                    className="ml-0 sm:ml-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                    onClick={handleCreateChart}
                    disabled={loading}
                >
                    {loading ? t("file_processing") : t("generate_chart")}
                </button>
            </div>

            {message && (
                <div className={`mb-4 text-sm ${message.toLowerCase().includes("error") || message.toLowerCase().includes("hata")
                    ? "text-red-500 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                    }`}>
                    {message}
                </div>
            )}

            {/* Grafik Önizleme */}
            <div className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded p-5 mt-6 w-full h-[350px] flex items-center justify-center transition-colors">
                <div className="w-full h-full">
                    <ChartPreview
                        chartType={selectedChart}
                        chartData={chartData}
                        noDataText={t("chart_not_available")}
                    />
                </div>
            </div>
        </div>
    );
}
