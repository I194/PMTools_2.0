import { createSlice } from "@reduxjs/toolkit";
import { IDirData, IPmdData } from "../../utils/files/fileManipulations";
import { Reference } from "../../utils/graphs/types";
import { filesToData } from "../axios/filesAndData";

interface IInitialState {
  currentFile: IPmdData | null;
  reference: Reference;
  selectedStepsIDs: Array<number> | null;
  statisticsMode: 'pca' | 'pca0' | 'gc' | 'gcn' | null;
}

const initialState: IInitialState = {
  currentFile: null,
  reference: 'geographic',
  selectedStepsIDs: null,
  statisticsMode: null,
}

const pcaPage = createSlice({
  name: 'files',
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
  },
  extraReducers: (builder) => {
  }
});

export const { 
  setCurrentFile,
  setReference,
  setSelectedStepsIDs,
  setStatisticsMode,
} = pcaPage.actions;

const pcaPageReducer = pcaPage.reducer;
export default pcaPageReducer;
