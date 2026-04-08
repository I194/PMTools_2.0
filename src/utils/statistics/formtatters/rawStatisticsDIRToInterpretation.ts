import { IDirData, RawStatisticsDIR } from '../../GlobalTypes';
import { StatisitcsInterpretationFromDIR } from '../../GlobalTypes';
import { StatisticsModeDIR } from '../../graphs/types';
import { v4 as uuidv4 } from 'uuid';

const rawStatisticsDIRToInterpretation = (
  statistics: RawStatisticsDIR,
  selectedDirections: IDirData['interpretations'],
  filename: IDirData['name'],
  code: StatisticsModeDIR,
) => {
  const label = filename.replace(/\.[^/.]+$/, '');

  const stepRange: string = 'avg';
  const stepCount: number = selectedDirections.length;

  const [Dgeo, Igeo] = statistics.mean.geographic.direction.toArray();
  const [Dstrat, Istrat] = statistics.mean.stratigraphic.direction.toArray();

  const confidenceRadiusGeo = statistics.mean.geographic.MAD;
  const accuracyGeo = statistics.mean.geographic.k;
  const confidenceRadiusStrat = statistics.mean.stratigraphic.MAD;
  const accuracyStrat = statistics.mean.stratigraphic.k;
  const comment = '';
  const demagType = selectedDirections[0].demagType;

  const interpretation: StatisitcsInterpretationFromDIR = {
    uuid: uuidv4(),
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
    confidenceRadiusGeo: +confidenceRadiusGeo.toFixed(1),
    Kgeo: +(accuracyGeo || 0).toFixed(1),
    confidenceRadiusStrat: +confidenceRadiusStrat.toFixed(1),
    Kstrat: +(accuracyStrat || 0).toFixed(1),
    comment,
    demagType,
    rawData: statistics,
  };

  return interpretation;
};

export default rawStatisticsDIRToInterpretation;
