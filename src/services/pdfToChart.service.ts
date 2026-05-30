import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type { ChartType } from "../model/ChartTemplate";
import type { AppChartData } from "../types/chart";
import { DEFAULT_COLORS } from "../types/chart";
import { ChartParseError } from "../errors/ChartParseError";
import { extractTextItems } from "./pdfParser/extractTextItems";
import { detectColumns } from "./pdfParser/detectColumns";
import { detectRows } from "./pdfParser/detectRows";
import { buildTable } from "./pdfParser/buildTable";
import { detectTableBoundaries } from "./pdfParser/detectTableBoundaries";

GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

export async function parsePdfToChartData(
  file: File,
  chartType: ChartType,
  tableIndex = 0
): Promise<AppChartData> {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: buffer }).promise;

  const items = await extractTextItems(pdf);
  if (!items.length) throw new ChartParseError("NO_TABLE_FOUND");

  const colBoundaries = detectColumns(items);
  const rowBoundaries = detectRows(items);

  if (!colBoundaries.length || !rowBoundaries.length) {
    throw new ChartParseError("NO_TABLE_FOUND");
  }

  const fullTable = buildTable(items, colBoundaries, rowBoundaries);
  const avgRowHeight = rowBoundaries.length > 1
    ? (rowBoundaries[rowBoundaries.length - 1] - rowBoundaries[0]) / rowBoundaries.length
    : 20;

  const tables = detectTableBoundaries(fullTable, rowBoundaries, avgRowHeight);
  if (!tables.length) throw new ChartParseError("NO_TABLE_FOUND");

  const target = tables[Math.min(tableIndex, tables.length - 1)];
  const rawTable = target.data.filter(r => r.some(c => c.trim()));
  if (rawTable.length < 1) throw new ChartParseError("NO_TABLE_FOUND");

  // Detect header row: first row with mostly non-numeric values
  const firstRow = rawTable[0];
  const nonNumericCount = firstRow.filter(c => isNaN(Number(c)) || c.trim() === "").length;
  let headers: string[];
  let dataRows: string[][];

  if (nonNumericCount >= firstRow.length / 2) {
    headers = firstRow;
    dataRows = rawTable.slice(1);
  } else {
    headers = firstRow.map((_, i) => `Column ${i + 1}`);
    dataRows = rawTable;
  }

  if (!dataRows.length) throw new ChartParseError("NO_TABLE_FOUND");

  if (chartType === "scatter") {
    return {
      labels: [],
      datasets: [{
        label: headers[1] || "Value",
        data: dataRows.map(r => ({ x: Number(r[0]) || 0, y: Number(r[1]) || 0 })),
        backgroundColor: DEFAULT_COLORS[0],
      }],
    };
  }

  const labelCol = dataRows.map((r, i) => r[0] ?? `Label${i + 1}`);

  // Multi-dataset: each column beyond the first = one dataset
  const valueColCount = headers.length - 1;
  if (valueColCount <= 0) throw new ChartParseError("MISSING_COLUMNS");

  if (valueColCount === 1) {
    return {
      labels: labelCol,
      datasets: [{
        label: headers[1] || "Value",
        data: dataRows.map(r => Number(r[1]) || 0),
        backgroundColor: DEFAULT_COLORS[0],
      }],
    };
  }

  return {
    labels: labelCol,
    datasets: Array.from({ length: valueColCount }, (_, i) => ({
      label: headers[i + 1] || `Dataset ${i + 1}`,
      data: dataRows.map(r => Number(r[i + 1]) || 0),
      backgroundColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      borderColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    })),
  };
}

export async function detectPdfTables(file: File) {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: buffer }).promise;
  const items = await extractTextItems(pdf);
  if (!items.length) return { tables: [], pdf };

  const colBoundaries = detectColumns(items);
  const rowBoundaries = detectRows(items);
  const fullTable = buildTable(items, colBoundaries, rowBoundaries);
  const avgRowHeight = rowBoundaries.length > 1
    ? (rowBoundaries[rowBoundaries.length - 1] - rowBoundaries[0]) / rowBoundaries.length
    : 20;
  const tables = detectTableBoundaries(fullTable, rowBoundaries, avgRowHeight);
  return { tables, pdf };
}
