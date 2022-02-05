import React from 'react';
import styles from './App.module.scss';
import { Route, Routes } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { MainPage, DIRPage, PCAPage, NotFoundPage } from '../../pages';


function App() {
  return (
    // <div className={styles.mainCointainer}>
    //   Hey
    // </div>
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
