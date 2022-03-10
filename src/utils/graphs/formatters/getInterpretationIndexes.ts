import { IPmdData, StatisitcsInterpretation } from "../../GlobalTypes";
import equal from "deep-equal"

const getInterpretationIndexes = (
  interpretation: StatisitcsInterpretation | null, 
  allData: IPmdData, 
) => {
  const inInterpretationIndexes: Array<number> = [];

  if (interpretation && interpretation.steps) {
    interpretation.steps.forEach((interpretaionStep) => {
      allData.steps.forEach((step, index) => {
        if (equal(step, interpretaionStep)) inInterpretationIndexes.push(index);
      });
    });
  };

  return inInterpretationIndexes;
};

export default getInterpretationIndexes;
