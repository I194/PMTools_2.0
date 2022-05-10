
import React, { useEffect, useState } from 'react';
import styles from './Footer.module.scss';
import { Divider, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { textColor, bgColorBlocks } from '../../../utils/ThemeConstants';

const Footer = () => {

  const theme = useTheme();

  return (
    <div 
      className={styles.container}
      style={{
        backgroundColor: bgColorBlocks(theme.palette.mode),
      }}
    >
      {/* <Divider /> */}
      <Typography variant='body2' color={textColor(theme.palette.mode)}>
        © 2022 PMTools 2.0. Все права защищены.
      </Typography>
      <div className={styles.rightBlock}>
        <Typography variant='body2' color={textColor(theme.palette.mode)}>
          Проект поставляется под лицензией MIT.
        </Typography>
      </div>
    </div>
  );
};

export default Footer;
