import { IDirData, IPmdData } from '../GlobalTypes';

export interface InvalidFieldInfo {
  field: string;
  rawValue: string;
}

export interface InvalidRowInfo {
  rowNumber: number;
  fileName: string;
  invalidFields: InvalidFieldInfo[];
}

// Non-blocking parser warning. Used when a parser successfully reads a file but
// detects something the user should know about (e.g. ambiguous demagnetization
// type). UI consumers (Phase 2 work) display these as toast/snackbar
// notifications without blocking file load.
export interface ParseWarning {
  code: string;
  message: string;
}

export interface ValidationResult {
  invalidRows: InvalidRowInfo[];
  warnings?: ParseWarning[];
}

export interface ParseResult<T> {
  data: T;
  validation: ValidationResult;
}

export type DirectionalParseResult = ParseResult<IPmdData> | ParseResult<IDirData>;

export interface FileValidationIssue {
  fileName: string;
  invalidRows: InvalidRowInfo[];
  totalRows: number;
  validRows: number;
  exampleValidRow?: string;
}
