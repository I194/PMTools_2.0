import React, { useEffect, useState } from 'react';
import styles from './FeaturesCards.module.scss';
import { Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { textColor, bgColorBlocks } from '../../../utils/ThemeConstants';

export type Content = {
  text: {title: string, description: string};
  image: string,
  align: 'left' | 'right',
};

const FeatureCard = ({ text, image, align }: Content) => {
  
  const theme = useTheme();

  return (
    <div 
      className={styles.card}
      style={{
        flexDirection: align === 'left' ? 'row' : 'row-reverse',
      }}
    >
      <div 
        className={styles.cardText}
        style={{
          marginLeft: align === 'left' ? 0 : '64px',
          marginRight: align === 'left' ? '64px' : 0,
        }}
      >
        <Typography variant='h4' color={textColor(theme.palette.mode)}>
          {text.title}
        </Typography>
        <Typography variant='h6' color={textColor(theme.palette.mode)} mt='16px'>
          {text.description}
        </Typography>
      </div>
      <div 
        className={styles.cardImage}
        style={{
          // backgroundColor: bgColorBlocks(theme.palette.mode),
        }}
      >
        <img src={image} alt={text.title} width='100%'/>
      </div>
    </div>
  );
};

export default FeatureCard;

