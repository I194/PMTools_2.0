import { IPmdData } from "../../files/fileManipulations";
import { RawStatisticsPCA, StatisitcsInterpretation } from "../../GlobalTypes";
import toReferenceCoordinates from "../../graphs/formatters/toReferenceCoordinates";
import { StatisticsModePCA } from "../../graphs/types";

const rawStatisticsToInterpretation = (
  statistics: RawStatisticsPCA, 
  selectedSteps: IPmdData['steps'],
  metadata: IPmdData['metadata'],
  code: StatisticsModePCA,
) => {

  const id: string = metadata.name;

  const stepRange: string = `
    ${selectedSteps[0].step}-${selectedSteps[selectedSteps.length - 1].step}
  `;
  const stepCount: number = selectedSteps.length;

  const [Dgeo, Igeo] = toReferenceCoordinates(
    'geographic', metadata, statistics.component.edges
  ).toDirection().toArray();
  
  const [Dstrat, Istrat] = toReferenceCoordinates(
    'stratigraphic', metadata, statistics.component.edges
  ).toDirection().toArray();

  const confidenceRadius = statistics.MAD;
  const comment = '';
  const demagType = selectedSteps[0].demagType;

  const interpretation: StatisitcsInterpretation = {
    id,
    code,
    stepRange,
    stepCount,
    Dgeo,
    Igeo,
    Dstrat,
    Istrat,
    confidenceRadius,
    comment,
    demagType
  };

  return interpretation;
};

export default rawStatisticsToInterpretation;
