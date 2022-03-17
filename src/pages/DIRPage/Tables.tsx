import React, { FC, useEffect, useState } from 'react';
import styles from './DIRPage.module.scss';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import { useTheme } from '@mui/material/styles';
import { DataTableDIR, StatisticsDataTableDIR } from '../../components/Main';
import { IDirData, IPmdData, StatisitcsInterpretation } from "../../utils/GlobalTypes";
import {
  bgColorMain,
} from '../../utils/ThemeConstants';

interface ITables {
  dataToShow: IDirData | null;
}

const Tables: FC<ITables> = ({ dataToShow }) => {

  const theme = useTheme();
  
  const { currentInterpretation, currentFileInterpretations } = useAppSelector(state => state.pcaPageReducer);
  const [interpretations, setInterpretations] = useState<StatisitcsInterpretation[] | null>(null);

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
      <StatisticsDataTableDIR data={interpretations}/>
      <DataTableDIR data={dataToShow}/>
    </div>
  )
};

export default Tables;
