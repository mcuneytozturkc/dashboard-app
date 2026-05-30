import { useState } from "react";
import { useTranslation } from "react-i18next";
import { chartTemplates, type ChartType } from "../model/ChartTemplate";
import { parsePdfToChartData } from "../services/pdfToChart.service";
import { exportChartToExcel } from "../services/exportToExcel.service";
import { exportChartToPdf } from "../services/exportToPdf.service";
import { trackEvent } from "../services/analytics.service";
import ChartPreview from "../components/ChartPreview";
import FileDropzone from "../components/FileDropzone";
import ChartCustomizationPanel from "../components/ChartCustomizationPanel";
import DataEditor from "../components/DataEditor";
import PdfTableSelector from "../components/PdfTableSelector";
import { useChartPage } from "../hooks/useChartPage";
import { type ChartCustomization, DEFAULT_CUSTOMIZATION } from "../types/chart";

export default function PdfToChartPage() {
  const { t } = useTranslation();
  const [customization, setCustomization] = useState<ChartCustomization>(DEFAULT_CUSTOMIZATION);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const {
    selectedChart, setSelectedChart, selectedFile, chartData,
    rawData, showEditor,
    loading, message, isError, chartRef,
    handleFileChange, parseAndEdit,
    handleConfirmEdit, handleCancelEdit, handleDownloadChart,
  } = useChartPage(parsePdfToChartData);

  const handleCreateChart = () => {
    if (!selectedFile) return;
    setShowTableSelector(true);
  };

  const handleTableSelected = (tableIndex: number) => {
    setShowTableSelector(false);
    if (!selectedFile) return;
    parseAndEdit(parsePdfToChartData(selectedFile, selectedChart, tableIndex));
    trackEvent("file_uploaded", { fileType: "pdf", fileSizeMB: +(selectedFile.size / (1024 * 1024)).toFixed(2) });
  };

  const handleSkipSelector = () => {
    setShowTableSelector(false);
    if (!selectedFile) return;
    parseAndEdit(parsePdfToChartData(selectedFile, selectedChart, 0));
  };

  const handleDownloadExcel = async () => {
    if (!chartData) return;
    trackEvent("chart_exported", { exportType: "excel" });
    await exportChartToExcel(chartData, customization, chartRef.current?.canvas ?? null);
  };

  const handleDownloadPdfExport = async () => {
    const canvas = chartRef.current?.canvas;
    if (!chartData || !canvas) return;
    setPdfLoading(true);
    try {
      trackEvent("chart_exported", { exportType: "pdf" });
      await exportChartToPdf(canvas, chartData, customization);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleConfirmWithTracking = (data: NonNullable<typeof rawData>) => {
    handleConfirmEdit(data);
    trackEvent("chart_generated", {
      chartType: selectedChart,
      datasetCount: data.datasets.length,
      rowCount: data.labels.length,
    });
  };

  const templateFile = chartTemplates.find(ct => ct.type === selectedChart)?.file.pdf;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center
      bg-gradient-to-br from-indigo-100 to-white
      dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 px-4 py-8">

      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">{t("pdf")}</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-lg">{t("description")}</p>

      {/* Chart type selector */}
      <div className="flex gap-3 mb-6 flex-wrap justify-center">
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
            <span className="font-semibold text-gray-900 dark:text-gray-100">{ct.label}</span>
          </button>
        ))}
      </div>

      {/* Template download */}
      <div className="mb-6">
        <a href={templateFile} download
          className="inline-block px-4 py-2 rounded bg-emerald-600 text-white text-xs font-semibold shadow hover:bg-emerald-700 transition">
          PDF {t("download_chart")}
        </a>
      </div>

      {/* File dropzone */}
      <div className="w-full max-w-md mb-4">
        <FileDropzone
          accept={[".pdf"]}
          onFileSelect={handleFileChange}
          label=".pdf"
          isLoading={loading}
          selectedFile={selectedFile}
        />
      </div>

      {/* Generate + action buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        <button
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition disabled:opacity-50"
          onClick={handleCreateChart}
          disabled={loading || !selectedFile}
        >
          {loading ? t("file_processing") : t("generate_chart")}
        </button>
        {chartData && (
          <>
            <button
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
              onClick={handleDownloadChart}
            >{t("download_chart_png")}</button>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              onClick={handleDownloadExcel}
            >{t("download_chart_excel")}</button>
            <button
              className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition disabled:opacity-50"
              onClick={handleDownloadPdfExport}
              disabled={pdfLoading}
            >{pdfLoading ? t("file_processing") : t("download_chart_pdf")}</button>
          </>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-2 text-sm text-center ${isError ? "text-red-500 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
          {message}
          {isError && templateFile && (
            <span className="ml-2">
              <a href={templateFile} download className="underline hover:no-underline">
                {t("download_template")}
              </a>
            </span>
          )}
        </div>
      )}

      {/* Customization panel */}
      {chartData && (
        <div className="w-full max-w-2xl">
          <ChartCustomizationPanel
            customization={customization}
            onChange={setCustomization}
            datasetCount={chartData.datasets.length}
            chartType={selectedChart}
          />
        </div>
      )}

      {/* Chart preview */}
      <div className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded p-5 mt-2 w-full max-w-2xl h-[350px] flex items-center justify-center transition-colors">
        <div className="w-full h-full">
          <ChartPreview
            ref={chartRef}
            chartType={selectedChart}
            chartData={chartData}
            noDataText={t("chart_not_available")}
            customization={customization}
          />
        </div>
      </div>

      {/* PDF Table Selector */}
      {showTableSelector && selectedFile && (
        <PdfTableSelector
          pdfFile={selectedFile}
          onSelect={handleTableSelected}
          onCancel={() => { setShowTableSelector(false); handleSkipSelector(); }}
        />
      )}

      {/* Data Editor modal */}
      {showEditor && rawData && (
        <DataEditor
          rawData={rawData}
          chartType={selectedChart}
          onConfirm={handleConfirmWithTracking}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
}
