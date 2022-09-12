import { createSlice } from "@reduxjs/toolkit";
import { IDirData, VGPData } from "../../utils/GlobalTypes";
import { StatisitcsInterpretation } from "../../utils/GlobalTypes";
import { Reference, StatisticsModeDIR } from "../../utils/graphs/types";

interface IInitialState {
  currentFile: IDirData | null;
  vgpData: VGPData | null;
  reference: Reference;
  selectedDirectionsIDs: Array<number> | null;
  hiddenDirectionsIDs: Array<number>;
  reversedDirectionsIDs: Array<number>;
  statisticsMode: StatisticsModeDIR;
  currentInterpretation: StatisitcsInterpretation | null;
  currentFileInterpretations: Array<StatisitcsInterpretation>;
  allInterpretations: Array<StatisitcsInterpretation>;
  outputFilename: string;
  showSelectionInput: boolean;
  showVGPMean: boolean;
};

const initialState: IInitialState = {
  currentFile: null,
  vgpData: null,
  reference: 'geographic',
  selectedDirectionsIDs: null,
  hiddenDirectionsIDs: [],
  reversedDirectionsIDs: [],
  statisticsMode: null,
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
    setCurrentFile (state, action) {
      state.currentFile = action.payload;
    },
    setVGPData (state, action) {
      state.vgpData = action.payload;
    },
    setReference (state, action) {
      state.reference = action.payload;
    },
    setSelectedDirectionsIDs (state, action) {
      state.selectedDirectionsIDs = action.payload;
    },
    setHiddenDirectionsIDs (state, action: {payload: Array<number>}) {
      state.hiddenDirectionsIDs = action.payload;
    },
    addHiddenDirectionsIDs (state, action: {payload: Array<number>}) {
      // Set делает значения уникальными
      const updatedHiddenDirectionsIDs = [...new Set([...state.hiddenDirectionsIDs, ...action.payload])];
      state.hiddenDirectionsIDs = updatedHiddenDirectionsIDs;
    },
    setReversedDirectionsIDs (state, action: {payload: Array<number>}) {
      state.reversedDirectionsIDs = action.payload;
    },
    addReversedDirectionsIDs (state, action: {payload: Array<number>}) {
      // Set делает значения уникальными
      const updatedReversedDirectionsIDs = [...new Set([...state.reversedDirectionsIDs, ...action.payload])];
      state.reversedDirectionsIDs = updatedReversedDirectionsIDs;
    },
    showSelectionInput (state, action) {
      state.showSelectionInput = action.payload;
    },
    setStatisticsMode (state, action) {
      state.statisticsMode = action.payload;
    },
    // interpretations manipulations below
    addInterpretation (state, action) {
      state.currentInterpretation = action.payload?.interpretation;
      state.currentFileInterpretations.push(action.payload?.interpretation);
      state.allInterpretations.push(action.payload?.interpretation);
    },
    deleteInterpretation (state, action) {
      const interpretationLabel = action.payload;
      const updatedInterpretations = state.allInterpretations.filter(
        interpretation => interpretation.label !== interpretationLabel
      );
      state.allInterpretations = updatedInterpretations;
    },
    deleteInterepretationByParentFile (state, action) {
      const parentFile = action.payload;
      const updatedInterpretations = state.allInterpretations.filter(
        interpretation => interpretation.parentFile !== parentFile
      );
      state.allInterpretations = updatedInterpretations;
    },
    setAllInterpretations (state, action) {
      state.allInterpretations = action.payload;
    },
    deleteAllInterpretations (state) {
      state.allInterpretations = [];
      state.currentFileInterpretations = [];
      state.currentInterpretation = null;
    },
    updateCurrentFileInterpretations (state, action) {
      const filename = action.payload;
      state.currentFileInterpretations = state.allInterpretations.filter(
        interpretation => interpretation.parentFile === filename
      );
    },
    updateCurrentInterpretation (state) {
      if (!state.currentFileInterpretations.length) {
        state.currentInterpretation = null;
        return;
      };
      state.currentInterpretation = state.currentFileInterpretations[
        state.currentFileInterpretations.length - 1
      ];
    },
    setOutputFilename (state, action) {
      state.outputFilename = action.payload;
    },
    toggleShowVGPMean (state) {
      state.showVGPMean = !state.showVGPMean;
    }
  },
  extraReducers: (builder) => {
  }
});

export const { 
  setCurrentFile,
  setVGPData,
  setReference,
  setSelectedDirectionsIDs,
  setHiddenDirectionsIDs,
  addHiddenDirectionsIDs,
  setReversedDirectionsIDs,
  addReversedDirectionsIDs,
  setStatisticsMode,
  showSelectionInput,
  addInterpretation,
  deleteInterpretation,
  setAllInterpretations,
  deleteAllInterpretations,
  updateCurrentFileInterpretations,
  updateCurrentInterpretation,
  setOutputFilename,
  toggleShowVGPMean,
  deleteInterepretationByParentFile,
} = dirPage.actions;

const dirPageReducer = dirPage.reducer;
export default dirPageReducer;