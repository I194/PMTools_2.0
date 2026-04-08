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

export interface ValidationResult {
  invalidRows: InvalidRowInfo[];
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
