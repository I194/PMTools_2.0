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
import ModalWrapper from '../../components/Common/Modal/ModalWrapper';
import UploadModal from '../../components/Common/Modal/UploadModal/UploadModal';
import { useMediaQuery } from 'react-responsive';

const DIRPage: FC = ({}) => {

  const theme = useTheme();
  const dispatch = useAppDispatch();
  const widthLessThan720 = useMediaQuery({ maxWidth: 719 });
  const heightLessThan560 = useMediaQuery({ maxHeight: 559 });
  const unsupportedResolution = widthLessThan720 || heightLessThan560;

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

  if (unsupportedResolution) return <>Размер окна должен быть не меньше чем 720x560</>

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
        size={{width: '60vw', height: widthLessThan720 ? 'fit-content' : '60vh'}}
        showBottomClose
      >
        <UploadModal page='dir' />
      </ModalWrapper>
    </>
  )
}

export default DIRPage;
