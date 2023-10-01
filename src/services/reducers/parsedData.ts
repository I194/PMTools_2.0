import { createSlice } from "@reduxjs/toolkit";
import { IPmdData, IDirData, ISitesData } from "../../utils/GlobalTypes";
import { filesToData, sitesFileToLatLon } from "../axios/filesAndData";

interface IInitialState {
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: boolean;
  errorInfo: any;
  treatmentData: IPmdData[] | null;
  dirStatData: IDirData[] | null;
  siteData: ISitesData | null;
  currentDataPMDid: number | null;
  currentDataDIRid: number | null;
};

const initialState: IInitialState = {
  loading: 'idle',
  error: false,
  errorInfo: null,
  treatmentData: null,
  dirStatData: null,
  siteData: null,
  currentDataPMDid: null,
  currentDataDIRid: null,
};

const parsedDataSlice = createSlice({
  name: 'parsedData',
  initialState,
  reducers: {
    setTreatmentData (state, action) {
      state.treatmentData = action.payload;
    },
    setDirStatData (state, action) {
      state.dirStatData = action.payload;
    },
    setCurrentPMDid (state, action) {
      state.currentDataPMDid = action.payload;
    },
    setCurrentDIRid (state, action) {
      state.currentDataDIRid = action.payload;
    },
    setSiteData (state, action) {
      state.siteData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(filesToData.pending, (state) => {
      state.loading = 'pending';
      state.errorInfo = null;
    });
    builder.addCase(filesToData.fulfilled, (state, action) => {
      const format = action.payload.format;
      if (format === 'pmd' || format === 'squid' || format === 'rs3') {
        // core hade is measured, we use the plunge (90 - hade)
        state.treatmentData = (action.payload.data as IPmdData[]).map((pmdData) => {
          return {
            ...pmdData,
            metadata: {
              ...pmdData.metadata,
              b: 90 - pmdData.metadata.b
            }
          }
        });
      };
      if (format === 'dir' || format === 'pmm') {
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
    builder.addCase(sitesFileToLatLon.pending, (state) => {
      state.loading = 'pending';
      state.errorInfo = null;
    });
    builder.addCase(sitesFileToLatLon.fulfilled, (state, action) => {
      state.siteData = action.payload;
      state.loading = 'succeeded';
      state.error = false;
      state.errorInfo = null;
    });
    builder.addCase(sitesFileToLatLon.rejected, (state, action) => {
      state.error = true;
      state.errorInfo = action.payload;
      state.loading = 'failed';
    });
  }
});

export const { 
  setTreatmentData,
  setDirStatData,
  setCurrentPMDid,
  setCurrentDIRid,
  setSiteData,
} = parsedDataSlice.actions;

const parsedDataReducer = parsedDataSlice.reducer;
export default parsedDataReducer;