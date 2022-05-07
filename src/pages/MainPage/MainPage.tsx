import React, { FC } from 'react';
import styles from './MainPage.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  textColor,
} from '../../utils/ThemeConstants';
import { DynamicLogo, NavPanel, About, Description } from '../../components/MainPage';
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
    </>
  )
}

export default MainPage;
