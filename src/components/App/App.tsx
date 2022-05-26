import React, { useEffect } from 'react';
import styles from './App.module.scss';
import { Route, Routes } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MainPageLayout, AppLayout } from '../Layouts';
import { MainPage, DIRPage, PCAPage, NotFoundPage } from '../../pages';
import { useSystemTheme } from '../../utils/GlobalHooks';
import { setColorMode } from '../../services/reducers/appSettings';

function App() {

  const dispatch = useAppDispatch();
  
  const { colorMode, rememberColorMode } = useAppSelector(state => state.appSettingsReducer);
  const systemTheme = useSystemTheme();

  // useEffect(() => {
  //   if (!rememberColorMode) dispatch(setColorMode(systemTheme));
  // }, [systemTheme, rememberColorMode]);
  
  useEffect(() => {
    console.log('color', localStorage)
    const previousColorMode = localStorage.getItem('colorMode') || 'light';
    dispatch(setColorMode(previousColorMode));
  }, []);

  const theme = createTheme({
    palette: {
      mode: colorMode
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path='/' element={<MainPageLayout />}>
          <Route index element={<MainPage />}/>
        </Route>
        <Route path='/app' element={<AppLayout />}>
          <Route path='pca' element={<PCAPage />}/>
          <Route path='dir' element={<DIRPage />}/>
        </Route>
        <Route path='*' element={<NotFoundPage />}/>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
