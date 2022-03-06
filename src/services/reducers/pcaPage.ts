import { createSlice } from "@reduxjs/toolkit";
import { IPmdData, IDirData } from "../../utils/GlobalTypes";
import { RawStatisticsPCA, StatisitcsInterpretation } from "../../utils/GlobalTypes";
import { Reference, StatisticsModePCA } from "../../utils/graphs/types";
import { filesToData } from "../axios/filesAndData";

interface IInitialState {
  currentFile: IPmdData | null;
  reference: Reference;
  selectedStepsIDs: Array<number> | null;
  statisticsMode: StatisticsModePCA;
  currentRawStatistics: RawStatisticsPCA | null;
  currentInterpretation: StatisitcsInterpretation | null;
  currentFileInterpretations: Array<StatisitcsInterpretation>;
  allInterpretations: Array<StatisitcsInterpretation>;
  outputFilename: string;
  showStepsInput: boolean;
}

const initialState: IInitialState = {
  currentFile: null,
  reference: 'geographic',
  selectedStepsIDs: null,
  statisticsMode: null,
  currentRawStatistics: null,
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
    setSelectedStepsIDs (state, action) {
      state.selectedStepsIDs = action.payload;
    },
    setStatisticsMode (state, action) {
      state.statisticsMode = action.payload;
    },
    showStepsInput (state, action) {
      state.showStepsInput = action.payload;
    },
    setCurrentStatistics (state, action) {
      state.currentRawStatistics = action.payload?.rawStatistics;
      state.currentInterpretation = action.payload?.interpretation;
    },
    addCurrentFileInterpretation (state) {
      if (!state.currentInterpretation) return;
      state.currentFileInterpretations.push(state.currentInterpretation);
      state.allInterpretations.push(state.currentInterpretation);
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
  setSelectedStepsIDs,
  setStatisticsMode,
  showStepsInput,
  setCurrentStatistics,
  addCurrentFileInterpretation,
  setOutputFilename,
} = pcaPage.actions;

const pcaPageReducer = pcaPage.reducer;
export default pcaPageReducer;
