import React, { FC, useEffect, useState } from 'react';
import styles from './DIRPage.module.scss';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import { IDirData } from '../../utils/GlobalTypes';
import Tables from './Tables';
import Graphs from './Graphs';
import { ToolsDIR } from '../../components/AppLogic';
import { useTheme } from '@mui/material/styles';
import { bgColorMain } from '../../utils/ThemeConstants';
import ModalWrapper from '../../components/Common/Modal/ModalWrapper';
import UploadModal from '../../components/Common/Modal/UploadModal/UploadModal';
import { useMediaQuery } from 'react-responsive';
import { setCurrentDIRid } from '../../services/reducers/parsedData';
import InterpretationSetter from './InterpretationSetter';

const DIRPage: FC = ({}) => {

  const theme = useTheme();
  const dispatch = useAppDispatch();
  const widthLessThan720 = useMediaQuery({ maxWidth: 719 });
  const heightLessThan560 = useMediaQuery({ maxHeight: 559 });
  const unsupportedResolution = widthLessThan720 || heightLessThan560;

  const { dirStatData, currentDataDIRid } = useAppSelector(state => state.parsedDataReducer);
  const { hiddenDirectionsIDs } = useAppSelector(state => state.dirPageReducer);

  const [dataToShow, setDataToShow] = useState<IDirData | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  useEffect(() => {
    if (dirStatData && dirStatData.length > 0) {
      const hasValidId =
        typeof currentDataDIRid === 'number' &&
        Number.isInteger(currentDataDIRid) &&
        currentDataDIRid >= 0 &&
        currentDataDIRid < dirStatData.length;

      const safeId = hasValidId ? (currentDataDIRid as number) : 0;

      if (safeId !== currentDataDIRid) {
        dispatch(setCurrentDIRid(safeId));
      }

      setDataToShow(dirStatData[safeId]);
    } else {
      setDataToShow(null);
    }
  }, [dirStatData, currentDataDIRid, hiddenDirectionsIDs]);

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
      <InterpretationSetter dataToShow={dataToShow} />
    </>
  )
}

export default DIRPage;
