import { IPmdData } from "../GlobalTypes";
import { RawStatisticsPCA } from "../GlobalTypes";
import { StatisticsModePCA } from "../graphs/types";
import calculatePCA_pmd from "./calculation/calculatePCA_pmd";
import rawStatisticsPMDToInterpretation from "./formtatters/rawStatisticsPMDToInterpretation";

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
    ...calculatePCA_pmd(selectedSteps, anchored, normalized, type)
  };

  const interpretation = rawStatisticsPMDToInterpretation(rawStatistics, selectedSteps, data.metadata, mode);
  
  return {rawStatistics, interpretation};
};

export default calculateStatisticsPMD;