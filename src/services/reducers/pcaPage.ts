import { createSlice } from "@reduxjs/toolkit";
import { IDirData, IPmdData } from "../../utils/files/fileManipulations";
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
  currentFileInterpretations: Array<StatisitcsInterpretation> | null;
  allInterpretations: Array<StatisitcsInterpretation> | null;
  showStepsInput: boolean;
}

const initialState: IInitialState = {
  currentFile: null,
  reference: 'geographic',
  selectedStepsIDs: null,
  statisticsMode: null,
  currentRawStatistics: null,
  currentInterpretation: null,
  currentFileInterpretations: null,
  allInterpretations: null,
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
} = pcaPage.actions;

const pcaPageReducer = pcaPage.reducer;
export default pcaPageReducer;
