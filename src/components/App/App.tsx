import React from 'react';
import styles from './App.module.scss';
import { Route, Routes } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { MainPage, DIRPage, PCAPage, NotFoundPage } from '../../pages';
import { ZijdGraph } from '../Graph';


function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<MainPage />}/>
        <Route path='pca' element={<PCAPage />}/>
        <Route path='dir' element={<DIRPage />}/>
        <Route path='*' element={<NotFoundPage />}/>
      </Route>
    </Routes>
  );
}

export default App;
