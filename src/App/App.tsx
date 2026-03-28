import React, { Suspense, useEffect } from 'react';
import styles from './App.module.scss';
import { Route, Routes } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../services/store/hooks';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MainPageLayout, AppLayout } from '../components/Layouts';
import {
  MainPage,
  DIRPage,
  PCAPage,
  NotFoundPage,
  WhyPMToolsPage,
  AuthorsAndHistory,
} from '../pages';
import ErrorBoundary from '../components/Common/ErrorBoundary/ErrorBoundary';
import { useSystemTheme } from '../utils/GlobalHooks';
import { acitvateHotkeys, deactivateHotkeys, setColorMode } from '../services/reducers/appSettings';
import {
  setCurrentDIRid,
  setCurrentPMDid,
  setDirStatData,
  setTreatmentData,
} from '../services/reducers/parsedData';
import * as pcaPageReducer from '../services/reducers/pcaPage';
import * as dirPageReducer from '../services/reducers/dirPage';

function App() {
  const dispatch = useAppDispatch();

  const { colorMode, rememberColorMode } = useAppSelector((state) => state.appSettingsReducer);
  const systemTheme = useSystemTheme();

  // useEffect(() => {
  //   if (!rememberColorMode) dispatch(setColorMode(systemTheme));
  // }, [systemTheme, rememberColorMode]);

  useEffect(() => {
    const previousColorMode = localStorage.getItem('colorMode') || systemTheme;
    dispatch(setColorMode(previousColorMode));
  }, []);

  const theme = createTheme({
    palette: {
      mode: colorMode,
    },
  });

  useEffect(() => {
    const safeParse = (key: string): any => {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        localStorage.removeItem(key);
        return null;
      }
    };

    const treatmentData = safeParse('treatmentData');
    const dirStatData = safeParse('dirStatData');
    const currentDataPMDid = safeParse('currentDataPMDid');
    const currentDataDIRid = safeParse('currentDataDIRid');

    if (treatmentData) {
      dispatch(setTreatmentData(treatmentData));
    }

    if (dirStatData) {
      dispatch(setDirStatData(dirStatData));
    }

    if (currentDataPMDid) {
      dispatch(setCurrentPMDid(currentDataPMDid));
    }

    if (currentDataDIRid) {
      dispatch(setCurrentDIRid(currentDataDIRid));
    }

    const pcaPage_reference = safeParse('pcaPage_reference');
    const pcaPage_projection = safeParse('pcaPage_projection');
    const pcaPage_commentsInput = safeParse('pcaPage_isCommentsInputVisible');
    const pcaPage_allInterpretations = safeParse('pcaPage_allInterpretations');
    const pcaPage_currentInterpretationUUID = safeParse('pcaPage_currentInterpretation');
    const pcaPage_isNumericLabel = safeParse('pcaPage_isNumericLabel');

    if (pcaPage_reference) {
      dispatch(pcaPageReducer.setReference(pcaPage_reference));
    }
    if (pcaPage_commentsInput) {
      dispatch(pcaPageReducer.setCommentsInput(pcaPage_commentsInput));
    }
    if (pcaPage_projection) {
      dispatch(pcaPageReducer.setProjection(pcaPage_projection));
    }
    if (pcaPage_allInterpretations) {
      dispatch(pcaPageReducer.setAllInterpretations(pcaPage_allInterpretations));
    }
    if (pcaPage_currentInterpretationUUID) {
      dispatch(
        pcaPageReducer.setCurrentInterpretationByUUID({
          uuid: pcaPage_currentInterpretationUUID,
        }),
      );
    }
    if (pcaPage_isNumericLabel) {
      dispatch(pcaPageReducer.setLabelMode(pcaPage_isNumericLabel));
    }

    const dirPage_reference = safeParse('dirPage_reference');
    const dirPage_commentsInput = safeParse('dirPage_isCommentsInputVisible');
    const dirPage_allInterpretations = safeParse('dirPage_allInterpretations');
    const dirPage_currentInterpretationRaw = safeParse('dirPage_currentInterpretation');
    const dirPage_isNumericLabel = safeParse('dirPage_isNumericLabel');

    if (dirPage_reference) {
      dispatch(dirPageReducer.setReference(dirPage_reference));
    }
    if (dirPage_commentsInput) {
      dispatch(dirPageReducer.setCommentsInput(dirPage_commentsInput));
    }
    if (dirPage_allInterpretations) {
      dispatch(dirPageReducer.setAllInterpretations(dirPage_allInterpretations));
    }
    if (dirPage_isNumericLabel) {
      dispatch(dirPageReducer.setLabelMode(dirPage_isNumericLabel));
    }
    if (dirPage_currentInterpretationRaw) {
      const isUuid =
        typeof dirPage_currentInterpretationRaw === 'string' &&
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          dirPage_currentInterpretationRaw,
        );
      if (isUuid) {
        dispatch(
          dirPageReducer.setCurrentInterpretationByUUID({ uuid: dirPage_currentInterpretationRaw }),
        );
      } else {
        dispatch(
          dirPageReducer.setCurrentInterpretationByLabel({
            label: dirPage_currentInterpretationRaw,
          }),
        );
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const handleFocusIn = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      dispatch(deactivateHotkeys());
    }
  };

  const handleFocusOut = () => {
    dispatch(acitvateHotkeys());
  };

  return (
    <Suspense fallback="loading">
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<MainPageLayout />}>
            <Route index element={<MainPage />} />
            <Route path="/why-pmtools" element={<WhyPMToolsPage />} />
            <Route path="/authors-and-history" element={<AuthorsAndHistory />} />
          </Route>
          <Route path="/app" element={<AppLayout />}>
            <Route
              path="pca"
              element={
                <ErrorBoundary pageName="pca">
                  <PCAPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="dir"
              element={
                <ErrorBoundary pageName="dir">
                  <DIRPage />
                </ErrorBoundary>
              }
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ThemeProvider>
    </Suspense>
  );
}

export default App;
