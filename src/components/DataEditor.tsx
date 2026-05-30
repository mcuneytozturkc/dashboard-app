import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { RawChartData } from "../types/chart";
import { DEFAULT_COLORS } from "../types/chart";

interface DataEditorProps {
  rawData: RawChartData;
  chartType: string;
  onConfirm: (data: RawChartData) => void;
  onCancel: () => void;
}

function isValidNumber(v: string): boolean {
  return v.trim() !== "" && !isNaN(Number(v));
}

export default function DataEditor({ rawData, chartType, onConfirm, onCancel }: DataEditorProps) {
  const { t } = useTranslation();
  const isScatter = chartType === "scatter";

  const [labels, setLabels] = useState<string[]>(rawData.labels);
  const [datasets, setDatasets] = useState(rawData.datasets.map(ds => ({ ...ds, data: [...ds.data] })));

  useEffect(() => {
    setLabels(rawData.labels);
    setDatasets(rawData.datasets.map(ds => ({ ...ds, data: [...ds.data] })));
  }, [rawData]);

  const rowCount = isScatter
    ? Math.max(...datasets.map(ds => ds.data.length))
    : labels.length;

  const hasInvalid = datasets.some(ds => ds.data.some(v => !isValidNumber(String(v))));

  const addRow = () => {
    if (!isScatter) setLabels(l => [...l, `Label ${l.length + 1}`]);
    setDatasets(ds => ds.map(d => ({ ...d, data: [...d.data, 0] })));
  };

  const deleteRow = (i: number) => {
    if (!isScatter) setLabels(l => l.filter((_, j) => j !== i));
    setDatasets(ds => ds.map(d => ({ ...d, data: d.data.filter((_, j) => j !== i) })));
  };

  const addDataset = () => {
    const color = DEFAULT_COLORS[datasets.length % DEFAULT_COLORS.length];
    const newDs = {
      label: `Dataset ${datasets.length + 1}`,
      data: Array(rowCount).fill(0) as number[],
      color,
    };
    setDatasets(ds => [...ds, newDs]);
  };

  const deleteDataset = (i: number) => {
    if (datasets.length <= 1) return;
    setDatasets(ds => ds.filter((_, j) => j !== i));
  };

  const renameDataset = (i: number, label: string) => {
    setDatasets(ds => ds.map((d, j) => j === i ? { ...d, label } : d));
  };

  const setCell = (dsIdx: number, rowIdx: number, value: string) => {
    setDatasets(ds => ds.map((d, i) => {
      if (i !== dsIdx) return d;
      const next = [...d.data];
      next[rowIdx] = Number(value);
      return { ...d, data: next };
    }));
  };

  const handleConfirm = () => {
    if (hasInvalid) return;
    onConfirm({ labels, datasets });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("edit_data")}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-auto flex-1 p-4">
          {rowCount > 200 && (
            <div className="mb-3 px-3 py-2 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 text-sm text-yellow-700 dark:text-yellow-300">
              {t("row_count_warning")}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-2 py-1.5 text-left font-medium text-gray-500 dark:text-gray-400 w-8">#</th>
                  {!isScatter && (
                    <th className="px-2 py-1.5 text-left font-medium text-gray-500 dark:text-gray-400">
                      Label
                    </th>
                  )}
                  {datasets.map((ds, i) => (
                    <th key={i} className="px-2 py-1.5 min-w-[120px]">
                      <div className="flex items-center gap-1">
                        <input
                          value={ds.label}
                          onChange={e => renameDataset(i, e.target.value)}
                          className="w-full px-1 py-0.5 text-xs font-medium border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded bg-transparent text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-400"
                        />
                        {datasets.length > 1 && (
                          <button
                            onClick={() => deleteDataset(i)}
                            className="text-red-400 hover:text-red-600 shrink-0"
                            title={t("delete_dataset")}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rowCount }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-2 py-1 text-gray-400 text-xs">{rowIdx + 1}</td>
                    {!isScatter && (
                      <td className="px-2 py-1">
                        <input
                          value={labels[rowIdx] ?? ""}
                          onChange={e => setLabels(l => l.map((v, i) => i === rowIdx ? e.target.value : v))}
                          className="w-full px-1 py-0.5 text-sm border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-400"
                        />
                      </td>
                    )}
                    {datasets.map((ds, dsIdx) => {
                      const val = ds.data[rowIdx];
                      const invalid = !isValidNumber(String(val ?? ""));
                      return (
                        <td key={dsIdx} className="px-2 py-1">
                          <input
                            value={val ?? ""}
                            onChange={e => setCell(dsIdx, rowIdx, e.target.value)}
                            className={`w-full px-1 py-0.5 text-sm border rounded bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-400 ${
                              invalid
                                ? "border-red-400 dark:border-red-500"
                                : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                          />
                        </td>
                      );
                    })}
                    <td className="px-1 py-1 text-center">
                      <button
                        onClick={() => deleteRow(rowIdx)}
                        className="text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400"
                        title={t("delete_row")}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasInvalid && (
            <p className="mt-2 text-xs text-red-500 dark:text-red-400">{t("invalid_number_warning")}</p>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 gap-3 flex-wrap">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addRow}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              + {t("add_row")}
            </button>
            <button
              type="button"
              onClick={addDataset}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              + {t("add_dataset")}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={hasInvalid}
              className="px-4 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("confirm_chart")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
