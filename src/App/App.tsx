import React, { Suspense, useEffect } from 'react';
import styles from './App.module.scss';
import { Route, Routes } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../services/store/hooks';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MainPageLayout, AppLayout } from '../components/Layouts';
import { MainPage, DIRPage, PCAPage, NotFoundPage, WhyPMToolsPage, AuthorsAndHistory } from '../pages';
import { useSystemTheme } from '../utils/GlobalHooks';
import { setColorMode } from '../services/reducers/appSettings';
import { setCurrentDIRid, setCurrentPMDid, setDirStatData, setTreatmentData } from '../services/reducers/parsedData';

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
  }, []);

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
