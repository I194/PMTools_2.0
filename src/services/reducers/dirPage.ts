import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IDirData, MeanDir, VGPData } from "../../utils/GlobalTypes";
import { StatisitcsInterpretationFromDIR } from "../../utils/GlobalTypes";
import { Reference, StatisticsModeDIR } from "../../utils/graphs/types";

interface IInitialState {
  vgpData: VGPData | null;
  vgpMean: MeanDir | null;
  reference: Reference;
  selectedDirectionsIDs: Array<number> | null;
  hiddenDirectionsIDs: Array<number>;
  reversedDirectionsIDs: Array<number>;
  statisticsMode: StatisticsModeDIR;
  isCommentsInputVisible: boolean;
  currentInterpretation: StatisitcsInterpretationFromDIR | null;
  currentFileInterpretations: Array<StatisitcsInterpretationFromDIR>;
  allInterpretations: Array<StatisitcsInterpretationFromDIR>;
  outputFilename: string;
  showSelectionInput: boolean;
  showVGPMean: boolean;
};

const initialState: IInitialState = {
  vgpData: null,
  vgpMean: null,
  reference: 'geographic',
  selectedDirectionsIDs: null,
  hiddenDirectionsIDs: [],
  reversedDirectionsIDs: [],
  statisticsMode: null,
  isCommentsInputVisible: true,
  currentInterpretation: null,
  currentFileInterpretations: [],
  allInterpretations: [],
  outputFilename: '',
  showSelectionInput: false,
  showVGPMean: false,
};

const dirPage = createSlice({
  name: 'dirPage',
  initialState,
  reducers: {
    setReference (state, action) {
      state.reference = action.payload;
      localStorage.setItem('dirPage_reference', JSON.stringify(state.reference));
    },
    setSelectedDirectionsIDs (state, action) {
      state.selectedDirectionsIDs = action.payload;
    },
    setHiddenDirectionsIDs (state, action: {payload: Array<number>}) {
      state.hiddenDirectionsIDs = action.payload;
    },
    addHiddenDirectionsIDs (state, action: {payload: Array<number>}) {
      const updatedHiddenDirectionsIDs = [...new Set([...state.hiddenDirectionsIDs, ...action.payload])];
      state.hiddenDirectionsIDs = updatedHiddenDirectionsIDs;
    },
    removeHiddenDirectionsIDs (state, action: {payload: Array<number>}) {
      const visibleDirectionsIDs = [...new Set([...state.hiddenDirectionsIDs, ...action.payload])];
      state.hiddenDirectionsIDs = state.hiddenDirectionsIDs.filter(id => !visibleDirectionsIDs.includes(id));
    },
    setReversedDirectionsIDs (state, action: {payload: Array<number>}) {
      state.reversedDirectionsIDs = action.payload;
    },
    addReversedDirectionsIDs (state, action: {payload: Array<number>}) {
      const updatedReversedDirectionsIDs = [...new Set([...state.reversedDirectionsIDs, ...action.payload])];
      state.reversedDirectionsIDs = updatedReversedDirectionsIDs;
    },
    showSelectionInput (state, action) {
      state.showSelectionInput = action.payload;
    },
    setStatisticsMode (state, action) {
      state.statisticsMode = action.payload;
    },
    toggleCommentsInput(state) {
      state.isCommentsInputVisible = !state.isCommentsInputVisible;
      localStorage.setItem('dirPage_isCommentsInputVisible', JSON.stringify(state.isCommentsInputVisible));
    },
    setCommentsInput(state, action: { payload: boolean }) {
      state.isCommentsInputVisible = action.payload;
      localStorage.setItem('dirPage_isCommentsInputVisible', JSON.stringify(state.isCommentsInputVisible));
    },
    // VGP
    toggleShowVGPMean (state) {
      state.showVGPMean = !state.showVGPMean;
    },
    setVGPData (state, action) {
      state.vgpData = action.payload;
    },
    setVGPMean (state, action) {
      state.vgpMean = action.payload;
    },
    // interpretations manipulations below
    addInterpretation (state, action) {
      state.currentInterpretation = action.payload?.interpretation;
      state.currentFileInterpretations.push(action.payload?.interpretation);
      state.allInterpretations.push(action.payload?.interpretation);
      state.selectedDirectionsIDs = null;
      localStorage.setItem('dirPage_allInterpretations', JSON.stringify(state.allInterpretations));
      localStorage.setItem('dirPage_currentInterpretation', JSON.stringify(state.currentInterpretation?.label || ''));
    },
    deleteInterpretation (state, action) {
      const interpretationLabel = action.payload;
      const updatedInterpretations = state.allInterpretations.filter(
        interpretation => interpretation.label !== interpretationLabel
      );
      state.allInterpretations = updatedInterpretations;
      localStorage.setItem('dirPage_allInterpretations', JSON.stringify(state.allInterpretations));
    },
    deleteInterepretationByParentFile (state, action) {
      const parentFile = action.payload;
      const updatedInterpretations = state.allInterpretations.filter(
        interpretation => interpretation.parentFile !== parentFile
      );
      state.allInterpretations = updatedInterpretations;
      localStorage.setItem('dirPage_allInterpretations', JSON.stringify(state.allInterpretations));
    },
    setAllInterpretations (state, action) {
      state.allInterpretations = action.payload;
      localStorage.setItem('dirPage_allInterpretations', JSON.stringify(state.allInterpretations));
    },
    deleteAllInterpretations (state) {
      state.allInterpretations = [];
      state.currentFileInterpretations = [];
      state.currentInterpretation = null;
      localStorage.setItem('dirPage_allInterpretations', JSON.stringify(state.allInterpretations));
      localStorage.setItem('dirPage_currentInterpretation', JSON.stringify(''));
    },
    updateCurrentFileInterpretations (state, action: PayloadAction<string>) {
      const filename = action.payload;
      state.currentFileInterpretations = state.allInterpretations.filter(
        interpretation => interpretation.parentFile === filename
      );
    },
    setLastInterpretationAsCurrent (state) {
      if (!state.currentFileInterpretations.length) {
        state.currentInterpretation = null;
        return;
      };
      state.currentInterpretation = state.currentFileInterpretations[
        state.currentFileInterpretations.length - 1
      ];
      localStorage.setItem('dirPage_currentInterpretation', JSON.stringify(state.currentInterpretation.label));
    },
    setCurrentInterpretationByLabel(state, action: PayloadAction<{label: string}>) {
      const { label } = action.payload;
      const interpretationToSet = state.allInterpretations.find(interpretation => interpretation.label === label);
      if (!interpretationToSet) {
        return;
      }
      state.currentInterpretation = interpretationToSet;
      localStorage.setItem('dirPage_currentInterpretation', JSON.stringify(state.currentInterpretation.label));
    },
    setNextOrPrevInterpretationAsCurrent(state, action: PayloadAction<{changeDirection: 'up' | 'down'}>) {
      if (!state.currentFileInterpretations.length || !state.currentInterpretation) {
        state.currentInterpretation = null;
        return;
      }
      const currentInterpretationIndex = state.currentFileInterpretations.findIndex(
        (interpretation) => (
          interpretation.label === state.currentInterpretation?.label
        )
      )

      const { changeDirection } = action.payload;

      const toNext = changeDirection === 'up' ? 1 : -1;

      const totalInterpretations = state.currentFileInterpretations.length;
      let nextInterpretationIndex = currentInterpretationIndex + toNext;

      if (nextInterpretationIndex < 0) {
        nextInterpretationIndex = totalInterpretations - 1;
      } else if (nextInterpretationIndex >= totalInterpretations) {
        nextInterpretationIndex = 0;
      }

      const nextInterpretation = state.currentFileInterpretations[nextInterpretationIndex];
      state.currentInterpretation = nextInterpretation;
      localStorage.setItem('dirPage_currentInterpretation', JSON.stringify(state.currentInterpretation.label));
    },
    setOutputFilename (state, action) {
      state.outputFilename = action.payload;
    },
  },
  extraReducers: (builder) => {
  }
});

export const {
  setVGPData,
  setVGPMean,
  setReference,
  setSelectedDirectionsIDs,
  setHiddenDirectionsIDs,
  addHiddenDirectionsIDs,
  removeHiddenDirectionsIDs,
  setReversedDirectionsIDs,
  addReversedDirectionsIDs,
  setStatisticsMode,
  toggleCommentsInput,
  setCommentsInput,
  showSelectionInput,
  addInterpretation,
  deleteInterpretation,
  setAllInterpretations,
  deleteAllInterpretations,
  updateCurrentFileInterpretations,
  setLastInterpretationAsCurrent,
  setCurrentInterpretationByLabel,
  setNextOrPrevInterpretationAsCurrent,
  setOutputFilename,
  toggleShowVGPMean,
  deleteInterepretationByParentFile,
} = dirPage.actions;

const dirPageReducer = dirPage.reducer;
export default dirPageReducer;