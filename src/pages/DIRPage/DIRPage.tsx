import React, { FC, useEffect, useState } from 'react';
import styles from './DIRPage.module.scss';
import { useTheme } from '@mui/material/styles';
import ToolsDIR from '../../components/Main/ToolsDIR/ToolsDIR';
import { filesToData } from '../../services/axios/filesAndData';
import { addInterpretation, setStatisticsMode, showSelectionInput, updateCurrentInterpretation } from '../../services/reducers/dirPage';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import { IDirData } from '../../utils/GlobalTypes';
import { bgColorMain } from '../../utils/ThemeConstants';
import Tables from './Tables';


const DIRPage: FC = ({}) => {

  const dispatch = useAppDispatch();
  
  const theme = useTheme();

  const files = useAppSelector(state => state.filesReducer.dirStatFiles);
  const { dirStatData, currentDataDIRid } = useAppSelector(state => state.parsedDataReducer);
  const { 
    statisticsMode, 
    selectedDirectionsIDs, 
    hiddenDirectionsIDs, 
    currentFileInterpretations 
  } = useAppSelector(state => state.dirPageReducer);

  const [dataToShow, setDataToShow] = useState<IDirData | null>(null);

  useEffect(() => {
    if (files && !dirStatData) dispatch(filesToData({files, format: 'dir'}));
  }, [files]);

  useEffect(() => {
    if (dirStatData && dirStatData.length > 0) {
      const dirID = currentDataDIRid || 0;
      setDataToShow(dirStatData[dirID]);
    } else setDataToShow(null);
  }, [dirStatData, currentDataDIRid, hiddenDirectionsIDs]);

  useEffect(() => {
    if (statisticsMode && !selectedDirectionsIDs) dispatch(showSelectionInput(true));
    if (statisticsMode && selectedDirectionsIDs && selectedDirectionsIDs.length >= 2 && dataToShow) {
      // const statistics = calculateStatisticsPMD(dataToShow, statisticsMode, selectedDirectionsIDs);
      // statistics.interpretation.label += `_${currentFileInterpretations.length}`;
      // dispatch(addInterpretation(statistics));
      dispatch(setStatisticsMode(null));
    } else dispatch(updateCurrentInterpretation());
  }, [statisticsMode, selectedDirectionsIDs, dataToShow]);

  return (
    <>
      <div 
        className={styles.controlPanel}
        style={{backgroundColor: bgColorMain(theme.palette.mode)}}
      >
        <ToolsDIR data={dataToShow}/>
      </div>
      <div 
        className={styles.data}
        style={{backgroundColor: bgColorMain(theme.palette.mode)}}
      > 
        <Tables dataToShow={dataToShow}/>
      </div>
    </>
  )
}

export default DIRPage;
