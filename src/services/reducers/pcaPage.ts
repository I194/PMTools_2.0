import { createSlice } from "@reduxjs/toolkit";
import { IPmdData, IDirData } from "../../utils/GlobalTypes";
import { RawStatisticsPCA, StatisitcsInterpretation } from "../../utils/GlobalTypes";
import { Projection, Reference, StatisticsModePCA } from "../../utils/graphs/types";

interface IInitialState {
  currentFile: IPmdData | null;
  reference: Reference;
  projection: Projection;
  selectedStepsIDs: Array<number> | null;
  statisticsMode: StatisticsModePCA;
  currentInterpretation: StatisitcsInterpretation | null;
  currentFileInterpretations: Array<StatisitcsInterpretation>;
  allInterpretations: Array<StatisitcsInterpretation>;
  outputFilename: string;
  showStepsInput: boolean;
}

const initialState: IInitialState = {
  currentFile: null,
  reference: 'geographic',
  projection: {y: 'W, UP', x: 'N, N'},
  selectedStepsIDs: null,
  statisticsMode: null,
  currentInterpretation: null,
  currentFileInterpretations: [],
  allInterpretations: [],
  outputFilename: '',
  showStepsInput: false,
}

const pcaPage = createSlice({
  name: 'pcaPage',
  initialState,
  reducers: {
    setCurrentFile (state, action) {
      state.currentFile = action.payload;
    },
    setReference (state, action) {
      state.reference = action.payload;
    },
    setProjection (state, action) {
      state.projection = action.payload;
    },
    setSelectedStepsIDs (state, action) {
      state.selectedStepsIDs = action.payload;
    },
    setStatisticsMode (state, action) {
      state.statisticsMode = action.payload;
    },
    showStepsInput (state, action) {
      state.showStepsInput = action.payload;
    },
    addInterpretation (state, action) {
      state.currentInterpretation = action.payload?.interpretation;
      state.currentFileInterpretations.push(action.payload?.interpretation);
      state.allInterpretations.push(action.payload?.interpretation);
    },
    deleteInterpretation (state, action) {
      const interpretationId = action.payload;
      const updatedInterpretations = state.allInterpretations.filter(
        interpretation => interpretation.id !== interpretationId 
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
      if (!state.currentFileInterpretations.length) state.currentInterpretation = null;
      state.currentInterpretation = state.currentFileInterpretations[
        state.currentFileInterpretations.length - 1
      ];
    },
    setOutputFilename (state, action) {
      state.outputFilename = action.payload;
    },
  },
  extraReducers: (builder) => {
  }
});

export const { 
  setCurrentFile,
  setReference,
  setProjection,
  setSelectedStepsIDs,
  setStatisticsMode,
  showStepsInput,
  addInterpretation,
  deleteInterpretation,
  setAllInterpretations,
  deleteAllInterpretations,
  updateCurrentFileInterpretations,
  updateCurrentInterpretation,
  setOutputFilename,
} = pcaPage.actions;

const pcaPageReducer = pcaPage.reducer;
export default pcaPageReducer;
