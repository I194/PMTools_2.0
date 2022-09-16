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

const History = ({ show }: {show?: boolean}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery({ query: '(max-width: 920px)' });

  return (
    <div className={styles.history} style={{display: show ? 'flex' : 'none'}}>
      <Typography variant='h4' color={textColor(theme.palette.mode)} textAlign='center' fontSize={isSmallScreen ? '30px' : '34px'}>
        История создания PMTools 
      </Typography>
      <Typography variant='body1' color={textColor(theme.palette.mode)} sx={{width: '100%', m: '10px 0px', fontStyle: 'italic'}}>
        PMTools создавалсь чуть больше 2 лет, и при этом пару раз переписывалась с нуля.
      </Typography>
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        Это был май 2019 года. И имелась крайне простая идея — написать небольшую программу, которая будет строить стреограммы
        по результатам магнитных чисток. Нужно это было, потому что все имеющиеся программы, которые делали в том числе
        и это, выдавали на экспорт не особо удобные для последующего использования стереограммы, которые надо было долго
        вручную доделывать в графическом редакторе. Для реализации было решено использовать Python, Matplotlib, Pandas и PyQt5.
        Вот как примерно выглядели результаты недельной работы над этим:
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
        Создав это стало понятно, что PyQT5 не подходит для поставленной задачи, как и Matplotlip. Потому начались поиски новых способов выполнения задачи.
        Рассматривались варианты на языках Python и C++. Все решения на C++ были чрезмерно сложными и было ясно, что на реализацию на этом языке ушло бы слишком много времени и сил. 
        Потому был выбран Python. Спустя пару недель поиска и анализа подходящих для этого решений, среди библиотек и фреймворков выбор пал на Plotly. 
        Эта компания имела на тот момент в своём арсенале одноименную библиотеку для построения графиков и 
        зарождавшийся фреймворк для построения веб-приложений на Python — Dash. 
        Таким образом, вооружившись Plotly и Dash, за лето 2019 года было создано вот это: 
      </Typography>
      <img 
        src={pmtoolsAlphaV1Image} 
        alt={'Как выглядит начальная версия PMTools alpha'} 
        loading='lazy'
        className={styles.historyImage}
      />
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        А за последующие месяцы в медленнем темпе производились небольшие доработки и вносились небольшие изменения:
      </Typography>
      <img 
        src={pmtoolsAlphaV2Image} 
        alt={'Как выглядит финальная версия PMTools alpha'} 
        loading='lazy'
        className={styles.historyImage}
      />
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        Созданная программа была названа PMTools и она уже была чем-то большим, чем просто построителем стреограмм. 
        Это уже было web-приложение для компонентного анализа, также оно давало возможность произвести расчёт среднего по Фишеру и построение соответствующей стереограммы,
        а также был создан небольшой палеомагнитный калькулятор. 
        Однако, быстро стало понятно, что это не конечный продукт, а скорее alpha-версия.
      </Typography>
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        До лета 2020 года было нужно решить, как делать следующую версию PMTools. Было понятно, что нечто действительно функциональное при помощи
        Plotly и Dash создать будет трудно, поскольку кастомизация всех встроенных графиков и других компонентов была бы слишком обширной и порой даже невыполнимой.
        Было принято решение написать следующую версию на чистом JavaScript. Как ориентир было взято аналогичное web-приложение с сайта paleomagnetism.org.
        Для ускорения разработки графики было решено строить при помощи готовых инструментов, был произведён анализ различных библиотек и фреймворков для построения графиков на JavaScript, и по итогу была выбрана библиотека HighCharts. 
        При этом исследователи, для кого создавалась PMTools, просили сделать её десктопной, независимой от подключения к интернету. 
        И потому было решено использовать Electron. 
        За лето 2020 получилось следующее:
      </Typography>
      <img 
        src={pmtoolsBetaImage} 
        alt={'Как выглядит PMTools beta'} 
        loading='lazy'
        className={styles.historyImage}
      />
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        Новая версия PMTools уже позволяла проводить полный цикл палеомагнитных операций: 
        компонентный анализ, статистику направлений, расчёт полюсов. Она была десктопной и независимой от подключения к интернету.
        Этой версией PMTools уже активно пользовались исследователи. Версия была обозначена как beta.
      </Typography>
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        <strong>Однако были проблемы с производительностью.</strong> Тут стоит заметить, что хоть это и был 2020/2021 год, тем не менее,
        в PMTools широко использовалась библиотека jQuery и при этом были попытки реализовать модульность, которая, увы, не увенчалась успехом из-за архитектурных проблем на всех уровнях программы.
        Далее у автора был, в некотором смысле, творческий отпуск:
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
        После этого отпуска было решено переписать PMTools на стеке TypeScript/React/Redux, сделать её полноценным web-приложением и временно отказаться от идеи десктопного приложения.
        В промежутке с февраля 2021 по май 2022 PMTools была создана с нуля на указанном стеке технологий, при этом все графики было решено сделать самостоятельно, без использования каких либо библиотек для их построения,
        поскольку именно при такой реализации достигался полный контроль за отображением данных. 
        По итогу, в мае 2022 года, состоялся релиз PMTools v.2.0.
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
