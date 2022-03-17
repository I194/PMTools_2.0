import { IDirData, IPmdData } from "../GlobalTypes";

const enteredIndexesToIDsPMD = (
  enteredIndexes: Array<number>, 
  hiddenStepsIDs: Array<number>, 
  pmdData: IPmdData
) => {
  // image we have already hidden steps with these ID's: [1, 2, 3]
  // then we wanna select next three steps, so we enter again '1-3' or '1,2,3'
  // but steps width ID's [1, 2, 3] already hidden and can't be selected, 
  // so then we must select next three steps
  // and there are ID's of next three steps: [4, 5, 6]
  // in order to select them we must 1) find all currently visible steps:
  const visibleSteps = pmdData.steps.filter(step => !hiddenStepsIDs.includes(step.id));
  // and then 2) select each of them what index includes in input ID's array ('1-3' or '1,2,3')
  const stepsToSelect = visibleSteps.filter((step, index) => enteredIndexes.includes(index + 1));
  return stepsToSelect.map(step => step.id);
};

const enteredIndexesToIDsDIR = (
  enteredIndexes: Array<number>, 
  hiddenStepsIDs: Array<number>, 
  dirData: IDirData
) => {
  // image we have already hidden steps with these ID's: [1, 2, 3]
  // then we wanna select next three steps, so we enter again '1-3' or '1,2,3'
  // but steps width ID's [1, 2, 3] already hidden and can't be selected, 
  // so then we must select next three steps
  // and there are ID's of next three steps: [4, 5, 6]
  // in order to select them we must 1) find all currently visible steps:
  const visibleSteps = dirData.interpretations.filter(interpretation => !hiddenStepsIDs.includes(interpretation.id));
  // and then 2) select each of them what index includes in input ID's array ('1-3' or '1,2,3')
  const stepsToSelect = visibleSteps.filter((step, index) => enteredIndexes.includes(index + 1));
  return stepsToSelect.map(step => step.id);
};

export {
  enteredIndexesToIDsPMD,
  enteredIndexesToIDsDIR
};