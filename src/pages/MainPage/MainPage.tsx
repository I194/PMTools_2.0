import React, { FC } from 'react';
import styles from './MainPage.module.scss';
import { ZijdGraph } from '../../components/Graph';

const MainPage: FC = ({}) => {
  return (
    <div className={styles.mainPage}>
      <ZijdGraph graphId='zijd'/>
    </div>
  )
}

export default MainPage;
