import { IDirData, StatisitcsInterpretationFromDIR } from "../../GlobalTypes";
import equal from "deep-equal"

const getInterpretationIDsDIR = (
  interpretation: StatisitcsInterpretationFromDIR | null, 
  allData: IDirData,
) => {
  const inInterpretationIDs: Array<number> = [];

  if (interpretation && interpretation.directions) {
    interpretation.directions.forEach((interpretaionDirection) => {
      allData.interpretations.forEach((direction) => {
        if (equal(direction, interpretaionDirection)) inInterpretationIDs.push(direction.id);
      });
    });
  };

  return inInterpretationIDs;
}
export default getInterpretationIDsDIR;
