import * as XLSX from "xlsx";
import type { ChartType } from "../model/ChartTemplate";
import type { AppChartData } from "../types/chart";
import { DEFAULT_COLORS } from "../types/chart";
import { ChartParseError } from "../errors/ChartParseError";

export async function parseExcelToChartData(
  file: File,
  chartType: ChartType
): Promise<AppChartData> {
  const tryParse = (readerType: "arraybuffer" | "binarystring"): Promise<AppChartData> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = e.target?.result;
        if (!data) { reject(new ChartParseError("EMPTY_FILE")); return; }

        try {
          const workbook = readerType === "arraybuffer"
            ? XLSX.read(data, { type: "array" })
            : XLSX.read(data, { type: "binary" });

          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

          if (!jsonData.length) { reject(new ChartParseError("EMPTY_FILE")); return; }

          const firstRow = jsonData[0];
          const keys = Object.keys(firstRow);

          // Scatter: needs X and Y columns
          if (chartType === "scatter") {
            const xKey = keys.find(k => k.toLowerCase() === "x");
            const yKey = keys.find(k => k.toLowerCase() === "y");
            if (!xKey || !yKey) { reject(new ChartParseError("MISSING_COLUMNS")); return; }
            resolve({
              labels: [],
              datasets: [{
                label: "Scatter Data",
                data: jsonData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey]) })),
                backgroundColor: DEFAULT_COLORS[0],
              }],
            });
            return;
          }

          // Classic Category + Value (single dataset)
          const catKey = keys.find(k => k.toLowerCase() === "category");
          const valKey = keys.find(k => k.toLowerCase() === "value");
          if (catKey && valKey) {
            resolve({
              labels: jsonData.map(row => String(row[catKey] ?? "")),
              datasets: [{
                label: "Excel Data",
                data: jsonData.map(row => Number(row[valKey])),
                backgroundColor: DEFAULT_COLORS[0],
              }],
            });
            return;
          }

          // Multi-dataset: first column = labels, remaining numeric columns = datasets
          const labelKey = keys[0];
          const valueKeys = keys.slice(1).filter(k =>
            jsonData.some(row => !isNaN(Number(row[k])))
          );
          if (!valueKeys.length) { reject(new ChartParseError("MISSING_COLUMNS")); return; }

          resolve({
            labels: jsonData.map(row => String(row[labelKey] ?? "")),
            datasets: valueKeys.map((k, i) => ({
              label: k,
              data: jsonData.map(row => Number(row[k])),
              backgroundColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
              borderColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
            })),
          });
        } catch {
          reject(new ChartParseError("CORRUPT_FILE"));
        }
      };

      reader.onerror = () => reject(new ChartParseError("CORRUPT_FILE"));
      if (readerType === "arraybuffer") {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });

  try {
    return await tryParse("arraybuffer");
  } catch {
    try {
      return await tryParse("binarystring");
    } catch (e2) {
      throw e2 instanceof ChartParseError ? e2 : new ChartParseError("CORRUPT_FILE");
    }
  }
}
