import React, { FC } from 'react';
import styles from './MainPage.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
} from '../../utils/ThemeConstants';
import { DynamicLogo } from '../../components/Main';

const MainPage: FC = ({}) => {
  const theme = useTheme();

  console.log(theme.palette.mode);
  
  return (
    <>
      <DynamicLogo />
    </>
    // <div 
    //   className={styles.mainPage}
    //   style={{backgroundColor: bgColorMain(theme.palette.mode)}}
    // >
    //   <DynamicLogo />
    // </div>
  )
}

export default MainPage;
