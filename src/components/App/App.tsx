import React from 'react';
import styles from './App.module.scss';
import { Route, Routes } from 'react-router-dom';
import Layout from '../Layout/Layout';

function App() {
  return (
    // <div className={styles.mainCointainer}>
    //   Hey
    // </div>
    <Routes>
      <Route path='/' element={<Layout />}>

      </Route>
    </Routes>
  );
}

export default App;
