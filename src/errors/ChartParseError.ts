export type ChartParseErrorCode =
  | "EMPTY_FILE"
  | "MISSING_COLUMNS"
  | "CORRUPT_FILE"
  | "UNSUPPORTED_TYPE"
  | "NO_TABLE_FOUND";

export class ChartParseError extends Error {
  constructor(public code: ChartParseErrorCode) {
    super(code);
    this.name = "ChartParseError";
  }
}
