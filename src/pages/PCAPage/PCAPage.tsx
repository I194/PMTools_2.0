import React, { FC, useEffect, useState } from 'react';
import styles from './PCAPage.module.scss';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import { IPmdData } from '../../utils/GlobalTypes';
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
import { setCurrentPMDid } from '../../services/reducers/parsedData';
import InterpretationSetter from './InterpretationSetter';

const PCAPage: FC = ({}) => {

  const theme = useTheme();
  const dispatch = useAppDispatch();
  const widthLessThan720 = useMediaQuery({ maxWidth: 719 });
  const heightLessThan560 = useMediaQuery({ maxHeight: 559 });
  const unsupportedResolution = widthLessThan720 || heightLessThan560;

  const { treatmentData, currentDataPMDid } = useAppSelector(state => state.parsedDataReducer);
  const { hiddenStepsIDs } = useAppSelector(state => state.pcaPageReducer);

  const [dataToShow, setDataToShow] = useState<IPmdData | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  useEffect(() => {
    if (treatmentData && treatmentData.length > 0) {
      const hasValidId =
        typeof currentDataPMDid === 'number' &&
        Number.isInteger(currentDataPMDid) &&
        currentDataPMDid >= 0 &&
        currentDataPMDid < treatmentData.length;

      const safeId = hasValidId ? (currentDataPMDid as number) : 0;

      if (safeId !== currentDataPMDid) {
        dispatch(setCurrentPMDid(safeId));
      }

      setDataToShow(treatmentData[safeId]);
    } else {
      setDataToShow(null);
    }
  }, [treatmentData, currentDataPMDid, hiddenStepsIDs]);

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
      <InterpretationSetter dataToShow={dataToShow} />
    </>
  )
};

export default PCAPage;
