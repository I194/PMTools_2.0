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
  reversedDirectionsIDs: Array<number>,
) => {

  const selectedDirections = data.interpretations.filter(
    (direction, index) => selectedDirectionsIDs.includes(index + 1)
  ).map((direction, index) => {
    const { id, Dgeo, Igeo, Dstrat, Istrat } = direction;
    let geoDirection = new Direction(Dgeo, Igeo, 1);
    let stratDirection = new Direction(Dstrat, Istrat, 1);
    if (reversedDirectionsIDs.includes(id)) {
      geoDirection = geoDirection.reversePolarity();
      stratDirection = stratDirection.reversePolarity();
    };
    const DgeoFinal = +geoDirection.declination.toFixed(1);
    const IgeoFinal = +geoDirection.inclination.toFixed(1);
    const DstratFinal = +stratDirection.declination.toFixed(1);
    const IstratFinal = +stratDirection.inclination.toFixed(1);
    return {...direction, Dgeo: DgeoFinal, Igeo: IgeoFinal, Dstrat: DstratFinal, Istrat: IstratFinal};
  });

  let meanByMode = {
    geographic: {direction: new Direction(0, 0, 0), MAD: 0}, 
    stratigraphic: {direction: new Direction(0, 0, 0), MAD: 0}
  };

  if (mode === 'gc') meanByMode = calculatePCA_dir(selectedDirections);
  if (mode === 'fisher') meanByMode = calculateFisherMean(selectedDirections);
  if (mode === 'mcFad') meanByMode = calculateMcFaddenMean(selectedDirections);

  const rawStatistics: RawStatisticsDIR = {
    code: mode, 
    mean: meanByMode
  };

  const interpretation = rawStatisticsDIRToInterpretation(rawStatistics, selectedDirections, data.name, mode);
  
  return {rawStatistics, interpretation};
};

export default calculateStatisticsDIR;