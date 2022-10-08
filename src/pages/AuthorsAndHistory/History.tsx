import React, { FC } from 'react';
import styles from './AuthorsAndHistory.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  textColor,
} from '../../utils/ThemeConstants';
import { Button, Typography } from '@mui/material';
import pmtoolsLogo from './pmtools_logo.png';
import { useMediaQuery } from 'react-responsive';
import { firstStepsImage, pmtoolsAlphaV1Image, pmtoolsAlphaV2Image, pmtoolsBetaImage, uralImage1, uralImage2, uralImage3, uralImage4 } from './assets';
import Carousel from '../../components/Sub/Carousel/Carousel';
import { useTranslation } from 'react-i18next';

const History = ({ show }: {show?: boolean}) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');
  const isSmallScreen = useMediaQuery({ query: '(max-width: 920px)' });

  return (
    <div className={styles.history} style={{display: show ? 'flex' : 'none'}}>
      <Typography variant='h4' color={textColor(theme.palette.mode)} textAlign='center' fontSize={isSmallScreen ? '30px' : '34px'}>
        {t('authorsAndHistoryPage.history.headline')} 
      </Typography>
      <Typography variant='body1' color={textColor(theme.palette.mode)} sx={{width: '100%', m: '10px 0px', fontStyle: 'italic'}}>
        {t('authorsAndHistoryPage.history.shortdesc')}
      </Typography>
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        {t('authorsAndHistoryPage.history.lines.first')}
      </Typography>
      <img 
        src={firstStepsImage} 
        alt={'Самые первые шаги в визуализации палеомагнитных данных'} 
        loading='lazy'
        className={styles.historyImage}
        style={{
          width: isSmallScreen ? '100%' : '60%',
        }}
      />
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        {t('authorsAndHistoryPage.history.lines.second')}
      </Typography>
      <img 
        src={pmtoolsAlphaV1Image} 
        alt={'Как выглядит начальная версия PMTools alpha'} 
        loading='lazy'
        className={styles.historyImage}
      />
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        {t('authorsAndHistoryPage.history.lines.third')}
      </Typography>
      <img 
        src={pmtoolsAlphaV2Image} 
        alt={'Как выглядит финальная версия PMTools alpha'} 
        loading='lazy'
        className={styles.historyImage}
      />
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        {t('authorsAndHistoryPage.history.lines.fourth')}
      </Typography>
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        {t('authorsAndHistoryPage.history.lines.fifth')}
      </Typography>
      <img 
        src={pmtoolsBetaImage} 
        alt={'Как выглядит PMTools beta'} 
        loading='lazy'
        className={styles.historyImage}
      />
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        {t('authorsAndHistoryPage.history.lines.sixth')}
      </Typography>
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        {t('authorsAndHistoryPage.history.lines.seventh')}
      </Typography>
      <div className={styles.carouselPhotos}>
        <Carousel 
          content={[
            <img 
              src={uralImage1} 
              alt={'Вид с массива Нурали на юго-восток'} 
              loading='lazy'
            />,
            <img 
              src={uralImage2} 
              alt={'Хребет Нурали'} 
              loading='lazy'
            />,
            <img 
              src={uralImage3} 
              alt={'Вид на массив Нурали'} 
              loading='lazy'
            />,
            <img 
              src={uralImage4} 
              alt={'Вид с массива Нурали на запад'} 
              loading='lazy'
            />
          ]}
        />
      </div>
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        {t('authorsAndHistoryPage.history.lines.eighth')}
      </Typography>
      <img 
        src={pmtoolsLogo} 
        alt={'PMTools: for paleomagnetism researchers'} 
        loading='lazy'
        className={styles.historyImage}
        style={{
          width: isSmallScreen ? '100%' : '60%',
        }}
      />
    </div>
  );
};

export default History;
