import React, { FC } from 'react';
import styles from './MainPage.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  textColor,
} from '../../utils/ThemeConstants';
import { DynamicLogo, NavPanel } from '../../components/MainPage';
import { Typography } from '@mui/material';

const MainPage: FC = ({}) => {
  const theme = useTheme();

  console.log(theme.palette.mode);
  
  return (
    <>
      <NavPanel />
      <div className={styles.logo}>
        {/* <img src={pmtoolsLogo} alt="Логотип" width='42%'/> */}
        <DynamicLogo />
      </div>
      <div className={styles.about}>
        <Typography variant='h3' color={textColor(theme.palette.mode)} textAlign='center' mb='16px'>
          Работайте с результатами палеомагнитных исследований. 
        </Typography>
        <Typography variant='h4' color={textColor(theme.palette.mode)} textAlign='center' mb='16px'>
          В любое время, в любом месте, с любого устройства.
        </Typography>
        <Typography variant='h4' color={textColor(theme.palette.mode)} textAlign='center'>
          И не беспокойтесь о защите данных.
        </Typography>
      </div>
    </>
  )
}

export default MainPage;
