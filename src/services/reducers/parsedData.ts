import { createSlice } from "@reduxjs/toolkit";
import { IPmdData, IDirData, ISitesData } from "../../utils/GlobalTypes";
import { filesToData, sitesFileToLatLon } from "../axios/filesAndData";

interface IInitialState {
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: boolean;
  errorInfo: any;
  treatmentData: IPmdData[];
  dirStatData: IDirData[];
  siteData: ISitesData | null;
  currentDataPMDid: number | null;
  currentDataDIRid: number | null;
};

const initialState: IInitialState = {
  loading: 'idle',
  error: false,
  errorInfo: null,
  treatmentData: [],
  dirStatData: [],
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
      localStorage.setItem('treatmentData', JSON.stringify(state.treatmentData));
    },
    deleteAllTreatmentData (state) {
      state.treatmentData = [];
      localStorage.setItem('treatmentData', JSON.stringify(state.treatmentData));
    },
    deleteTreatmentData (state, action) {
      state.treatmentData = state.treatmentData.filter(pmdData => pmdData.metadata.name !== action.payload);
      localStorage.setItem('treatmentData', JSON.stringify(state.treatmentData));
    },
    setDirStatData (state, action) {
      state.dirStatData = action.payload;
      localStorage.setItem('dirStatData', JSON.stringify(state.dirStatData));
    },
    deleteAllDirStatData (state) {
      state.dirStatData = [];
      localStorage.setItem('dirStatData', JSON.stringify(state.dirStatData));
    },
    deleteDirStatData (state, action) {
      state.dirStatData = state.dirStatData.filter(dirStatData => dirStatData.name !== action.payload);
      localStorage.setItem('dirStatData', JSON.stringify(state.dirStatData));
    },
    setCurrentPMDid (state, action) {
      state.currentDataPMDid = action.payload;
      localStorage.setItem('currentDataPMDid', JSON.stringify(state.currentDataPMDid));
    },
    setCurrentDIRid (state, action) {
      state.currentDataDIRid = action.payload;
      localStorage.setItem('currentDataDIRid', JSON.stringify(state.currentDataDIRid));
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
        const newTreatmentData = (action.payload.data as IPmdData[]).map((pmdData) => {
          const pmdDataChangedPlunge = {
            ...pmdData,
            metadata: {
              ...pmdData.metadata,
              b: 90 - pmdData.metadata.b
            }
          };
          return pmdDataChangedPlunge;
        });

        state.treatmentData.push(...newTreatmentData);

        localStorage.setItem('treatmentData', JSON.stringify(state.treatmentData));
      };

      if (format === 'dir' || format === 'pmm') {
        state.dirStatData.push(...action.payload.data as IDirData[]);

        localStorage.setItem('dirStatData', JSON.stringify(state.dirStatData));
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
  deleteAllTreatmentData,
  deleteTreatmentData,
  setDirStatData,
  deleteAllDirStatData,
  deleteDirStatData,
  setCurrentPMDid,
  setCurrentDIRid,
  setSiteData,
} = parsedDataSlice.actions;

const parsedDataReducer = parsedDataSlice.reducer;
export default parsedDataReducer;