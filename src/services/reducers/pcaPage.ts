import { createSlice } from "@reduxjs/toolkit";
import { IDirData, IPmdData } from "../../utils/files/fileManipulations";
import { Reference, StatisticsModePCA } from "../../utils/graphs/types";
import { filesToData } from "../axios/filesAndData";

interface IInitialState {
  currentFile: IPmdData | null;
  reference: Reference;
  selectedStepsIDs: Array<number> | null;
  statisticsMode: StatisticsModePCA;
  showStepsInput: boolean;
}

const initialState: IInitialState = {
  currentFile: null,
  reference: 'geographic',
  selectedStepsIDs: null,
  statisticsMode: null,
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
} = pcaPage.actions;

const pcaPageReducer = pcaPage.reducer;
export default pcaPageReducer;
