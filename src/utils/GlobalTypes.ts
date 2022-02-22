import { IMagGraph } from "../components/Graph/MagGraph/MagGraph";
import { IStereoGraph } from "../components/Graph/StereoGraph/StereoGraph";
import { IZijdGraph } from "../components/Graph/ZijdGraph/ZijdGraph";

export interface IGraph {
  graphId: string;
};

export type PMDGraph = React.FC<IZijdGraph> | React.FC<IStereoGraph> | React.FC<IMagGraph>;