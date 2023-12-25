import { IZijdGraph, IStereoGraph, IMagGraph } from "../components/AppGraphs/";
import Coordinates from "./graphs/classes/Coordinates";
import Direction from "./graphs/classes/Direction";
import { StatisticsModeDIR, StatisticsModePCA } from "./graphs/types";

export interface IGraph {
  graphId: GraphType;
  width: number;
  height: number;
}

export type PMDGraph =
  | React.FC<IZijdGraph>
  | React.FC<IStereoGraph>
  | React.FC<IMagGraph>;

interface IObjectKeys {
  [key: string | number | symbol]: any;
}

export type PMDStep = {
  readonly id: number;
  step: string;
  x: number;
  y: number;
  z: number;
  mag: number;
  Dgeo: number;
  Igeo: number;
  Dstrat: number;
  Istrat: number;
  a95: number;
  comment: string;
  demagType: "thermal" | "alternating field" | undefined;
};

export type SiteVGPData = {
  lat: number;
  lon: number;
  age: number;
  plateId: number;
};

export interface ISitesData extends IObjectKeys {
  data: Array<SiteVGPData>;
  format: string;
  created: string;
}

export interface IPmdData extends IObjectKeys {
  metadata: {
    name: string;
    a: number; // core azimuth
    b: number; // core dip
    s: number; // bedding strike
    d: number; // bedding dip
    v: number; // volume
  };
  steps: Array<PMDStep>;
  format: string;
  created: string;
}

export interface IDirData extends IObjectKeys {
  name: string;
  interpretations: {
    readonly id: number;
    label: string;
    code: string;
    gcNormal?: boolean;
    stepRange: string;
    stepCount: number;
    Dgeo: number;
    Igeo: number;
    Dstrat: number;
    Istrat: number;
    MADgeo: number;
    Kgeo: number;
    MADstrat: number;
    Kstrat: number;
    comment: string;
    demagType: "thermal" | "alternating field" | undefined;
  }[];
  format: string;
  created: string;
}

export type VGPData = {
  readonly id: number;
  label: string;
  dec: number;
  inc: number;
  a95: number;
  lat: number;
  lon: number;
  poleLatitude: number;
  poleLongitude: number;
  paleoLatitude: number;
  dp: number;
  dm: number;
  age: number;
  plateId: number;
}[];

export interface IVGPData extends IObjectKeys {
  name: string;
  vgps: VGPData;
  format: string;
  created: string;
}

export type StatisitcsInterpretationFromPCA = {
  readonly uuid: string;
  parentFile: string;
  label: string;
  code: StatisticsModePCA;
  steps: Array<PMDStep>;
  stepRange: string;
  stepCount: number;
  Dgeo: number;
  Igeo: number;
  Dstrat: number;
  Istrat: number;
  confidenceRadius: number; // MAD for PCA
  accuracy?: number; // the same as K (kappa), but in most cases of PCA calculation accuracy is not defined
  comment: string;
  demagType: "thermal" | "alternating field" | undefined;
  rawData: RawStatisticsPCA;
};

export type StatisitcsInterpretationFromDIR = {
  readonly uuid: string;
  parentFile: string;
  label: string;
  code: StatisticsModeDIR;
  directions: IDirData["interpretations"];
  stepRange: string;
  stepCount: number;
  Dgeo: number;
  Igeo: number;
  Dstrat: number;
  Istrat: number;
  confidenceRadiusGeo: number; // MAD for PCA and a95 for Fisher
  Kgeo?: number; // not exist for MAD as a confidene value
  confidenceRadiusStrat: number; // MAD for PCA and a95 for Fisher
  Kstrat?: number; // not exist for MAD as a confidene value
  comment: string;
  demagType: "thermal" | "alternating field" | undefined;
  rawData: RawStatisticsDIR;
};

export type RawStatisticsPCA = {
  component: {
    edges: Coordinates;
    centerMass: Coordinates;
  };
  code: StatisticsModePCA;
  intensity: number;
  MAD: number;
};

export type RawStatisticsDIR = {
  code: StatisticsModeDIR;
  mean: {
    geographic: MeanDir;
    stratigraphic: MeanDir;
  };
};

export type MeanDir = {
  direction: Direction;
  MAD: number;
  k?: number;
  R?: number;
  N?: number;
  csd?: number;
};

export type FoldTestResult = {
  untilts: Array<number>;
  savedBootstraps: Array<Array<{ x: number; y: number }>>;
};

export type CoordsComparison = {
  first: Array<number>;
  second: Array<number>;
};

export type CommonMeanTestBootstrapResult = {
  x: CoordsComparison;
  y: CoordsComparison;
  z: CoordsComparison;
};

export type ReversalTestClassicResult = {
  gamma: number;
  gammaCritical: number;
  classification: "A" | "B" | "C" | "N/A" | "-";
};

export type ReversalTestResultAll = {
  bootstrap?: CommonMeanTestBootstrapResult;
  classic?: ReversalTestClassicResult;
  oldFashioned?: ReversalTestClassicResult;
};

export type ConglomeratesTestResult = {
  N: number;
  R: number;
  Ro_95: number;
  Ro_99: number;
  resultDescription: {
    ru: string;
    en: string;
  };
} | null;

export type DataGridPMDRow = {
  id: number;
  step: string;
  Dgeo: string;
  Igeo: string;
  Dstrat: string;
  Istrat: string;
  mag: string;
  a95: string;
  comment: string;
};

export type DataGridDIRFromPCARow = Omit<
  StatisitcsInterpretationFromPCA,
  "demagType" | "parentFile" | "rawData" | "steps"
> & { readonly id: number };
export type DataGridDIRFromDIRRow = Omit<
  StatisitcsInterpretationFromDIR,
  "demagType" | "parentFile" | "rawData" | "directions" | "uuid"
> & { readonly id: number };

export type ThemeMode = "dark" | "light";

export type HotkeysType = Array<{
  id: number;
  title: string;
  hotkeys: Array<{
    id: number;
    label: string;
    disabled?: boolean;
    hotkey: {
      key: string;
      code: string;
    };
  }>;
}>;

export enum GraphPMD {
  zijd,
  stereo,
  remagnetization,
}

export interface Cutoff {
  enabled: boolean;
  setEnableCutoff: React.Dispatch<React.SetStateAction<boolean>>;
  borderCircle?: {
    show: boolean;
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    angle: number; // degrees
  };
  outerDots?: {
    show: boolean;
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
  };
}

export type GraphType =
  | BasicGraphType
  | BasicGraphExportType
  | PMTestsGraphType;
export type BasicGraphType =
  | "zijd"
  | "stereo"
  | "mag"
  | "stereoDir"
  | "stereoVGP";
export type BasicGraphExportType =
  | "export_zijd"
  | "export_stereo"
  | "export_mag"
  | "export_stereoDir"
  | "export_stereoVGP";
export type PMTestsGraphType = "foldTest" | "reversalTest";

export type ContentType = GraphType | 'statisticsDataTable';
