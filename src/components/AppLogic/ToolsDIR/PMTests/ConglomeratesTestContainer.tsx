import React, { FC, useEffect, useState } from 'react';
import styles from './PMTests.module.scss';
import { ConglomeratesTestResult, IDirData } from '../../../../utils/GlobalTypes';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  textColor,
} from '../../../../utils/ThemeConstants';
import { conglomeratesTest } from '../../../../utils/statistics/PMTests';
import { useTranslation } from 'react-i18next';

type Props = {
  dataToAnalyze: IDirData | null;
}

const ConglomeratesTestContainer = ({ dataToAnalyze }: Props) => {

  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');
  const [dataToShow, setDataToShow] = useState<ConglomeratesTestResult>();
  
  useEffect(() => {
    if (dataToAnalyze) {
      const conglomeratesTestResult = conglomeratesTest(dataToAnalyze);
      setDataToShow(conglomeratesTestResult);
    }; 
  }, [dataToAnalyze]);

  return (
    <div className={styles.result}>
      <div className={styles.resultRow}>
        <Typography variant='body1' color={textColor(theme.palette.mode)} mb='24px'>
          {t("pmtests.conglomerateTest.first")}
        </Typography>
      </div>
      <Typography variant='body1' color={textColor(theme.palette.mode)}>
        {t("pmtests.conglomerateTest.second")}
      </Typography>
      <div className={styles.resultRow}>
        <Typography variant='body1' color={textColor(theme.palette.mode)}>
          { dataToShow && dataToShow.resultDescription[t("pmtests.conglomerateTest.res") as 'en' | 'ru'] }
        </Typography>
      </div>
    </div>
  )
};

export default ConglomeratesTestContainer;
