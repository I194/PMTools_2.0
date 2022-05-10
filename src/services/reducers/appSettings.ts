import { createSlice } from "@reduxjs/toolkit";
import { HotkeysType } from "../../utils/GlobalTypes";

interface IInitialState {
  colorMode: 'dark' | 'light';
  hotkeysActive: boolean;
  hotkeys: HotkeysType;
}

const initialState: IInitialState = {
  colorMode: 'dark',
  hotkeysActive: true,
  hotkeys: [],
}

const appSettings = createSlice({
  name: 'appSettings',
  initialState,
  reducers: {
    setColorMode (state, action) {
      state.colorMode = action.payload;
    },
    acitvateHotkeys (state) {
      state.hotkeysActive = true;
    },
    deactivateHotkeys (state) {
      state.hotkeysActive = false;
    },
    setHotkeys (state, action: { payload: HotkeysType }) {
      state.hotkeys = action.payload;
      localStorage.setItem('hotkeys', JSON.stringify(action.payload));
      console.log('hotkeys set', action.payload);
    },
  },
  extraReducers: (builder) => {
  }
});

export const { 
  setColorMode,
  acitvateHotkeys,
  deactivateHotkeys,
  setHotkeys,
} = appSettings.actions;

const appSettingsReducer = appSettings.reducer;
export default appSettingsReducer;
