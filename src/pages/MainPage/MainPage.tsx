import React, { FC } from 'react';
import styles from './MainPage.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  textColor,
} from '../../utils/ThemeConstants';
import { DynamicLogo, NavPanel, About, Description, FeatureCards, Footer } from '../../components/MainPage';
import { Typography } from '@mui/material';

const MainPage: FC = ({}) => {
  const theme = useTheme();
  
  return (
    <>
      <NavPanel />
      <div className={styles.logo}>
        <DynamicLogo />
      </div>
      <About />
      <Description />
      <FeatureCards />
      <Footer />
    </>
  )
}

export default MainPage;
