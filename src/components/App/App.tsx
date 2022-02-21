import React from 'react';
import styles from './App.module.scss';
import { Route, Routes } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { MainPage, DIRPage, PCAPage, NotFoundPage } from '../../pages';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAppSelector } from '../../services/store/hooks';

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
        <Route path='/' element={<Layout />}>
          <Route index element={<MainPage />}/>
          <Route path='pca' element={<PCAPage />}/>
          <Route path='dir' element={<DIRPage />}/>
          <Route path='*' element={<NotFoundPage />}/>
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
