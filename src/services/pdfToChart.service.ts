import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type { ChartType } from "../model/ChartTemplate";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

export async function parsePdfToChartData(file: File, chartType: ChartType): Promise<any> {
    const buffer = await file.arrayBuffer();
    const pdf: PDFDocumentProxy = await getDocument({ data: buffer }).promise;
    let rows: string[][] = [];

    // 1. PDF'i satırlara ayır
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        let lastY: number | null = null;
        let row: string[] = [];
        for (const item of content.items as any[]) {
            const str = item.str.trim();
            if (!str) continue;
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 2) {
                if (row.length) rows.push(row);
                row = [];
            }
            row.push(str);
            lastY = item.transform[5];
        }
        if (row.length) rows.push(row);
    }

    // 2. Tabloya benzer satırları filtrele
    // En az iki hücreden oluşan ve hepsi boş olmayan satırlar
    const tableRows = rows.filter(r => r.length >= 2 && r.some(cell => cell));
    if (tableRows.length < 1) throw new Error("PDF'de tablo bulunamadı.");

    // 3. Başlığı otomatik tespit et: ilk satırda sayısal olmayan değer fazla ise başlıktır
    let headers: string[];
    let dataRows: string[][];
    const firstRow = tableRows[0];
    const nonNumericCount = firstRow.filter(cell => isNaN(Number(cell))).length;
    if (nonNumericCount >= firstRow.length / 2) {
        headers = firstRow;
        dataRows = tableRows.slice(1);
    } else {
        // Başlık yoksa otomatik üret
        headers = firstRow.map((_, i) => `Column ${i + 1}`);
        dataRows = tableRows;
    }

    // 4. Chart type'a göre veriyi dönüştür
    if (["bar", "line", "pie", "doughnut", "area"].includes(chartType)) {
        // İlk sütun: label, ikinci sütun: value
        return {
            labels: dataRows.map(r => r[0] ?? `Label${Math.random()}`),
            datasets: [{
                label: headers[1] || "Value",
                data: dataRows.map(r => Number(r[1])),
                backgroundColor: "#16a34a"
            }]
        };
    }
    if (chartType === "scatter") {
        // İlk sütun X, ikinci sütun Y
        return {
            labels: [],
            datasets: [{
                label: headers[1] || "Value",
                data: dataRows.map(r => ({ x: Number(r[0]), y: Number(r[1]) })),
                backgroundColor: "#16a34a"
            }]
        };
    }

    throw new Error("Desteklenmeyen grafik tipi!");
}
