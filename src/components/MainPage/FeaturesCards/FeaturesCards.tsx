
import React, { useEffect, useState } from 'react';
import styles from './FeaturesCards.module.scss';
import { Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { textColor, bgColorBlocks } from '../../../utils/ThemeConstants';
import FeatureCard, { Content } from './FeatureCard';
import { 
  pca,
  pcaCompressed,
  pcaDark,
  pcaDarkCompressed,
  dir,
  dirCompressed,
  dirDark,
  dirDarkCompressed,
  vgp,
  vgpCompressed,
  vgpDark,
  vgpDarkCompressed,
  selection,
  selectionCompressed,
  selectionDark,
  selectionDarkCompressed,
  exportData,
  exportDataCompressed,
  exportDataDark,
  exportDataDarkCompressed,
  exportGraphs,
  exportGraphsCompressed,
  exportGraphsDark,
  exportGraphsDarkCompressed,
  darkTheme,
  darkThemeCompressed,
  darkThemeDark,
  darkThemeDarkCompressed,
} from './assets';
import { useTranslation } from 'react-i18next';


const Description = () => {

  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');

  const content: Array<Content> = [
    {
      text: {
        title: t('mainPage.featuresCards.pca.title'),
        description: t('mainPage.featuresCards.pca.description')
      },
      image: theme.palette.mode === 'light' ? pca : pcaDark,
      compressedImage: theme.palette.mode === 'light' ? pcaCompressed : pcaDarkCompressed,
      align: 'left'
    },
    {
      text: {
        title: t('mainPage.featuresCards.dir.title'),
        description: t('mainPage.featuresCards.dir.description')
      },
      image: theme.palette.mode === 'light' ? dir : dirDark,
      compressedImage: theme.palette.mode === 'light' ? dirCompressed : dirDarkCompressed,
      align: 'right'
    },
    {
      text: {
        title: t('mainPage.featuresCards.vgp.title'),
        description: t('mainPage.featuresCards.vgp.description')
      },
      image: theme.palette.mode === 'light' ? vgp : vgpDark,
      compressedImage: theme.palette.mode === 'light' ? vgpCompressed : vgpDarkCompressed,
      align: 'left'
    },
    {
      text: {
        title: t('mainPage.featuresCards.selection.title'),
        description: t('mainPage.featuresCards.selection.description')
      },
      image: theme.palette.mode === 'light' ? selection : selectionDark,
      compressedImage: theme.palette.mode === 'light' ? selectionCompressed : selectionDarkCompressed,
      align: 'right'
    },
    {
      text: {
        title: t('mainPage.featuresCards.exportData.title'),
        description: t('mainPage.featuresCards.exportData.description')
      },
      image: theme.palette.mode === 'light' ? exportData : exportDataDark,
      compressedImage: theme.palette.mode === 'light' ? exportDataCompressed : exportDataDarkCompressed,
      align: 'left'
    },
    {
      text: {
        title: t('mainPage.featuresCards.exportGraphs.title'),
        description: t('mainPage.featuresCards.exportGraphs.description')
      },
      image: theme.palette.mode === 'light' ? exportGraphs : exportGraphsDark,
      compressedImage: theme.palette.mode === 'light' ? exportGraphsCompressed : exportGraphsDarkCompressed,
      align: 'right'
    },
    {
      text: {
        title: t('mainPage.featuresCards.darkTheme.title'),
        description: t('mainPage.featuresCards.darkTheme.description')
      },
      image: theme.palette.mode === 'light' ? darkTheme : darkThemeDark,
      compressedImage: theme.palette.mode === 'light' ? darkThemeCompressed : darkThemeDarkCompressed,
      align: 'left'
    },
  ];

  return (
    <div 
      className={styles.container}
      style={{
        // backgroundColor: bgColorBlocks(theme.palette.mode),
      }}
    >
      {
        content.map((card, index) => (
          <FeatureCard
            key={index}
            image={card.image}
            compressedImage={card.compressedImage}
            align={card.align}
            text={card.text}
          />
        ))
      }
    </div>
  );
};

export default Description;
