import { IPmdData } from "../files/fileManipulations";
import { StatisticsPCA } from "../GlobalTypes";
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
  if (mode === 'pca0') anchored = true;
  if (mode === 'gc') anchored = true;
  if (mode === 'gcn') {
    anchored = true;
    normalized = true;
  };

  const res: StatisticsPCA = {
    mode, 
    ...calculatePCA(selectedSteps, anchored, normalized, 'directions')
  }
  
  return res;
};

export default calculateStatisticsPMD;