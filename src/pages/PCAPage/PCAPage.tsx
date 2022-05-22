import React, { FC, useEffect, useState } from 'react';
import styles from './PCAPage.module.scss';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import { 
  addInterpretation, 
  setStatisticsMode, 
  showStepsInput, 
  updateCurrentInterpretation 
} from '../../services/reducers/pcaPage';
import { filesToData } from '../../services/axios/filesAndData';
import { IPmdData } from '../../utils/GlobalTypes';
import calculateStatisticsPMD from '../../utils/statistics/calculateStatisticsPMD';
import { MetaDataTablePMD, ToolsPMD } from '../../components/AppLogic';
import Graphs from './Graphs';
import Tables from './Tables';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
} from '../../utils/ThemeConstants';
import ModalWrapper from '../../components/Sub/Modal/ModalWrapper';
import UploadModal from '../../components/Sub/Modal/UploadModal/UploadModal';

const PCAPage: FC = ({}) => {

  const dispatch = useAppDispatch();
  
  const theme = useTheme();

  const files = useAppSelector(state => state.filesReducer.treatmentFiles);
  const { treatmentData, currentDataPMDid } = useAppSelector(state => state.parsedDataReducer);
  const { statisticsMode, selectedStepsIDs, hiddenStepsIDs, currentFileInterpretations } = useAppSelector(state => state.pcaPageReducer);

  const [dataToShow, setDataToShow] = useState<IPmdData | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  useEffect(() => {
    if (files) dispatch(filesToData({files, format: 'pmd'}));
  }, [files, files?.length]); 

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
      // решил оставить id на совесть пользователя - теперь это просто название файла
      statistics.interpretation.label = `${currentFileInterpretations.length}_${statistics.interpretation.label}`;
      dispatch(addInterpretation(statistics));
      dispatch(setStatisticsMode(null));
    } else dispatch(updateCurrentInterpretation());
  }, [statisticsMode, selectedStepsIDs, dataToShow]);

  useEffect(() => {
    if (!dataToShow) setShowUploadModal(true);
    else setShowUploadModal(false);
  }, [dataToShow])

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
      <ModalWrapper
        open={showUploadModal}
        setOpen={setShowUploadModal}
        size={{width: '60vw', height: '60vh'}}
        showBottomClose
      >
        <UploadModal page='pca' />
      </ModalWrapper>
    </>
  )
};

export default PCAPage;
