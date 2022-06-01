import React, { FC } from 'react';
import styles from './WhyPMToolsPage.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  textColor,
} from '../../utils/ThemeConstants';
import { DynamicLogo, NavPanel, About, Description, FeatureCards, Footer } from '../../components/MainPage';
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

const WhyPMToolsPage: FC = ({}) => {
  const theme = useTheme();
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
          PMTools — новейшее программное обеспечение для статистической обработки и визуализации палеомагнитных данных 
        </Typography>
        <Typography variant='h5' color={textColor(theme.palette.mode)} sx={{width: '100%', m: '10px 0px'}} fontSize={isSmallScreen ? '24px' : '28px'}>
          Импорт и экспорт данных
        </Typography>
        <Typography variant='h6' color={textColor(theme.palette.mode)}>
          PMTools позволяет вам работать с такими форматами, как:
          <ul style={{margin: '10px 0px'}}>
            <li>.pmd</li>
            <li>.squid</li>
            <li>.rs3</li>
            <li>.dir</li>
            <li>.pmm</li>
          </ul>
          а также с их структурными аналогами в форматах <strong>.csv</strong> и <strong>.xlsx</strong>.
          Более того, все эти форматы доступны не только для импорта, но и для экспорта. То есть вы можете загрузить свой
          .pmd или .dir файл и затем экспортировать его как .xlsx, получив таким образом все преимущества работы с данными в Microsoft Excel. 
          Обратное также возможно!
        </Typography>
        <img 
          src={formatsImage} 
          alt={'Форматы данных'} 
          loading='lazy'
          width='100%'
        />
        <Typography variant='h6' color={textColor(theme.palette.mode)}>
          Более того, вы можете экспортировать данные по рассчитанным виртуальным геомагнитным полюсам (VGP) напрямую в форматах <strong>.gpml</strong> и <strong>.vgp</strong>, 
          которые напрямую поддерживаются соответственно программами GPlates и GMAP.
        </Typography>
        <Typography variant='h5' color={textColor(theme.palette.mode)} sx={{width: '100%', m: '10px 0px'}} fontSize={isSmallScreen ? '24px' : '28px'}>
          Работа с графикой
        </Typography>
        <Typography variant='h6' color={textColor(theme.palette.mode)}>
          Все графики и диаграммы, получаемые в ходе работы с данными в PMTools, максимально подготовлены для прямого использования их в статьях и презентациях. 
          К тому же они являются векторными и могут быть легко открыты и отредактированы в любом векторном графическом редакторе.
        </Typography>
        <img 
          src={exportGraphsImage}
          alt={'Графики'}
          loading='lazy'
          width='100%'
        />
        <Typography variant='h5' color={textColor(theme.palette.mode)} sx={{width: '100%', m: '10px 0px'}} fontSize={isSmallScreen ? '24px' : '28px'}>
          Взаимодействие с данными
        </Typography>
        <Typography variant='h6' color={textColor(theme.palette.mode)}>
          Взаимодействие со всеми импортированными данными в PMTools основано на простой концепции: любое направление (точку) можно "выбрать". 
          Вы можете выбрать направления (точки) прямо на графике, можете выбрать через таблицу, а можете и вовсе ввести их порядковые номера в специальное окно. Полная свобода выбора! 
        </Typography>
        <Typography variant='h6' color={textColor(theme.palette.mode)}>
          При этом, взаимодествуя с данными через графики, вы можете с комфортом использовать масштабирование и перемещение области видимости.
          А взаимодействуя с таблицами, можете фильтровать данные как вам угодно, по абсолютно любым столбцам и с обилием условий. 
        </Typography>
        <img 
          src={selectionImage} 
          alt={'Взаимодействие с данными'}
          loading='lazy'
          width='100%'
        />
        <Typography variant='h5' color={textColor(theme.palette.mode)} sx={{width: '100%', m: '10px 0px'}} fontSize={isSmallScreen ? '24px' : '28px'}>
          Горячие клавиши
        </Typography>
        <Typography variant='h6' color={textColor(theme.palette.mode)}>
          Управление PMTools может осуществляться не только при помощи классического взаимодействия с графическим интерфейсом, 
          но и при помощи горячих клавиш, которые, для вашего удобства, были частично заимствованы из пакета программ Р. Энкина для OS DOS, 
          и в то же время являются редактируемыми — подстраивайте управления под себя!
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
