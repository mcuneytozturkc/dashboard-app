import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ChartCustomization } from "../types/chart";

const PRESETS: Record<string, string[]> = {
  indigo:    ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#4338ca", "#3730a3"],
  emerald:   ["#34d399", "#6ee7b7", "#a7f3d0", "#059669", "#047857", "#065f46"],
  sunset:    ["#f97316", "#fb923c", "#fdba74", "#ea580c", "#c2410c", "#f59e0b"],
  ocean:     ["#0ea5e9", "#38bdf8", "#7dd3fc", "#0284c7", "#0369a1", "#0c4a6e"],
  grayscale: ["#374151", "#6b7280", "#9ca3af", "#d1d5db", "#111827", "#1f2937"],
};

interface ChartCustomizationPanelProps {
  customization: ChartCustomization;
  onChange: (updated: ChartCustomization) => void;
  datasetCount?: number;
  chartType?: string;
}

export default function ChartCustomizationPanel({
  customization,
  onChange,
  datasetCount = 1,
  chartType = "bar",
}: ChartCustomizationPanelProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const hasAxes = !["pie", "doughnut"].includes(chartType);

  const update = <K extends keyof ChartCustomization>(key: K, value: ChartCustomization[K]) =>
    onChange({ ...customization, [key]: value });

  const applyPreset = (name: string) => {
    const preset = PRESETS[name];
    const extended = Array.from({ length: Math.max(datasetCount, preset.length) }, (_, i) =>
      preset[i % preset.length]
    );
    onChange({ ...customization, colorPalette: extended });
  };

  const setDatasetColor = (i: number, color: string) => {
    const next = [...customization.colorPalette];
    while (next.length <= i) next.push("#6366f1");
    next[i] = color;
    update("colorPalette", next);
  };

  return (
    <div className="w-full mb-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
      >
        <span>{t("chart_settings")}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          {/* Grafik Başlığı */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t("chart_title_label")}
            </label>
            <input
              type="text"
              value={customization.title}
              onChange={e => update("title", e.target.value)}
              className="w-full px-2 py-1.5 text-sm border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          {/* X / Y Eksen etiketleri */}
          {hasAxes && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t("x_label")}
                </label>
                <input
                  type="text"
                  value={customization.xLabel}
                  onChange={e => update("xLabel", e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t("y_label")}
                </label>
                <input
                  type="text"
                  value={customization.yLabel}
                  onChange={e => update("yLabel", e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            </>
          )}

          {/* Renk Paletleri */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t("color_palette")}
            </label>
            <div className="flex gap-2 flex-wrap mb-3">
              {Object.entries(PRESETS).map(([name, colors]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => applyPreset(name)}
                  title={t(`palette_${name}`)}
                  className="flex gap-0.5 rounded overflow-hidden border border-gray-200 dark:border-gray-600 hover:scale-110 transition"
                >
                  {colors.slice(0, 4).map((c, i) => (
                    <span key={i} style={{ backgroundColor: c }} className="w-4 h-5 block" />
                  ))}
                </button>
              ))}
            </div>
            <div className="flex gap-3 flex-wrap">
              {Array.from({ length: datasetCount }).map((_, i) => (
                <label key={i} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <input
                    type="color"
                    value={customization.colorPalette[i] ?? "#6366f1"}
                    onChange={e => setDatasetColor(i, e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0"
                  />
                  {t("dataset_color", { n: i + 1 })}
                </label>
              ))}
            </div>
          </div>

          {/* Toggle'lar */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={customization.showLegend}
                onChange={e => update("showLegend", e.target.checked)}
                className="rounded text-indigo-600"
              />
              {t("show_legend")}
            </label>
            {hasAxes && (
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customization.showGrid}
                  onChange={e => update("showGrid", e.target.checked)}
                  className="rounded text-indigo-600"
                />
                {t("show_grid")}
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
