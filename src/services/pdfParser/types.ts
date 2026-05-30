export interface TextItemData {
  str: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  pageIndex: number;
  pageHeight: number;
}

export interface TableBoundary {
  data: string[][];
  pageIndex: number;
  rowCount: number;
  colCount: number;
}
