import React, { FC, lazy, Suspense } from 'react';
import styles from './MainPage.module.scss';
import PMToolsChartsDark from '../../assets/pmtools_charts_dark.riv';
import { About, Description, FeatureCards, Paper } from '../../components/MainPage';
import Helper from '../../components/MainPage/Helper/Helper';

const Rive = lazy(() => import('@rive-app/react-canvas').then(mod => ({ default: mod.default })));

const MainPage: FC = ({}) => {
  return (
    <>
      <div className={styles.logo}>
        <Suspense fallback={<div style={{ width: '350px', height: '350px' }} />}> 
          <Rive src={PMToolsChartsDark} />
        </Suspense>
      </div>
      <About />
      <Paper />
      <Description />
      <FeatureCards />
      <Helper />
    </>
  )
}

export default MainPage;
