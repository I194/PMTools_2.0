
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


const Description = () => {

  const theme = useTheme();

  const content: Array<Content> = [
    {
      text: {
        title: 'Проводите компонентный анализ',
        description: 'Страница магнитных чисток (PCA) предоставляет классические инструменты для выделения компонент намагниченности. Работайте напрямую с коллекцией образцов и экспортируйте выделенные направления в любом удобном формате.'
      },
      image: theme.palette.mode === 'light' ? pca : pcaDark,
      compressedImage: theme.palette.mode === 'light' ? pcaCompressed : pcaDarkCompressed,
      align: 'left'
    },
    {
      text: {
        title: 'Изучайте распределения направлений',
        description: 'Страница статистики направлений (DIR) даёт возможность найти средние направления различными методами. И на этой же странице вы можете провести палеомагнитные статистические тесты для проверки своих гипотез.'
      },
      image: theme.palette.mode === 'light' ? dir : dirDark,
      compressedImage: theme.palette.mode === 'light' ? dirCompressed : dirDarkCompressed,
      align: 'right'
    },
    {
      text: {
        title: 'Находите виртуальные геомагнитные полюса',
        description: 'Для расчёта полюсов достаточно на странице DIR открыть соответствующий модуль и просто ввести или импортировать координаты точек отбора образцов (можно даже из XLSX файла). И полученные VGP можно тут же экспортировать в формате, подходящем для программы GPLates',
      },
      image: theme.palette.mode === 'light' ? vgp : vgpDark,
      compressedImage: theme.palette.mode === 'light' ? vgpCompressed : vgpDarkCompressed,
      align: 'left'
    },
    {
      text: {
        title: 'Взаимодействие с данными ещё не было столь простым',
        description: 'Все данные в PMTools представлены в виде таблиц и графиков, которые напрямую связаны между собой — вы можете выбирать нужные вам направления (точки) прямиком из таблиц, обводя их на графиках, или даже вводя их через в специальное поле.'
      },
      image: theme.palette.mode === 'light' ? selection : selectionDark,
      compressedImage: theme.palette.mode === 'light' ? selectionCompressed : selectionDarkCompressed,
      align: 'right'
    },
    {
      text: {
        title: 'Работайте с данными в любом формате',
        description: 'Встроенный в PMTools конвертер форматов хранения палеомагнитных данных позволяет вам импортировать классические форматы данных и экспортировать их в любой удобный формат, в том числе в Excel.'
      },
      image: theme.palette.mode === 'light' ? exportData : exportDataDark,
      compressedImage: theme.palette.mode === 'light' ? exportDataCompressed : exportDataDarkCompressed,
      align: 'left'
    },
    {
      text: {
        title: 'Забудьте о трудностях при работе с графикой',
        description: 'Все графики и диаграммы в PMTools написаны с нуля специально для отображения палеомагнитных данных — все они заранее подготовлены для использования в публикациях и презентациях, а при их экспорте вы получите SVG файл с понятной и легко редактируемой структурой.'
      },
      image: theme.palette.mode === 'light' ? exportGraphs : exportGraphsDark,
      compressedImage: theme.palette.mode === 'light' ? exportGraphsCompressed : exportGraphsDarkCompressed,
      align: 'right'
    },
    {
      text: {
        title: 'Комфортная работа в любое время суток',
        description: 'В PMTools вы можете переключиться на тёмную тему и комфортно работать в полной темноте.'
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
