import React, { FC, useEffect } from 'react';
import styles from './PCAPage.module.scss';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import { IPmdData } from '../../utils/files/fileManipulations';
import { useTheme } from '@mui/material/styles';
import { DataTablePMD, StatisticsDataTablePMD } from '../../components/Main';
import {
  bgColorMain,
  bgColorBlocks,
  boxShadowStyle,
} from '../../utils/ThemeConstants';

interface ITables {
  dataToShow: IPmdData | null;
}

const Tables: FC<ITables> = ({ dataToShow }) => {

  const disptach = useAppDispatch();
  
  const theme = useTheme();
  
  const interpretation = useAppSelector(state => state.pcaPageReducer.currentInterpretation);
  const interpretations = interpretation ? [interpretation] : null;

  return (
    <div 
      className={styles.tables}
      style={{backgroundColor: bgColorMain(theme.palette.mode)}}
    >
      <div 
        className={styles.tableSmall}
        style={{
          backgroundColor: bgColorBlocks(theme.palette.mode),
          WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
          MozBoxShadow: boxShadowStyle(theme.palette.mode),
          boxShadow: boxShadowStyle(theme.palette.mode),
        }}
      >
        <StatisticsDataTablePMD data={interpretations}/>
      </div>
      <DataTablePMD data={dataToShow}/>
    </div>
  )
};

export default Tables;
