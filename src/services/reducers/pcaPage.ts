import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IPmdData, IDirData, GraphPMD } from "../../utils/GlobalTypes";
import { RawStatisticsPCA, StatisitcsInterpretation } from "../../utils/GlobalTypes";
import { Projection, Reference, StatisticsModePCA } from "../../utils/graphs/types";

interface IInitialState {
  currentFile: IPmdData | null;
  reference: Reference;
  projection: Projection;
  selectedStepsIDs: Array<number> | null;
  hiddenStepsIDs: Array<number>;
  statisticsMode: StatisticsModePCA;
  currentInterpretation: StatisitcsInterpretation | null;
  currentFileInterpretations: Array<StatisitcsInterpretation>;
  allInterpretations: Array<StatisitcsInterpretation>;
  outputFilename: string;
  showStepsInput: boolean;
  largeGraph: GraphPMD;
}

const initialState: IInitialState = {
  currentFile: null,
  reference: 'geographic',
  projection: {y: 'W, UP', x: 'N, N'},
  selectedStepsIDs: null,
  hiddenStepsIDs: [],
  statisticsMode: null,
  currentInterpretation: null,
  currentFileInterpretations: [],
  allInterpretations: [],
  outputFilename: '',
  showStepsInput: false,
  largeGraph: 0,  
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
    setHiddenStepsIDs (state, action: {payload: Array<number>}) {
      state.hiddenStepsIDs = action.payload;
    },
    addHiddenStepsIDs (state, action: {payload: Array<number>}) {
      const updatedHiddenStepsIDs = [...new Set([...state.hiddenStepsIDs, ...action.payload])];
      state.hiddenStepsIDs = updatedHiddenStepsIDs;
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
    setLargeGraph (state, action: PayloadAction<GraphPMD>) {
      state.largeGraph = action.payload;
    }
  },
  extraReducers: (builder) => {
  }
});

export const { 
  setCurrentFile,
  setReference,
  setProjection,
  setSelectedStepsIDs,
  setHiddenStepsIDs,
  addHiddenStepsIDs,
  setStatisticsMode,
  showStepsInput,
  addInterpretation,
  deleteInterpretation,
  setAllInterpretations,
  deleteAllInterpretations,
  updateCurrentFileInterpretations,
  updateCurrentInterpretation,
  deleteInterepretationByParentFile,
  setOutputFilename,
  setLargeGraph,
} = pcaPage.actions;

const pcaPageReducer = pcaPage.reducer;
export default pcaPageReducer;