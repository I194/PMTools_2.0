import { IPmdData } from "../files/fileManipulations";
import { RawStatisticsPCA } from "../GlobalTypes";
import { StatisticsModePCA } from "../graphs/types";
import calculatePCA from "./calculatePCA";
import rawStatisticsToInterpretation from "./formtatters/rawStatisticsToInterpretation";

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

  const rawStatistics: RawStatisticsPCA = {
    code: mode, 
    ...calculatePCA(selectedSteps, anchored, normalized, type)
  };

  const interpretation = rawStatisticsToInterpretation(rawStatistics, selectedSteps, data.metadata, mode);
  
  return {rawStatistics, interpretation};
};

export default calculateStatisticsPMD;