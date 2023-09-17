import React, { FC, useState, useEffect } from 'react';
import styles from './MainPage.module.scss';
import Rive, { useRive } from '@rive-app/react-canvas';
import { useTheme } from '@mui/material/styles';
import {
  textColor,
} from '../../utils/ThemeConstants';
import PMToolsChartsLight from '../../assets/pmtools_charts_light.riv';
import PMToolsChartsDark from '../../assets/pmtools_charts_dark.riv';
import { DynamicLogo, NavPanel, About, Description, FeatureCards, Paper } from '../../components/MainPage';
import { Typography } from '@mui/material';

const MainPage: FC = ({}) => {
  const theme = useTheme();
  // const [logoCharts, setLogoCharts] = useState(theme.palette.mode === 'dark' ? PMToolsChartsDark : PMToolsChartsLight);

  // useEffect(() => {
  //   setLogoCharts(theme.palette.mode === 'dark' ? PMToolsChartsDark : PMToolsChartsLight);
  // }, [theme.palette.mode]);

  // const { rive, RiveComponent } = useRive({
  //   src: logoCharts,
  //   autoplay: true,
  // });

  return (
    <>
      <div className={styles.logo}>
        {/* <DynamicLogo /> // old logo */} 
        {/* <RiveComponent /> // the same as code below */} 
        {/* {
          theme.palette.mode === 'dark' // почему то не работает, не меняет тему
            ? <Rive src={PMToolsChartsDark} />
            : <Rive src={PMToolsChartsLight} />
        } */}
        <Rive src={PMToolsChartsDark} />
      </div>
      <About />
      <Paper />
      <Description />
      <FeatureCards />
    </>
  )
}

export default MainPage;
