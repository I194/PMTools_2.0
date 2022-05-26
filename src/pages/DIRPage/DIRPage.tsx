import React, { FC, useEffect, useState } from 'react';
import styles from './DIRPage.module.scss';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import { 
  addInterpretation, 
  setStatisticsMode, 
  showSelectionInput, 
  updateCurrentInterpretation 
} from '../../services/reducers/dirPage';
import { filesToData } from '../../services/axios/filesAndData';
import { IDirData } from '../../utils/GlobalTypes';
import calculateStatisticsDIR from '../../utils/statistics/calculateStatisticsDIR';
import Tables from './Tables';
import Graphs from './Graphs';
import { ToolsDIR } from '../../components/AppLogic';
import { useTheme } from '@mui/material/styles';
import { bgColorMain } from '../../utils/ThemeConstants';
import ModalWrapper from '../../components/Sub/Modal/ModalWrapper';
import UploadModal from '../../components/Sub/Modal/UploadModal/UploadModal';

const DIRPage: FC = ({}) => {

  const dispatch = useAppDispatch();
  
  const theme = useTheme();

  const files = useAppSelector(state => state.filesReducer.dirStatFiles);
  const { dirStatData, currentDataDIRid } = useAppSelector(state => state.parsedDataReducer);
  const { 
    statisticsMode, 
    selectedDirectionsIDs, 
    hiddenDirectionsIDs, 
    reversedDirectionsIDs,
    currentFileInterpretations,
    allInterpretations
  } = useAppSelector(state => state.dirPageReducer);

  const [dataToShow, setDataToShow] = useState<IDirData | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  useEffect(() => {
    if (files) dispatch(filesToData({files, format: 'dir'}));
  }, [files, files?.length]);

  useEffect(() => {
    if (dirStatData && dirStatData.length > 0) {
      const dirID = currentDataDIRid || 0;
      setDataToShow(dirStatData[dirID]);
    } else setDataToShow(null);
  }, [dirStatData, currentDataDIRid, hiddenDirectionsIDs]);

  useEffect(() => {
    if (statisticsMode && !selectedDirectionsIDs) dispatch(showSelectionInput(true));
    if (statisticsMode && selectedDirectionsIDs && selectedDirectionsIDs.length >= 2 && dataToShow) {
      const statistics = calculateStatisticsDIR(dataToShow, statisticsMode, selectedDirectionsIDs, reversedDirectionsIDs);
      statistics.interpretation.label = `${allInterpretations.length}${statistics.interpretation.label}/${currentFileInterpretations.length}`;
      dispatch(addInterpretation(statistics));
      dispatch(setStatisticsMode(null));
    } else dispatch(updateCurrentInterpretation());
  }, [statisticsMode, selectedDirectionsIDs, dataToShow]);

  useEffect(() => {
    if (!dataToShow) setShowUploadModal(true);
    else setShowUploadModal(false);
  }, [dataToShow]);

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
        <Graphs dataToShow={dataToShow}/>
      </div>
      <ModalWrapper
        open={showUploadModal}
        setOpen={setShowUploadModal}
        size={{width: '60vw', height: '60vh'}}
        showBottomClose
      >
        <UploadModal page='dir' />
      </ModalWrapper>
    </>
  )
}

export default DIRPage;
