import { createSlice } from "@reduxjs/toolkit";

interface IInitialState {
  inputFiles: File[] | null;
  outputFiles: File[] | null;

  treatmentFiles: File[] | null;
  dirStatFiles: File[] | null;
}

const initialState: IInitialState = {
  inputFiles: null,
  outputFiles: null,

  treatmentFiles: null,
  dirStatFiles: null,
}

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setInputFiles (state, action) {
      state.inputFiles = action.payload;
    },
    setOutputFiles (state, action) {
      state.outputFiles = action.payload;
    },
    setTreatmentFiles (state, action) {
      state.treatmentFiles = action.payload;
    },
    setDirStateFiles (state, action) {
      state.dirStatFiles = action.payload;
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
  setInputFiles, 
  setOutputFiles, 
  setTreatmentFiles,
  setDirStateFiles
} = filesSlice.actions;

const filesReducer = filesSlice.reducer;
export default filesReducer;