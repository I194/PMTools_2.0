import { createSlice } from "@reduxjs/toolkit";
import { IDirData, IPmdData } from "../../utils/files/fileManipulations";
import { filesToData } from "../axios/filesAndData";

interface IInitialState {
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: boolean;
  errorInfo: any;
  treatmentData: IPmdData[] | null;
  dirStatData: IDirData[] | null;
}

const initialState: IInitialState = {
  loading: 'idle',
  error: false,
  errorInfo: null,
  treatmentData: null,
  dirStatData: null,
}

const parsedDataSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setTreatmentData (state, action) {
      state.treatmentData = action.payload;
    },
    setDirStatData (state, action) {
      state.dirStatData = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(filesToData.pending, (state) => {
      state.loading = 'pending';
      state.errorInfo = null;
    });
    builder.addCase(filesToData.fulfilled, (state, action) => {
      if (action.payload.format === 'pmd') {
        state.treatmentData = action.payload.data as IPmdData[];
      };
      if (action.payload.format === 'dir') {
        state.dirStatData = action.payload.data as IDirData[];
      };
      state.loading = 'succeeded';
      state.error = false;
      state.errorInfo = null;
    });
    builder.addCase(filesToData.rejected, (state, action) => {
      state.error = true;
      state.errorInfo = action.payload;
      state.loading = 'failed';
    });
  }
});

export const { 
  setTreatmentData,
  setDirStatData
} = parsedDataSlice.actions;

const parsedDataReducer = parsedDataSlice.reducer;
export default parsedDataReducer;