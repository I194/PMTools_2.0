import React, { FC, useEffect } from 'react';
import { DataTable } from '../../components/Main';
import { filesToData } from '../../services/axios/filesAndData';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import styles from './PCAPage.module.scss';

const PCAPage: FC = ({}) => {
  const disptach = useAppDispatch();
  const files = useAppSelector(state => state.filesReducer.treatmentFiles);
  const { treatmentData, loading } = useAppSelector(state => state.parsedDataReducer);

  useEffect(() => {
    if (files && !treatmentData) disptach(filesToData({files, format: 'pmd'}));
  }, [files]);

  console.log(treatmentData);

  return (
    <>
      <div className={styles.instruments}>
        <div className={styles.dataSettings}>

        </div>
      </div>
      <div className={styles.data}>
        <div className={styles.tables}>
          <div className={styles.tableSmall}>

          </div>
          <div className={styles.tableLarge}>
            <DataTable />
          </div>
        </div>
        <div className={styles.graphs}>
          <div className={styles.graphLarge}>

          </div>
          <div className={styles.column}>
            <div className={styles.graphSmall}>

            </div>
            <div className={styles.graphSmall}>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PCAPage;
