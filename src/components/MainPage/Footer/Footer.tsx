
import React, { useEffect, useState } from 'react';
import styles from './Footer.module.scss';
import { Divider, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { textColor, bgColorBlocks } from '../../../utils/ThemeConstants';
import { useTranslation } from 'react-i18next';

const Footer = () => {

  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');

  return (
    <div 
      className={styles.container}
      style={{
        backgroundColor: bgColorBlocks(theme.palette.mode),
      }}
    >
      {/* <Divider /> */}
      <Typography variant='body2' color={textColor(theme.palette.mode)}>
        {t('mainLayout.footer.rights')}
      </Typography>
      <div className={styles.rightBlock}>
        <Typography variant='body2' color={textColor(theme.palette.mode)}>
          {t('mainLayout.footer.license')}
        </Typography>
      </div>
    </div>
  );
};

export default Footer;
