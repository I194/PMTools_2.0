import React, { FC, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import { DataTablePMD, MetaDataTablePMD, ToolsPMD } from '../../components/Main';
import { ZijdGraph, StereoGraph, MagGraph} from '../../components/Graph';
import { filesToData } from '../../services/axios/filesAndData';
import styles from './PCAPage.module.scss';

const PCAPage: FC = ({}) => {
  const disptach = useAppDispatch();
  const files = useAppSelector(state => state.filesReducer.treatmentFiles);
  const { treatmentData, loading } = useAppSelector(state => state.parsedDataReducer);
  const graphLargeRef = useRef<HTMLDivElement>(null);
  const graphSmallTopRef = useRef<HTMLDivElement>(null);
  const graphLargeBotRef = useRef<HTMLDivElement>(null);

  const [largeGraphSize, setLargeGraphSize] = useState<number>(300);
  const [smallGraphSize, setSmallGraphSize] = useState<number>(300);

  useEffect(() => {
    if (files && !treatmentData) disptach(filesToData({files, format: 'pmd'}));
  }, [files]);

  useEffect(() => {
    const largeGraphWidth = graphLargeRef.current?.offsetWidth;
    const largeGraphHeight = graphLargeRef.current?.offsetHeight;
    if (largeGraphWidth && largeGraphHeight) {
      const minBoxSize = Math.min(largeGraphWidth, largeGraphHeight);
      setLargeGraphSize(minBoxSize - 112);
    };
    const smallGraphWidth = graphSmallTopRef.current?.offsetWidth;
    const smallGraphHeight = graphSmallTopRef.current?.offsetHeight;
    if (smallGraphWidth && smallGraphHeight) {
      const minBoxSize = Math.min(smallGraphWidth, smallGraphHeight);
      setSmallGraphSize(minBoxSize - 80);
    };
  }, [graphLargeRef.current, graphSmallTopRef.current]);

  return (
    <>
      <div className={styles.controlPanel}>
        <div className={styles.metadata}>
          <div className={styles.table}>
            {
              treatmentData && 
              <MetaDataTablePMD data={treatmentData[0].metadata}/>
            }
          </div>
        </div>
        <div className={styles.instruments}>
          {
            <ToolsPMD />
          }
        </div>
      </div>
      <div className={styles.data}>
        <div className={styles.tables}>
          <div className={styles.tableSmall}>

          </div>
          <div className={styles.tableLarge}>
            {
              treatmentData &&
              <DataTablePMD data={treatmentData[0]}/>
            }
          </div>
        </div>
        <div className={styles.graphs}>
          <div className={styles.graphLarge} ref={graphLargeRef}>
            <ZijdGraph 
              graphId='zijd'
              width={largeGraphSize}
              height={largeGraphSize} 
            />
          </div>
          <div className={styles.column}>
            <div className={styles.graphSmall} ref={graphSmallTopRef}>
              <StereoGraph 
                graphId='stereo' 
                width={smallGraphSize}
                height={smallGraphSize}
              />
            </div>
            <div className={styles.graphSmall} ref={graphLargeBotRef}>
              <MagGraph 
                graphId='mag' 
                width={smallGraphSize}
                height={smallGraphSize}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PCAPage;
