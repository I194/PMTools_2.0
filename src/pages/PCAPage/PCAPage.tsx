import React, { FC, useEffect, useState } from 'react';
import styles from './PCAPage.module.scss';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import { filesToData } from '../../services/axios/filesAndData';
import { IPmdData } from '../../utils/GlobalTypes';
import { MetaDataTablePMD, ToolsPMD } from '../../components/Main';
import Graphs from './Graphs';
import Tables from './Tables';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
} from '../../utils/ThemeConstants';
import { addInterpretation, setStatisticsMode, showStepsInput, updateCurrentInterpretation } from '../../services/reducers/pcaPage';
import calculateStatisticsPMD from '../../utils/statistics/calculateStatisticsPMD';

const PCAPage: FC = ({}) => {

  const dispatch = useAppDispatch();
  
  const theme = useTheme();

  const files = useAppSelector(state => state.filesReducer.treatmentFiles);
  const { treatmentData, currentDataPMDid } = useAppSelector(state => state.parsedDataReducer);
  const { statisticsMode, selectedStepsIDs, hiddenStepsIDs, currentFileInterpretations } = useAppSelector(state => state.pcaPageReducer);

  const [dataToShow, setDataToShow] = useState<IPmdData | null>(null);

  useEffect(() => {
    if (files && !treatmentData) dispatch(filesToData({files, format: 'pmd'}));
  }, [files]);

  useEffect(() => {
    if (treatmentData && treatmentData.length > 0) {
      const pmdID = currentDataPMDid || 0;
      setDataToShow(treatmentData[pmdID]);
    } else setDataToShow(null);
  }, [treatmentData, currentDataPMDid, hiddenStepsIDs]);

  useEffect(() => {
    if (statisticsMode && !selectedStepsIDs) dispatch(showStepsInput(true));
    if (statisticsMode && selectedStepsIDs && selectedStepsIDs.length >= 2 && dataToShow) {
      const statistics = calculateStatisticsPMD(dataToShow, statisticsMode, selectedStepsIDs);
      statistics.interpretation.label += `_${currentFileInterpretations.length}`;
      dispatch(addInterpretation(statistics));
      dispatch(setStatisticsMode(null));
    } else dispatch(updateCurrentInterpretation());
  }, [statisticsMode, selectedStepsIDs, dataToShow]);

  return (
    <>
      <div 
        className={styles.controlPanel}
        style={{backgroundColor: bgColorMain(theme.palette.mode)}}
      >
        <MetaDataTablePMD data={dataToShow?.metadata}/>
        <ToolsPMD data={dataToShow}/>
      </div>
      <div 
        className={styles.data}
        style={{backgroundColor: bgColorMain(theme.palette.mode)}}
      > 
        <Tables dataToShow={dataToShow}/>
        <Graphs dataToShow={dataToShow}/>
      </div>
    </>
  )
};

export default PCAPage;
