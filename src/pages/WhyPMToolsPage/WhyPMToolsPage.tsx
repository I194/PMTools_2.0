import React, { FC } from 'react';
import styles from './WhyPMToolsPage.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  textColor,
} from '../../utils/ThemeConstants';
import { NavPanel, About, Description, FeatureCards, Footer } from '../../components/MainPage';
import { Typography } from '@mui/material';
import pmtoolsLogo from './pmtools_logo.png';
import { useMediaQuery } from 'react-responsive';

import {
  formats,
  formatsDark,
  hotkeys,
  hotkeysDark,
} from './assets';

import { 
  selection, 
  selectionDark,
  exportGraphs,
  exportGraphsDark,
} from '../../components/MainPage/FeaturesCards/assets';
import { useTranslation } from 'react-i18next';

const WhyPMToolsPage: FC = ({}) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');
  const isSmallScreen = useMediaQuery({ query: '(max-width: 920px)' });

  const formatsImage = theme.palette.mode === 'light' ? formats : formatsDark;
  const hotkeysImage = theme.palette.mode === 'light' ? hotkeys : hotkeysDark;
  const selectionImage = theme.palette.mode === 'light' ? selection : selectionDark;
  const exportGraphsImage = theme.palette.mode === 'light' ? exportGraphs : exportGraphsDark;

  return (
    <>
      <div className={styles.logo}>
        <img src={pmtoolsLogo} alt="PMTools logo" width='720'/>
      </div>
      <div className={styles.about}>
        <Typography variant='h4' color={textColor(theme.palette.mode)} textAlign='center' fontSize={isSmallScreen ? '30px' : '34px'}>
          {t('whyPMToolsPage.headline')}
        </Typography>
        <Typography variant='h5' color={textColor(theme.palette.mode)} sx={{width: '100%', m: '10px 0px'}} fontSize={isSmallScreen ? '24px' : '28px'}>
          {t('whyPMToolsPage.importAndExport.title')}
        </Typography>
        <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
          {t('whyPMToolsPage.importAndExport.lines.first')}
          <ul style={{margin: '10px 0px'}}>
            <li>.pmd</li>
            <li>.squid</li>
            <li>.rs3</li>
            <li>.dir</li>
            <li>.pmm</li>
          </ul>
          {t('whyPMToolsPage.importAndExport.lines.second')}
        </Typography>
        <img 
          src={formatsImage} 
          alt={'Форматы данных'} 
          loading='lazy'
          width='100%'
        />
        <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
          {t('whyPMToolsPage.importAndExport.lines.third')}
        </Typography>
        <Typography variant='h5' color={textColor(theme.palette.mode)} sx={{width: '100%', m: '10px 0px'}} fontSize={isSmallScreen ? '24px' : '28px'}>
          {t('whyPMToolsPage.graphics.title')}
        </Typography>
        <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
          {t('whyPMToolsPage.graphics.lines.third')}
        </Typography>
        <img 
          src={exportGraphsImage}
          alt={'Графики'}
          loading='lazy'
          width='100%'
        />
        <Typography variant='h5' color={textColor(theme.palette.mode)} sx={{width: '100%', m: '10px 0px'}} fontSize={isSmallScreen ? '24px' : '28px'}>
          {t('whyPMToolsPage.dataManipulation.title')}
        </Typography>
        <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
          {t('whyPMToolsPage.dataManipulation.lines.first')}
        </Typography>
        <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
          {t('whyPMToolsPage.dataManipulation.lines.second')}
        </Typography>
        <img 
          src={selectionImage} 
          alt={'Взаимодействие с данными'}
          loading='lazy'
          width='100%'
        />
        <Typography variant='h5' color={textColor(theme.palette.mode)} sx={{width: '100%', m: '10px 0px'}} fontSize={isSmallScreen ? '24px' : '28px'}>
          {t('whyPMToolsPage.hotkeys.title')}
        </Typography>
        <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
          {t('whyPMToolsPage.hotkeys.lines.first')}
        </Typography>
        <img 
          src={hotkeysImage}
          alt={'Горячие клавиши'} 
          loading='lazy'
          width='100%'
        />
      </div>
    </>
  )
}

export default WhyPMToolsPage;
