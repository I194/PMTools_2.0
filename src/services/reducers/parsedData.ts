import { createSlice } from "@reduxjs/toolkit";
import { IDirData, IPmdData } from "../../utils/files/fileManipulations";

interface IInitialState {
  treatmentData: IPmdData[] | null;
  dirStatData: IDirData[] | null;
}

const initialState: IInitialState = {
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
    // Пример работы с асинхронными запросами
    // builder.addCase(userLogIn.pending, (state) => {
    //   state.loading = 'pending';
    //   state.errorInfo = null;
    // });
    // builder.addCase(userLogIn.fulfilled, (state, action) => {
    //   state.logInData = action.payload;
    //   state.loading = 'succeeded';
    //   state.error = false;
    //   state.errorInfo = null;
    // });
    // builder.addCase(userLogIn.rejected, (state, action) => {
    //   state.error = true;
    //   state.errorInfo = action.payload;
    //   state.loading = 'failed';
    // });
  }
});

export const { 
  setTreatmentData,
  setDirStatData
} = parsedDataSlice.actions;

const parsedDataReducer = parsedDataSlice.reducer;
export default parsedDataReducer;