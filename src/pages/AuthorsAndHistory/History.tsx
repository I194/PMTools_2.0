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
        PMTools создавалсь около трёх лет, и при этом пару раз переписывалась с нуля. И, разумеется, история разработки
        этой программы тесно переплетена с моей* личной, и потому весь дальнейший текст это не сухой набор фактов о разработке
        PMTools в хронологическом порядке, а скорее моё восприятие всего этого процесса разработки, как бы через призму моей жизни.
      </Typography>
      <Typography variant='body2' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        <b>*</b><i>"Я"</i> здесь и далее — это Иван Ефремов.
      </Typography>
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        Это был май 2019 года. И имелась крайне простая идея — написать небольшую программу, которая будет строить стреограммы
        по результатам магнитных чисток. Нужно это было, потому что все имеющиеся программы, которые делали в том числе
        и это, выдавали на экспорт не особо удобные для последующего использования стереограммы, которые надо было долго
        вручную доделывать в графическом редакторе. Для реализации я решил использовать Python, Matplotlib, Pandas и PyQt5.
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
        Создав это я понял, что PyQT5 меня не устраивает, как и Matplotlip. Я начал искать новые способы выполнения задачи.
        Поскольку на этот момент я хоть как-то понимал только Python и были какие-то остаточные знания по C++, я решил рассматривать способы реализации на этих языках. На C++ всё было очень усложнено и было ясно, что на реализацию на этом языке ушло бы слишком много времени и сил. 
        Потому я остановился на Python. Спустя пару недель поиска и анализа подходящих для этого решений, я выбрал Plotly. 
        Эта компания имела на тот момент в своём арсенале одноименную библиотеку для построения графиков и 
        зарождавшийся фреймворк для построения веб-приложений на Python — Dash. 
        Таким образом, вооружившись Plotly и Dash, за лето 2019 года я создал вот это: 
      </Typography>
      <img 
        src={pmtoolsAlphaV1Image} 
        alt={'Как выглядит начальная версия PMTools alpha'} 
        loading='lazy'
        className={styles.historyImage}
      />
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        А за последующие месяцы, в перервых между учёбой, довёл эту программу до такого состояния:
      </Typography>
      <img 
        src={pmtoolsAlphaV2Image} 
        alt={'Как выглядит финальная версия PMTools alpha'} 
        loading='lazy'
        className={styles.historyImage}
      />
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        Созданная программа была названа PMTools и она уже была чем-то большим, чем просто построителем стреограмм. 
        Это уже был веб-интерфейс для компонентного анализа и расчёта среднего по Фишеру, 
        также включающий в себя небольшой палеомагнитный калькулятор. 
        Уже тогда было ясно, что это не конечный продукт, а скорее alpha-версия будущей программы.
      </Typography>
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        Затем, где-то за месяц до лета 2020 года, ко мне пришло осознание, что чего-то действительного интересного при помощи
        Plotly и Dash я не создам — мне хотелось сильно кастомизировать все их графики и компоненты интерфейса, однако это 
        было почти невозможно. Так, в поисках нового решения, я "наткнулся" JavaScript. И затем были долгие недели тестирования 
        различных библиотек и фреймворков для построения графиков на JavaScript, и по итогу я выбрал HighCharts. А ещё я решил учесть старый запрос исследователей (кому как раз и нужна эта программа) — 
        сделать её десктопной, независимой от подключения к интернету. 
        И потому я нашёл и решил использовать Electron. 
        Всё лето 2020 года я <del>методом тыка</del> изучал JavaScript, а вместе с ним 
        Electron и Highcharts. По итогу получилась вот такая программа:
      </Typography>
      <img 
        src={pmtoolsBetaImage} 
        alt={'Как выглядит PMTools beta'} 
        loading='lazy'
        className={styles.historyImage}
      />
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        Новая версия PMTools (так я называл эту программу) уже позволяла проводить полный цикл палеомагнитных операций: 
        компонентный анализ, статистику направлений, расчёт полюсов. Она была десктопной и независимой от подключения к интернету.
        Этой версией PMTools уже активно пользовались исследователи и я вполне обоснованно именовал её beta-версией.
      </Typography>
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        <strong>Но она работала медленно.</strong> Весь последующий год у меня было множество конференций, 
        где я выступал с докладами про PMTools. 
        И в перерывах между конференциями и учёбой я пытался повысить производительность PMTools. Но безуспешно. 
        Тут стоит заметить, что хоть это и был 2020/2021 год, тем не менее,
        я активно использовал в PMTools jQuery и пытался реализовать модульность, при этом ничего в ней не понимая.
        Мне было ясно, что основная проблема для производительности — обилие ненужных ререндеров, но поскольку я слишком 
        сильно связал все свои "модули" друг с другом, избавиться от лишних ререндоров в полной мере я так и не смог.
        Спустя бесчисленное число безуспешных попыток, я сдался, выпустил последний апдейт PMTools beta и назвал её PMTools v.1.0.
        В течение 2 месяцев я не прикасался к PMTools, уехал в поля (как геолог) и не думал о разработке. 
        Своеобразный творческий отпуск.
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
        А потом мне стало интересно, как же всё-таки корректно реализовывать модульность в JavaScript приложениях. 
        Так, в поисках ответа, я нашёл React и осознал, что это то самое, что я так давно искал.
      </Typography>
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        Крайне удачно совпало, что, узнав про React и восхитившись им, я нашёл курс по нему, который смог меня заинтересовать и 
        при этом стартовал уже через неделю. Что это был за курс и от кого он был я указывать здесь не буду, но скажу точно, что
        после этого курса я и начал писать на стеке React/Redux, и сильно подтянул все свои разрозненные знания по
        JavaScript, и познакомился с TypeScript (<i>без которого теперь вообще не представляю адекватную фронтенд-разработку</i>). 
      </Typography>
      <Typography variant='h6' color={textColor(theme.palette.mode)} fontWeight={isSmallScreen ? '400' : '500'}>
        Вооружившись новыми знаниями и при этом начав параллельно работать как полноценный фронтенд-разработчик, я стал медленно, 
        но верно, с нуля переписывать весь функционал PMTools v.1.0. По итогу, в мае 2022 года, была доделана наконец та самая версия PMTools, в которой вы сейчас читаете этот текст. Формально, это PMTools v.2.0.
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
