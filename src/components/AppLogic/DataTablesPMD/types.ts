import { GridColDef } from "@mui/x-data-grid";
import { DataGridDIRFromPCARow, DataGridPMDRow, IPmdData, StatisitcsInterpretationFromPCA } from "../../../utils/GlobalTypes";

export interface IDataTablePMD {
  data: IPmdData | null;
};

export interface IMetaDataTablePMD {
  data: IPmdData['metadata'] | null | undefined;
};

export interface IStatisticsDataTablePMD {
  currentFileInterpretations: Array<StatisitcsInterpretationFromPCA> | null;
};

export type PMDDataTableColumns = readonly GridColDef<DataGridPMDRow>[]

export type MetaDataTableColumns = readonly GridColDef<{
  id: number;
  isRowSelectable: boolean;
  name?: string | undefined;
  a?: number | undefined;
  b?: number | undefined;
  s?: number | undefined;
  d?: number | undefined;
  v?: number | undefined;
}>[]

export type StatisticsDataTableRow = Omit<DataGridDIRFromPCARow, 'uuid'>;

export type StatisticsDataTableColumns = readonly GridColDef<StatisticsDataTableRow>[];