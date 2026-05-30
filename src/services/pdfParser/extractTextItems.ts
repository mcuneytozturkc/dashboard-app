import type { PDFDocumentProxy, TextItem } from "pdfjs-dist/types/src/display/api";
import type { TextItemData } from "./types";

export async function extractTextItems(pdf: PDFDocumentProxy): Promise<TextItemData[]> {
  const all: TextItemData[] = [];
  let yOffset = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const pageHeight = viewport.height;
    const content = await page.getTextContent();

    for (const item of content.items) {
      if (!("str" in item)) continue;
      const { str, transform, width } = item as TextItem;
      if (!str.trim()) continue;
      const x = transform[4];
      const y = pageHeight - transform[5]; // flip Y so top=0
      const fontSize = Math.abs(transform[0]) || 10;
      all.push({ str: str.trim(), x, y: y + yOffset, width, fontSize, pageIndex: i - 1, pageHeight });
    }
    yOffset += pageHeight;
  }
  return all;
}
