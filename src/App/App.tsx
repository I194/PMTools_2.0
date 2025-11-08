import React, { Suspense, useEffect } from 'react';
import styles from './App.module.scss';
import { Route, Routes } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../services/store/hooks';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MainPageLayout, AppLayout } from '../components/Layouts';
import { MainPage, DIRPage, PCAPage, NotFoundPage, WhyPMToolsPage, AuthorsAndHistory } from '../pages';
import { useSystemTheme } from '../utils/GlobalHooks';
import { acitvateHotkeys, deactivateHotkeys, setColorMode } from '../services/reducers/appSettings';
import { setCurrentDIRid, setCurrentPMDid, setDirStatData, setTreatmentData } from '../services/reducers/parsedData';
import * as pcaPageReducer from '../services/reducers/pcaPage';
import * as dirPageReducer from '../services/reducers/dirPage';

function App() {

  const dispatch = useAppDispatch();
  
  const { colorMode, rememberColorMode } = useAppSelector(state => state.appSettingsReducer);
  const systemTheme = useSystemTheme();

  // useEffect(() => {
  //   if (!rememberColorMode) dispatch(setColorMode(systemTheme));
  // }, [systemTheme, rememberColorMode]);
  
  useEffect(() => {
    console.log('color', localStorage)
    const previousColorMode = localStorage.getItem('colorMode') || systemTheme;
    dispatch(setColorMode(previousColorMode));
  }, []);

  const theme = createTheme({
    palette: {
      mode: colorMode
    },
  });

  useEffect(() => {
    const treatmentData = localStorage.getItem('treatmentData');
    const dirStatData = localStorage.getItem('dirStatData');
    const currentDataPMDid = localStorage.getItem('currentDataPMDid');
    const currentDataDIRid = localStorage.getItem('currentDataDIRid');

    if (treatmentData) {
      dispatch(setTreatmentData(JSON.parse(treatmentData)));
    }

    if (dirStatData) {
      dispatch(setDirStatData(JSON.parse(dirStatData)));
    }

    if (currentDataPMDid) {
      dispatch(setCurrentPMDid(JSON.parse(currentDataPMDid)));
    }

    if (currentDataDIRid) {
      dispatch(setCurrentDIRid(JSON.parse(currentDataDIRid)));
    }


    const pcaPage_reference = localStorage.getItem('pcaPage_reference');
    const pcaPage_projection = localStorage.getItem('pcaPage_projection');
    const pcaPage_commentsInput = localStorage.getItem('pcaPage_isCommentsInputVisible');
    const pcaPage_allInterpretations = localStorage.getItem('pcaPage_allInterpretations');
    const pcaPage_currentInterpretationUUID = localStorage.getItem('pcaPage_currentInterpretation');
    const pcaPage_isNumericLabel = localStorage.getItem('pcaPage_isNumericLabel');

    if (pcaPage_reference) {
      dispatch(pcaPageReducer.setReference(JSON.parse(pcaPage_reference)));
    }
    if (pcaPage_commentsInput) {
      dispatch(pcaPageReducer.setCommentsInput(JSON.parse(pcaPage_commentsInput)));
    }
    if (pcaPage_projection) {
      dispatch(pcaPageReducer.setProjection(JSON.parse(pcaPage_projection)));
    }
    if (pcaPage_allInterpretations) {
      dispatch(pcaPageReducer.setAllInterpretations(JSON.parse(pcaPage_allInterpretations)));
    }
    if (pcaPage_currentInterpretationUUID) {
      dispatch(pcaPageReducer.setCurrentInterpretationByUUID({uuid: JSON.parse(pcaPage_currentInterpretationUUID)}));
    }
    if (pcaPage_isNumericLabel) {
      dispatch(pcaPageReducer.setLabelMode(JSON.parse(pcaPage_isNumericLabel)));
    }

    const dirPage_reference = localStorage.getItem('dirPage_reference');
    const dirPage_commentsInput = localStorage.getItem('dirPage_isCommentsInputVisible');
    const dirPage_allInterpretations = localStorage.getItem('dirPage_allInterpretations');
    const dirPage_currentInterpretationRaw = localStorage.getItem('dirPage_currentInterpretation');
    const dirPage_isNumericLabel = localStorage.getItem('dirPage_isNumericLabel');

    if (dirPage_reference) {
      dispatch(dirPageReducer.setReference(JSON.parse(dirPage_reference)));
    }
    if (dirPage_commentsInput) {
      dispatch(dirPageReducer.setCommentsInput(JSON.parse(dirPage_commentsInput)));
    }
    if (dirPage_allInterpretations) {
      dispatch(dirPageReducer.setAllInterpretations(JSON.parse(dirPage_allInterpretations)));
    }
    if (dirPage_isNumericLabel) {
      dispatch(dirPageReducer.setLabelMode(JSON.parse(dirPage_isNumericLabel)));
    }
    if (dirPage_currentInterpretationRaw) {
      const parsed = JSON.parse(dirPage_currentInterpretationRaw);
      const isUuid = typeof parsed === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(parsed);
      if (isUuid) {
        dispatch(dirPageReducer.setCurrentInterpretationByUUID({uuid: parsed}));
      } else {
        dispatch(dirPageReducer.setCurrentInterpretationByLabel({label: parsed}));
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    }
  }, [])
  
  const handleFocusIn = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      dispatch(deactivateHotkeys());  
    }
  }
  
  const handleFocusOut = () => {
    dispatch(acitvateHotkeys());
  }

  return (
    <Suspense fallback="loading">
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path='/' element={<MainPageLayout />}>
            <Route index element={<MainPage />}/>
            <Route path='/why-pmtools' element={<WhyPMToolsPage />}/>
            <Route path='/authors-and-history' element={<AuthorsAndHistory />}/>
          </Route>
          <Route path='/app' element={<AppLayout />}>
            <Route path='pca' element={<PCAPage />}/>
            <Route path='dir' element={<DIRPage />}/>
          </Route>
          <Route path='*' element={<NotFoundPage />}/>
        </Routes>
      </ThemeProvider>
    </Suspense>
  );
}

export default App;
