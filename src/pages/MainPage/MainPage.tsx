import React, { FC } from 'react';
import styles from './MainPage.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
} from '../../utils/ThemeConstants';

const MainPage: FC = ({}) => {
  const theme = useTheme();
  
  return (
    <div 
      className={styles.mainPage}
      style={{backgroundColor: bgColorMain(theme.palette.mode)}}
    >
      главная страница
    </div>
  )
}

export default MainPage;
