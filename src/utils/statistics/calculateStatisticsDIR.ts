import { IDirData, IPmdData, RawStatisticsDIR } from "../GlobalTypes";
import { RawStatisticsPCA } from "../GlobalTypes";
import Coordinates from "../graphs/classes/Coordinates";
import Direction from "../graphs/classes/Direction";
import { StatisticsModeDIR } from "../graphs/types";
import calculateFisherMean from "./calculation/calculateFisherMean";
import calculateMcFaddenMean from "./calculation/calculateMcFaddenCombineMean";
import calculatePCA_dir from "./calculation/calculatePCA_dir";
import rawStatisticsDIRToInterpretation from "./formtatters/rawStatisticsDIRToInterpretation";

const calculateStatisticsDIR = (
  data: IDirData,
  mode: StatisticsModeDIR, 
  selectedDirectionsIDs: Array<number>, 
) => {

  const selectedDirections = data.interpretations.filter(
    (direction, index) => selectedDirectionsIDs.includes(index + 1)
  );

  let meanByMode = {
    geographic: {direction: new Direction(0, 0, 0), MAD: 0}, 
    stratigraphic: {direction: new Direction(0, 0, 0), MAD: 0}
  };

  if (mode === 'gc') meanByMode = calculatePCA_dir(selectedDirections, false);
  if (mode === 'gcn') meanByMode = calculatePCA_dir(selectedDirections, true);
  if (mode === 'fisher') meanByMode = calculateFisherMean(selectedDirections);
  if (mode === 'mcFadden') meanByMode = calculateMcFaddenMean(selectedDirections);

  const rawStatistics: RawStatisticsDIR = {
    code: mode, 
    mean: meanByMode
  };

  const interpretation = rawStatisticsDIRToInterpretation(rawStatistics, selectedDirections, data.name, mode);
  
  return {rawStatistics, interpretation};
};

export default calculateStatisticsDIR;