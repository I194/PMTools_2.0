import { IPmdData } from "../../GlobalTypes";
import { RawStatisticsPCA, StatisitcsInterpretation } from "../../GlobalTypes";
import toReferenceCoordinates from "../../graphs/formatters/toReferenceCoordinates";
import { StatisticsModePCA } from "../../graphs/types";

const rawStatisticsPMDToInterpretation = (
  statistics: RawStatisticsPCA, 
  selectedSteps: IPmdData['steps'],
  metadata: IPmdData['metadata'],
  code: StatisticsModePCA,
) => {
  // ограничение по длине в 7 символов из-за специфики .dir файлов
  // здесь оставляется 4 первые символа имени файла, далее добавится id
  // получится по итогу такое: aBcD_1 или aBcD_12
  const label: string = metadata.name.slice(0, 4);  

  const stepRange: string = `${selectedSteps[0].step}-${selectedSteps[selectedSteps.length - 1].step}`;
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
    parentFile: metadata.name,
    label,
    code,
    steps: selectedSteps,
    stepRange,
    stepCount,
    Dgeo: +Dgeo.toFixed(1),
    Igeo: +Igeo.toFixed(1),
    Dstrat: +Dstrat.toFixed(1),
    Istrat: +Istrat.toFixed(1),
    confidenceRadius: +confidenceRadius.toFixed(1),
    comment,
    demagType,
    rawData: statistics
  };

  return interpretation;
};

export default rawStatisticsPMDToInterpretation;
