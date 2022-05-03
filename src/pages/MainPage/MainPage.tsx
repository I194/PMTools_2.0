import React, { FC } from 'react';
import styles from './MainPage.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
} from '../../utils/ThemeConstants';
import { DynamicLogo } from '../../components/Main';
import pmtoolsLogo from './pmtools_logo.png';

const MainPage: FC = ({}) => {
  const theme = useTheme();

  console.log(theme.palette.mode);
  
  return (
    <>
      <div className={styles.logo}>
        <img src={pmtoolsLogo} alt="Логотип" width={720}/>
      </div>
      <DynamicLogo />
    </>
  )
}

export default MainPage;
