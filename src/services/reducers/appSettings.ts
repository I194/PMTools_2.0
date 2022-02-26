import { createSlice } from "@reduxjs/toolkit";

interface IInitialState {
  colorMode: 'dark' | 'light';
}

const initialState: IInitialState = {
  colorMode: 'dark',
}

const appSettings = createSlice({
  name: 'appSettings',
  initialState,
  reducers: {
    setColorMode (state, action) {
      state.colorMode = action.payload;
    },
  },
  extraReducers: (builder) => {
  }
});

export const { 
  setColorMode,
} = appSettings.actions;

const appSettingsReducer = appSettings.reducer;
export default appSettingsReducer;
