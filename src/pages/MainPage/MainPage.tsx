import React, { FC } from 'react';
import styles from './MainPage.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  textColor,
} from '../../utils/ThemeConstants';
import { DynamicLogo } from '../../components/Main';
import pmtoolsLogo from './pmtools_logo.png';
import { Typography } from '@mui/material';

const MainPage: FC = ({}) => {
  const theme = useTheme();

  console.log(theme.palette.mode);
  
  return (
    <>
      <div className={styles.logo}>
        <img src={pmtoolsLogo} alt="Логотип" width='40%'/>
      </div>
      <DynamicLogo />
      <div className={styles.about}>
        <Typography color={textColor(theme.palette.mode)} textAlign='center'>
          Работайте с результатами палеомагнитных исследований в любой момент, в любом месте, с любого устройства.
        </Typography>
        <Typography color={textColor(theme.palette.mode)} textAlign='center'>
          И не беспокойтесь о защите данных.
        </Typography>
      </div>
    </>
  )
}

export default MainPage;
