import { combineReducers, configureStore } from "@reduxjs/toolkit";
import appSettingsReducer from "../reducers/appSettings";
import parsedDataReducer from "../reducers/parsedData";
import pcaPageReducer from "../reducers/pcaPage";
import dirPageReducer from "../reducers/dirPage";
import thunk from 'redux-thunk';
import { pcaMiddleware } from './middleware';

export const rootReducer = combineReducers({
  appSettingsReducer,
  parsedDataReducer,
  pcaPageReducer,
  dirPageReducer,
});

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(thunk),//.concat(pcaMiddleware()),
  });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
