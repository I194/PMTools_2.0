import React, { FC, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import { useWindowSize } from '../../utils/GlobalHooks';
import { DataTablePMD, MetaDataTablePMD, ToolsPMD } from '../../components/Main';
import { ZijdGraph, StereoGraph, MagGraph} from '../../components/Graph';
import { filesToData } from '../../services/axios/filesAndData';
import styles from './PCAPage.module.scss';
import { IPmdData } from '../../utils/files/fileManipulations';

const PCAPage: FC = ({}) => {

  const disptach = useAppDispatch();

  const files = useAppSelector(state => state.filesReducer.treatmentFiles);
  const { treatmentData, loading } = useAppSelector(state => state.parsedDataReducer);
  const [wv, wh] = useWindowSize();

  const graphLargeRef = useRef<HTMLDivElement>(null);
  const graphSmallTopRef = useRef<HTMLDivElement>(null);
  const graphLargeBotRef = useRef<HTMLDivElement>(null);

  const [largeGraphSize, setLargeGraphSize] = useState<number>(300);
  const [smallGraphSize, setSmallGraphSize] = useState<number>(300);
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
  }, [treatmentData])

  useEffect(() => {
    console.log(wv, wh)
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
  }, [graphLargeRef.current, graphSmallTopRef.current, wv, wh]);

  return (
    <>
      <div className={styles.controlPanel}>
        <div className={styles.metadata}>
          <div className={styles.table}>
            {
              dataToShow && 
              <MetaDataTablePMD data={dataToShow.metadata}/>
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
              dataToShow &&
              <DataTablePMD data={dataToShow}/>
            }
          </div>
        </div>
        <div className={styles.graphs}>
          <div className={styles.graphLarge} ref={graphLargeRef}>
            {
              dataToShow && 
              <ZijdGraph 
                graphId='zijd'
                width={largeGraphSize}
                height={largeGraphSize} 
                data={dataToShow}
              />
            }
          </div>
          <div className={styles.column}>
            <div className={styles.graphSmall} ref={graphSmallTopRef}>
            {
              dataToShow && 
              <StereoGraph 
                graphId='stereo' 
                width={smallGraphSize}
                height={smallGraphSize}
                data={dataToShow}
              />
            }
            </div>
            <div className={styles.graphSmall} ref={graphLargeBotRef}>
            {
              dataToShow && 
              <MagGraph 
                graphId='mag' 
                width={smallGraphSize}
                height={smallGraphSize}
                data={dataToShow}
              />
            }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PCAPage;
