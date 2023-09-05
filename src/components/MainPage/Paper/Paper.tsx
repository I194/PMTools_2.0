
import React from 'react';
import styles from './Paper.module.scss';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { bgColorBlocks, textColor } from '../../../utils/ThemeConstants';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from 'react-i18next';
import { DefaultButton } from '../../Common/Buttons';
import pmtoolsPaperEng from '../../../assets/IPSE798.pdf';
import pmtoolsPaperRu from '../../../assets/FZE0150.pdf';
import articleIcon from './assets/article.png';

const About = () => {

  
  const isSmallScreen = useMediaQuery({ query: '(max-width: 920px)' });
  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');

  const handleOpenPaperEng = () => {
    window.open(pmtoolsPaperEng, '_blank');
  }

  const handleOpenPaperRu = () => {
    window.open(pmtoolsPaperRu, '_blank');
  }

  return (
    <div 
      className={styles.articlesBlock}
      style={{
        backgroundColor: bgColorBlocks(theme.palette.mode),
      }}
    >
      <img src={articleIcon} alt="icon" width='72px' height='72px'/>
      <Typography variant='h5' color={textColor(theme.palette.mode)} textAlign='center' fontSize={isSmallScreen ? '24px' : '26px'} m='16px 0'>
        {t('mainPage.about.aboutPMToolsPaper')}
      </Typography>
      <div className={styles.articles}>
        <div className={styles.article}>
          <Typography variant='h5' color={textColor(theme.palette.mode)} textAlign='center' fontSize={isSmallScreen ? '24px' : '26px'}>
            {t('pmtoolsPaper.aboutRu')}
          </Typography>
          <DefaultButton variant='contained' onClick={handleOpenPaperRu}>
            {t('pmtoolsPaper.openArticleRu')}
          </DefaultButton>
          <Typography variant='h5' color={textColor(theme.palette.mode)} textAlign='center' fontSize={isSmallScreen ? '18px' : '21px'}>
            {t('pmtoolsPaper.citeRu')}
          </Typography>
        </div>
        <div className={styles.article}>
          <Typography variant='h5' color={textColor(theme.palette.mode)} textAlign='center' fontSize={isSmallScreen ? '24px' : '26px'}>
            {t('pmtoolsPaper.aboutEn')}
          </Typography>
          <DefaultButton variant='contained' onClick={handleOpenPaperEng}>
          {t('pmtoolsPaper.openArticleEn')}
          </DefaultButton>
          <Typography variant='h5' color={textColor(theme.palette.mode)} textAlign='center' fontSize={isSmallScreen ? '18px' : '21px'}>
            {t('pmtoolsPaper.citeEn')}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default About;
