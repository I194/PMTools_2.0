import { IPmdData } from "../files/fileManipulations";
import { RawStatisticsPCA } from "../GlobalTypes";
import { StatisticsModePCA } from "../graphs/types";
import calculatePCA from "./calculatePCA";


const calculateStatisticsPMD = (
  data: IPmdData,
  mode: StatisticsModePCA, 
  selectedStepsIDs: Array<number>, 
) => {

  const selectedSteps = data.steps.filter((step, index) => selectedStepsIDs.includes(index + 1));

  let anchored = false;
  let normalized = false;
  let type: 'directions' | 'planes' = 'directions';
  
  if (mode === 'pca0') anchored = true;
  if (mode === 'gc') {
    anchored = true;
    type = 'planes';
  }
  if (mode === 'gcn') {
    anchored = true;
    normalized = true;
    type = 'planes';
  };

  const res: RawStatisticsPCA = {
    code: mode, 
    ...calculatePCA(selectedSteps, anchored, normalized, type)
  }
  
  return res;
};

export default calculateStatisticsPMD;