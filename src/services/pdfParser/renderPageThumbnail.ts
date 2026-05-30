import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

export interface PageThumbnail {
  dataUrl: string;
  width: number;
  height: number;
  pdfWidth: number;
  pdfHeight: number;
}

export async function renderPageThumbnail(
  pdf: PDFDocumentProxy,
  pageIndex: number,
  scale = 0.3
): Promise<PageThumbnail> {
  const page = await pdf.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport }).promise;
  const unscaled = page.getViewport({ scale: 1 });
  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.7),
    width: viewport.width,
    height: viewport.height,
    pdfWidth: unscaled.width,
    pdfHeight: unscaled.height,
  };
}
