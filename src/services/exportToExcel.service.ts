import ExcelJS from "exceljs";
import type { AppChartData } from "../types/chart";
import type { ChartCustomization } from "../types/chart";

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function exportChartToExcel(
  chartData: AppChartData,
  customization: ChartCustomization,
  chartCanvas: HTMLCanvasElement | null,
  filename?: string
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "ChartMaker";
  wb.created = new Date();

  const labels = (chartData.labels ?? []).map(String);

  // Sheet 1: Chart Data
  const ws1 = wb.addWorksheet("Chart Data");
  const headers = ["Label", ...chartData.datasets.map((ds) => String(ds.label ?? ""))];
  const headerRow = ws1.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6366F1" } };
    cell.alignment = { horizontal: "center" };
  });
  labels.forEach((label, i) => {
    ws1.addRow([label, ...chartData.datasets.map((ds) => (ds.data as number[])[i] ?? "")]);
  });
  ws1.columns.forEach((col) => { col.width = 18; });

  // Sheet 2: Chart Image
  if (chartCanvas) {
    const ws2 = wb.addWorksheet("Chart");
    let rowOffset = 0;
    if (customization.title) {
      const titleRow = ws2.addRow([customization.title]);
      titleRow.getCell(1).font = { bold: true, size: 14, color: { argb: "FF6366F1" } };
      ws2.addRow([]);
      rowOffset = 2;
    }
    const base64 = chartCanvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
    const imageId = wb.addImage({ base64, extension: "png" });
    ws2.addImage(imageId, {
      tl: { col: 0.5, row: rowOffset + 0.5 },
      ext: { width: 700, height: 400 },
    });
  }

  // Sheet 3: Summary
  const ws3 = wb.addWorksheet("Summary");
  const now = new Date().toLocaleString("tr-TR");
  [
    ["Başlık", customization.title || "(belirtilmedi)"],
    ["Dataset Sayısı", chartData.datasets.length],
    ["Satır Sayısı", labels.length],
    ["Oluşturma Tarihi", now],
    ["Uygulama", "ChartMaker"],
  ].forEach(([key, val]) => {
    ws3.addRow([key, val]).getCell(1).font = { bold: true };
  });
  ws3.getColumn(1).width = 20;
  ws3.getColumn(2).width = 30;

  // İndir
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename || (customization.title ? slug(customization.title) : `chartmaker-${Date.now()}`)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
