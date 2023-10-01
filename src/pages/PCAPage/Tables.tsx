import React, { FC, useEffect, useState } from 'react';
import styles from './PCAPage.module.scss';
import { useAppSelector } from '../../services/store/hooks';
import { IPmdData, StatisitcsInterpretationFromPCA } from "../../utils/GlobalTypes";
import { DataTablePMD, StatisticsDataTablePMD } from '../../components/AppLogic';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
} from '../../utils/ThemeConstants';

interface ITables {
  dataToShow: IPmdData | null;
}

const Tables: FC<ITables> = ({ dataToShow }) => {

  const theme = useTheme();
  
  const { currentInterpretation, currentFileInterpretations } = useAppSelector(state => state.pcaPageReducer);
  const [interpretations, setInterpretations] = useState<StatisitcsInterpretationFromPCA[] | null>(null);

  useEffect(() => {
    if (currentFileInterpretations && currentFileInterpretations.length) setInterpretations(currentFileInterpretations);
    else if (currentInterpretation) setInterpretations([currentInterpretation]);
    else setInterpretations(null);
  }, [currentInterpretation, currentFileInterpretations]);

  return (
    <div 
      className={styles.tables}
      style={{backgroundColor: bgColorMain(theme.palette.mode)}}
    >
      <StatisticsDataTablePMD data={interpretations}/>
      <DataTablePMD data={dataToShow}/>
    </div>
  )
};

export default Tables;
