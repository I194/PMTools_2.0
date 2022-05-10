import { IDirData, RawStatisticsDIR } from "../../GlobalTypes";
import { StatisitcsInterpretation } from "../../GlobalTypes";
import { StatisticsModeDIR } from "../../graphs/types";

const rawStatisticsDIRToInterpretation = (
  statistics: RawStatisticsDIR, 
  selectedDirections: IDirData['interpretations'],
  filename: IDirData['name'],
  code: StatisticsModeDIR,
) => {
  // ограничение по длине в 7 символов из-за специфики .dir файлов
  // здесь оставляется 4 первые символа имени файла, далее добавится id
  // получится по итогу такое: aBcD_1 или aBcD_12
  const label: string = filename.slice(0, 4);  

  const stepRange: string = 'avg'
  const stepCount: number = selectedDirections.length;

  const [Dgeo, Igeo] = statistics.mean.geographic.direction.toArray();
  const [Dstrat, Istrat] = statistics.mean.stratigraphic.direction.toArray();

  const confidenceRadius = statistics.mean.geographic.MAD;
  const accuracy = statistics.mean.geographic.k;
  const comment = '';
  const demagType = selectedDirections[0].demagType;

  const interpretation: StatisitcsInterpretation = {
    parentFile: filename,
    label,
    code,
    directions: selectedDirections,
    stepRange,
    stepCount,
    Dgeo: +Dgeo.toFixed(1),
    Igeo: +Igeo.toFixed(1),
    Dstrat: +Dstrat.toFixed(1),
    Istrat: +Istrat.toFixed(1),
    confidenceRadius: +confidenceRadius.toFixed(1),
    k: +(accuracy || 0).toFixed(1),
    comment,
    demagType,
    rawData: statistics
  };

  return interpretation;
};

export default rawStatisticsDIRToInterpretation;
