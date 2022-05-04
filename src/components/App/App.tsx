import React from 'react';
import styles from './App.module.scss';
import { Route, Routes } from 'react-router-dom';
import { useAppSelector } from '../../services/store/hooks';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MainPageLayout, AppLayout } from '../Layout';
import { MainPage, DIRPage, PCAPage, NotFoundPage } from '../../pages';

function App() {
  
  const { colorMode } = useAppSelector(state => state.appSettingsReducer);

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
