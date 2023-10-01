
import React, { useEffect, useState } from 'react';
import styles from './Description.module.scss';
import { Typography, Button, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { textColor, bgColorBlocks } from '../../../utils/ThemeConstants';
import tools from './assets/tools.png';
import privacy from './assets/privacy.png';
import modules from './assets/modules.png';
import table from './assets/table.png';
import graph from './assets/graph.png';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import { useTranslation } from 'react-i18next';

type Content = Array<{
  text: string,
  icon: string,
}>;

const PrettyTabs = ({content}: {content: Content}) => {
  
  const theme = useTheme();

  const [tabIndex, setTabIndex] = useState<number>(0);

  const nextTabIndex = (prevTabIndex: number) => {
    if (tabIndex === content.length - 1) {
      return 0;
    } else {
      return prevTabIndex + 1;
    }
  };

  const prevTabIndex = (prevTabIndex: number) => {
    if (tabIndex === 0) {
      return content.length - 1;
    } else {
      return prevTabIndex - 1;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTabIndex((prevIndex) => nextTabIndex(prevIndex));
    }, 6000);
    return () => clearInterval(interval);
  }, [tabIndex]);

  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
      setTouchStart(e.targetTouches[0].clientX);
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
      setTouchEnd(e.targetTouches[0].clientX);
  }

  function handleTouchEnd() {
    if (touchStart - touchEnd > 150) {
      // do your stuff here for left swipe
      setTabIndex((prevIndex) => nextTabIndex(prevIndex));
    } 

    if (touchStart - touchEnd < -150) {
      // do your stuff here for right swipe
      setTabIndex((prevIndex) => prevTabIndex(prevIndex));
    }
  }

  return (
    <div 
      className={styles.tabs}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.icon}>
        <img src={content[tabIndex].icon} alt="icon" width='64px' height='64px'/>
      </div>
      <Typography variant='h5' color={textColor(theme.palette.mode)} textAlign='center'>
        { content[tabIndex].text }
      </Typography>
      <div className={styles.indicator}>
        {
          content.map((tabContent, index) => (
            <div 
              className={`${styles.indicatorItem} ${tabIndex === index ? styles.active : ''}`}
              onClick={() => setTabIndex(index)}
              style={{
                width: `calc(72% / ${content.length})`,
                backgroundColor: theme.palette.mode === 'dark' ? '#fff' : '#474c50',
              }}
            />
          ))
        }
      </div>
      <IconButton className={styles.controlRight} onClick={() => setTabIndex(nextTabIndex(tabIndex))}>
        <ArrowForwardIosRoundedIcon />
      </IconButton>
      <IconButton className={styles.controlLeft} onClick={() => setTabIndex(prevTabIndex(tabIndex))}>
        <ArrowBackIosRoundedIcon />
      </IconButton>
    </div>
  );
};

const Description = () => {

  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');

  const content: Content = [
    {
      text: t('mainPage.description.tools'),
      icon: tools,
    },
    {
      text: t('mainPage.description.privacy'),
      icon: privacy,
    },
    {
      text: t('mainPage.description.modules'),
      icon: modules,
    },
    {
      text: t('mainPage.description.table'),
      icon: table,
    },
    {
      text: t('mainPage.description.graph'),
      icon: graph,
    }
  ];

  return (
    <div 
      className={styles.container}
      style={{
        backgroundColor: bgColorBlocks(theme.palette.mode),
      }}
    >
      <PrettyTabs content={content} />
    </div>
  );
};

export default Description;
