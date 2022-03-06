import { IMagGraph } from "../components/Graph/MagGraph/MagGraph";
import { IStereoGraph } from "../components/Graph/StereoGraph/StereoGraph";
import { IZijdGraph } from "../components/Graph/ZijdGraph/ZijdGraph";
import Coordinates from "./graphs/classes/Coordinates";
import { StatisticsModeDIR, StatisticsModePCA } from "./graphs/types";

export interface IGraph {
  graphId: string;
  width: number;
  height: number;
};

export type PMDGraph = React.FC<IZijdGraph> | React.FC<IStereoGraph> | React.FC<IMagGraph>;

interface IObjectKeys {
  [key: string | number | symbol]: any;
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
  steps: {
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
    demagType: 'thermal' | 'alternating field' | undefined;
  }[];
  format: string;
  created: string;
}

export interface IDirData extends IObjectKeys {
  name: string;
  interpretations: {
    id: string;
    code: string;
    stepRange: string;
    stepCount: number;
    Dgeo: number;
    Igeo: number;
    Dstrat: number;
    Istrat: number;
    mad: number;
    k: number;
    comment: string;
    demagType: 'thermal' | 'alternating field' | undefined;
  }[];
  format: string;
  created: string;
}

export type StatisitcsInterpretation = {
  id: string;
  code: StatisticsModePCA | StatisticsModeDIR;
  stepRange: string;
  stepCount: number;
  Dgeo: number;
  Igeo: number;
  Dstrat: number;
  Istrat: number;
  confidenceRadius: number; // MAD for PCA and a95 for DIR
  k?: number; // not exist for MAD as a confidene value
  comment: string;
  demagType: 'thermal' | 'alternating field' | undefined;
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

export type DataGridPMDRow = {
  id: number;
  step: string;
  Dgeo: number;
  Igeo: number;
  Dstrat: number;
  Istrat: number;
  mag: string;
  a95: number;
  comment: string;
};

export type DataGridDIRRow = Omit<StatisitcsInterpretation, 'demagType'>

export type ThemeMode = 'dark' | 'light';