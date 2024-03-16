
import React, { useEffect, useState } from 'react';
import styles from './Carousel.module.scss';
import { Typography, Button, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';

type Content = Array<React.ReactNode>;

const Carousel = ({content}: {content: Content}) => {
  
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
      { content[tabIndex] }
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

export default Carousel;
