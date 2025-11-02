import { GridColDef } from "@mui/x-data-grid";
import { DataGridDIRFromDIRRow, IDirData, StatisitcsInterpretationFromDIR } from "../../../utils/GlobalTypes";

export interface IDataTableDIR {
  data: IDirData | null;
};

export interface IStatisticsDataTableDIR {
  currentFileInterpretations: Array<StatisitcsInterpretationFromDIR> | null;
};

export type DIRDataTableColumns = readonly GridColDef<DataGridDIRFromDIRRow>[];

export type StatisticsDataTableRow = Omit<DataGridDIRFromDIRRow, "id"> & {id: string};

export type StatisticsDataTableColumns = readonly GridColDef<StatisticsDataTableRow>[];

export type SiteRow = {
  id: number;
  label: string;
  index: number | string;
  lat: number;
  lon: number;
  age: number;
  plateId: number;
};

export type SiteDataTableColumns = readonly GridColDef<SiteRow>[];

export type VGPRow = {
  id: number;
  index: number | string;
  poleLatitude: number,
  poleLongitude?: number,
  poleLongitudeW?: number,
  poleLongitudeE?: number,
  paleoLatitude: number,
  dp: number,
  dm: number,
  sLat: number,
  sLon: number,
  age: number,
  plateId: number,
};

export type VGPDataTableColumns = readonly GridColDef<VGPRow>[];

export type AnyColumns = readonly GridColDef<any>[];
