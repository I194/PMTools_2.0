import { IPmdData, StatisitcsInterpretationFromPCA } from "../../GlobalTypes";
import equal from "deep-equal"

const getInterpretationIDs = (
  interpretation: StatisitcsInterpretationFromPCA | null, 
  allData: IPmdData, 
) => {
  const inInterpretationIDs: Array<number> = [];

  if (interpretation && interpretation.steps) {
    interpretation.steps.forEach((interpretaionStep) => {
      allData.steps.forEach((step) => {
        if (equal(step, interpretaionStep)) inInterpretationIDs.push(step.id);
      });
    });
  };

  return inInterpretationIDs;
};

// const getInterpretationIDsDIR = (
//   interpretation: StatisitcsInterpretation | null, 
//   allData: IDirData, 
// ) => {
//   const inInterpretationIDs: Array<number> = [];

//   if (interpretation && interpretation.steps) {
//     interpretation.steps.forEach((interpretaionStep) => {
//       allData.interpretations.forEach((direction) => {
//         if (equal(step, interpretaionStep)) inInterpretationIDs.push(step.id);
//       });
//     });
//   };

//   return inInterpretationIDs;
// };


export default getInterpretationIDs;
