import React, { FC, useEffect, useState } from 'react';
import styles from './PCAPage.module.scss';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import { filesToData } from '../../services/axios/filesAndData';
import { IPmdData } from '../../utils/files/fileManipulations';
import { useTheme } from '@mui/material/styles';
import { MetaDataTablePMD, ToolsPMD } from '../../components/Main';
import Graphs from './Graphs';
import Tables from './Tables';

const PCAPage: FC = ({}) => {

  const disptach = useAppDispatch();
  
  const theme = useTheme();
  const bgColorMain = theme.palette.mode === 'dark' ? '#000' : '#e8eaf6';
  const bgColorBlocks =  theme.palette.mode === 'dark' ? '#212121' : '#fff';

  const files = useAppSelector(state => state.filesReducer.treatmentFiles);
  const { treatmentData, loading } = useAppSelector(state => state.parsedDataReducer);

  const [dataToShow, setDataToShow] = useState<IPmdData | null>(null);

  useEffect(() => {
    if (files && !treatmentData) disptach(filesToData({files, format: 'pmd'}));
  }, [files]);

  useEffect(() => {
    if (treatmentData && treatmentData.length > 0) {
      const modifiedTreatmentData: IPmdData = {
        ...treatmentData[0],
        metadata: {
          ...treatmentData[0].metadata,
          b: 90 - treatmentData[0].metadata.b // core hade is measured, we use the plunge (90 - hade)
        }
      };
      setDataToShow(modifiedTreatmentData);
    } else setDataToShow(null);
  }, [treatmentData]);

  if (!dataToShow) return null;

  return (
    <>
      <div 
        className={styles.controlPanel}
        style={{backgroundColor: bgColorMain}}
      >
        <MetaDataTablePMD data={dataToShow.metadata}/>
        <ToolsPMD />
      </div>
      <div 
        className={styles.data}
        style={{backgroundColor: bgColorMain}}
      > 
        <Tables dataToShow={dataToShow}/>
        <Graphs dataToShow={dataToShow}/>
      </div>
    </>
  )
};

export default PCAPage;
