import React from 'react';
import styles from './AuthorsAndHistory.module.scss';
import { useTheme } from '@mui/material/styles';
import { textColor } from '../../utils/ThemeConstants';
import { Button, Typography } from '@mui/material';
import { useMediaQuery } from 'react-responsive';

import { myImage, RVImage } from './assets';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageTwoToneIcon from '@mui/icons-material/LanguageTwoTone';
import { useTranslation } from 'react-i18next';

const Authors = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');
  const isSmallScreen = useMediaQuery({ query: '(max-width: 920px)' });

  const onClickExternal = (to: string) => {
    window.open(to, '_blank');
  };

  return (
    <div className={styles.authors}>
      <Typography variant='h4' color={textColor(theme.palette.mode)} textAlign='center' fontSize={isSmallScreen ? '30px' : '34px'} mb='16px'>
        {t('authorsAndHistoryPage.headline')}
      </Typography>
      <div className={styles.authorBlock}>
        <img 
          src={myImage} 
          alt={'Иван Ефремов'} 
          loading='lazy'
          className={styles.authorImage}
        />
        <div className={styles.infoBlock}>
          <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'} >
            {t('authorsAndHistoryPage.ie.whois')} 
          </Typography>
          <Typography variant='caption' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
            {t('authorsAndHistoryPage.ie.about')} 
          </Typography>
          <Button
            variant="text" 
            color={'primary'}
            sx={{
              textTransform: 'none',
              marginRight: '16px',
              borderRadius: '18px',
              fontWeight: 500,
              fontSize: '16px',
              width: 'fit-content',
            }}
            component="span"
            endIcon={<LinkedInIcon />}
            onClick={() => onClickExternal('https://www.linkedin.com/in/i1948374/')}
          >
              LinkedIn
          </Button>
          <Button
            variant="text" 
            color={'primary'}
            sx={{
              textTransform: 'none',
              marginRight: '16px',
              borderRadius: '18px',
              fontWeight: 500,
              fontSize: '16px',
              width: 'fit-content',
            }}
            component="span"
            endIcon={<GitHubIcon />}
            onClick={() => onClickExternal('https://github.com/I194')}
          >
              GitHub
          </Button>
        </div>
      </div>
      <div className={styles.authorBlock}>
        <img 
          src={RVImage} 
          alt={'Роман Веселовский'} 
          loading='lazy'
          className={styles.authorImage}
        />
        <div className={styles.infoBlock}>
          <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
            {t('authorsAndHistoryPage.rv.whois')}   
          </Typography>
          <Typography variant='caption' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
            {t('authorsAndHistoryPage.rv.about')}  
          </Typography>
          <Button
            variant="text" 
            color={'primary'}
            sx={{
              textTransform: 'none',
              marginRight: '16px',
              borderRadius: '18px',
              fontWeight: 500,
              fontSize: '16px',
              width: 'fit-content',
            }}
            component="span"
            endIcon={<LanguageTwoToneIcon />}
            onClick={() => onClickExternal('https://ifz.ru/institut/sotrudniki/veselovskij-roman-vitalevich')}
          >
              ifz.ru
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Authors;
