import { IPmdData } from "../files/fileManipulations";
import { StatisticsModePCA } from "../graphs/types";
import calculatePCA from "./pca/calculatePCA";
import calculatePCA0 from "./pca/calculatePCA0";
import calculateGC from "./gc/calculateGC";
import calculateGCN from "./gc/calculateGCN";


const calculateStatisticsPMD = (
  data: IPmdData,
  mode: StatisticsModePCA, 
  selectedStepsIDs: Array<number>, 
) => {
  if (mode === 'pca') return calculatePCA();
  if (mode === 'pca0') return calculatePCA0();
  if (mode === 'gc') return calculateGC();
  if (mode === 'gcn') return calculateGCN();
};

export default calculateStatisticsPMD;