import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { detectPdfTables } from "../services/pdfToChart.service";
import { renderPageThumbnail } from "../services/pdfParser/renderPageThumbnail";
import type { TableBoundary } from "../services/pdfParser/types";
import type { PageThumbnail } from "../services/pdfParser/renderPageThumbnail";

interface PdfTableSelectorProps {
  pdfFile: File;
  onSelect: (tableIndex: number) => void;
  onCancel: () => void;
}

export default function PdfTableSelector({ pdfFile, onSelect, onCancel }: PdfTableSelectorProps) {
  const { t } = useTranslation();
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [tables, setTables] = useState<TableBoundary[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { tables: detected, pdf } = await detectPdfTables(pdfFile);
        if (cancelled) return;
        setTables(detected);

        const thumbs: PageThumbnail[] = [];
        for (let i = 0; i < pdf.numPages; i++) {
          const thumb = await renderPageThumbnail(pdf, i, 0.3);
          if (cancelled) return;
          thumbs.push(thumb);
        }
        setThumbnails(thumbs);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pdfFile]);

  const handleConfirm = () => {
    if (selected !== null) onSelect(selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("select_table")}</h2>
            {!loading && (
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {t("table_found", { count: tables.length })}
              </p>
            )}
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-auto flex-1 p-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse h-40" />
              ))}
            </div>
          ) : thumbnails.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{t("errors.NO_TABLE_FOUND")}</p>
          ) : (
            <div>
              {tables.length > 0 ? (
                <div className="space-y-3">
                  {tables.map((table, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelected(i)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition ${
                        selected === i
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 bg-white dark:bg-gray-800"
                      }`}
                    >
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {t("select_table")} {i + 1}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {table.rowCount} {t("rows")} × {table.colCount} {t("columns")}
                      </p>
                      {table.data.slice(0, 2).map((row, ri) => (
                        <p key={ri} className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                          {row.filter(c => c).join(" | ")}
                        </p>
                      ))}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {thumbnails.map((thumb, i) => (
                    <div key={i} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img src={thumb.dataUrl} alt={t("page_n", { n: i + 1 })} className="w-full" />
                      <p className="text-xs text-center py-1 text-gray-400">{t("page_n", { n: i + 1 })}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
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
            disabled={selected === null && tables.length > 1}
            className="px-4 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("use_this_table")}
          </button>
        </div>
      </div>
    </div>
  );
}
