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
import ModalWrapper from '../../components/Common/Modal/ModalWrapper';
import UploadModal from '../../components/Common/Modal/UploadModal/UploadModal';
import { useMediaQuery } from 'react-responsive';

const PCAPage: FC = ({}) => {

  const theme = useTheme();
  const dispatch = useAppDispatch();
  const widthLessThan720 = useMediaQuery({ maxWidth: 719 });
  const heightLessThan560 = useMediaQuery({ maxHeight: 559 });
  const unsupportedResolution = widthLessThan720 || heightLessThan560;

  const files = useAppSelector(state => state.filesReducer.treatmentFiles);
  const { treatmentData, currentDataPMDid } = useAppSelector(state => state.parsedDataReducer);
  const { statisticsMode, selectedStepsIDs, hiddenStepsIDs, currentFileInterpretations, allInterpretations } = useAppSelector(state => state.pcaPageReducer);

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
      // statistics.interpretation.label = `${allInterpretations.length}${statistics.interpretation.label}/${currentFileInterpretations.length}`;
      // statistics.interpretation.label = `${statistics.interpretation.label}`;
      dispatch(addInterpretation(statistics));
      dispatch(setStatisticsMode(null));
    } else dispatch(updateCurrentInterpretation());
  }, [statisticsMode, selectedStepsIDs, dataToShow]);

  useEffect(() => {
    if (!dataToShow) setShowUploadModal(true);
    else setShowUploadModal(false);
  }, [dataToShow]);

  if (unsupportedResolution) return <>Размер окна должен быть не меньше чем 720x560</>

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
        size={{width: '60vw', height: widthLessThan720 ? 'fit-content' : '60vh'}}
        showBottomClose
      >
        <UploadModal page='pca' />
      </ModalWrapper>
    </>
  )
};

export default PCAPage;
