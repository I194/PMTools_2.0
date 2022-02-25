import { IMagGraph } from "../components/Graph/MagGraph/MagGraph";
import { IStereoGraph } from "../components/Graph/StereoGraph/StereoGraph";
import { IZijdGraph } from "../components/Graph/ZijdGraph/ZijdGraph";

export interface IGraph {
  graphId: string;
  width: number;
  height: number;
};

export type PMDGraph = React.FC<IZijdGraph> | React.FC<IStereoGraph> | React.FC<IMagGraph>;

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

export type ThemeMode = 'dark' | 'light'