import { combineReducers, configureStore } from "@reduxjs/toolkit";
import filesReducer from "../reducers/files";
import parsedDataReducer from "../reducers/parsedData";
import pcaPageReducer from "../reducers/pcaPage";
import thunk from 'redux-thunk';

export const rootReducer = combineReducers({
  filesReducer,
  parsedDataReducer,
  pcaPageReducer,
});

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(thunk),
  });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
