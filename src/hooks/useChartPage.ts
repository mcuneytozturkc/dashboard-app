import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { Chart as ChartJS } from "chart.js";
import type { AppChartData, RawChartData } from "../types/chart";
import { DEFAULT_COLORS } from "../types/chart";
import type { ChartType } from "../model/ChartTemplate";
import { ChartParseError } from "../errors/ChartParseError";

export function toRawData(data: AppChartData): RawChartData {
  return {
    labels: (data.labels ?? []).map(String),
    datasets: data.datasets.map(ds => ({
      label: String(ds.label ?? ""),
      data: ds.data as number[],
      color: Array.isArray(ds.backgroundColor)
        ? (ds.backgroundColor[0] as string)
        : (ds.backgroundColor as string),
    })),
  };
}

export function fromRawData(raw: RawChartData): AppChartData {
  return {
    labels: raw.labels,
    datasets: raw.datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      borderColor: ds.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    })),
  };
}

export function useChartPage(
  parser: (file: File, chartType: ChartType) => Promise<AppChartData>
) {
  const { t } = useTranslation();
  const [selectedChart, setSelectedChart] = useState<ChartType>("bar");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chartData, setChartData] = useState<AppChartData | null>(null);
  const [rawData, setRawData] = useState<RawChartData | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const chartRef = useRef<ChartJS | null>(null);

  const handleFileChange = (file: File) => {
    setMessage(""); setChartData(null); setIsError(false);
    setRawData(null); setShowEditor(false);
    setSelectedFile(file);
  };

  const parseAndEdit = async (parsePromise: Promise<AppChartData>) => {
    setLoading(true); setMessage(""); setIsError(false);
    try {
      const data = await parsePromise;
      setRawData(toRawData(data));
      setShowEditor(true);
      setChartData(null);
    } catch (err) {
      setChartData(null);
      setMessage(err instanceof ChartParseError ? t(`errors.${err.code}`) : t("errors.UNKNOWN"));
      setIsError(true);
    }
    setLoading(false);
  };

  const handleCreateChart = () => {
    if (!selectedFile) {
      setMessage(t("file_not_supported")); setIsError(true); return;
    }
    parseAndEdit(parser(selectedFile, selectedChart));
  };

  const handleConfirmEdit = (edited: RawChartData) => {
    setChartData(fromRawData(edited));
    setRawData(null);
    setShowEditor(false);
    setMessage(t("chart_generation_success"));
    setIsError(false);
  };

  const handleCancelEdit = () => {
    setRawData(null);
    setShowEditor(false);
  };

  const handleDownloadChart = () => {
    const chart = chartRef.current;
    if (!chart) return;
    const url = chart.toBase64Image();
    const a = document.createElement("a");
    a.href = url; a.download = "chart.png"; a.click();
  };

  return {
    selectedChart, setSelectedChart, selectedFile, chartData,
    rawData, showEditor,
    loading, message, isError, chartRef,
    handleFileChange, handleCreateChart, parseAndEdit,
    handleConfirmEdit, handleCancelEdit, handleDownloadChart,
  };
}
