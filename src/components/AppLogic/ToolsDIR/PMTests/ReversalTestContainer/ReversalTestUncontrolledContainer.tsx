import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './ReversalTestContainer.module.scss';
import { useWindowSize } from '../../../../../utils/GlobalHooks';
import GraphsSkeleton from '../GraphsSkeleton';
import { FoldTestResult, IDirData, ReversalTestClassicResult, ReversalTestResultAll } from '../../../../../utils/GlobalTypes';
import { foldTestBootstrap, reversalTestBootstrap, reversalTestClassic, reversalTestOldFashioned } from '../../../../../utils/statistics/PMTests';
import FoldTestGraph from '../../../../AppGraphs/FoldTestGraph/FoldTestGraph';
import { Button, Divider, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  textColor,
  primaryColor,
  successColor,
} from '../../../../../utils/ThemeConstants';

import getCDF from '../../../../../utils/graphs/formatters/getCDF';
import TestControls from '../TestControls';
import { useForm, Controller } from 'react-hook-form';
import Direction from '../../../../../utils/graphs/classes/Direction';
import ClassicResult from './ClassicResult';
import ReversalTestGraph from '../../../../AppGraphs/ReversalTestGraph/ReversalTestGraph';

type Props = {
  dataToAnalyze: IDirData | null;
}

const ReversalTestUncontrolledContainer = ({ dataToAnalyze }: Props) => {

  const theme = useTheme();
  const [dataToShow, setDataToShow] = useState<ReversalTestResultAll>();
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (dataToAnalyze && isRunning) {
      const bootstrapResult = reversalTestBootstrap(dataToAnalyze, 1000, setIsRunning);
      const classicResult = reversalTestClassic(dataToAnalyze);
      setDataToShow({
        bootstrap: bootstrapResult,
        classic: classicResult,
      });
    }
  }, [dataToAnalyze, isRunning]);

  const [wv, wh] = useWindowSize();

  const graphRef = useRef<HTMLDivElement>(null);

  const [graphSize, setGraphSize] = useState<number>(200);

  useEffect(() => {
    const graphWidth = graphRef.current?.offsetWidth;
    const graphHeight = graphRef.current?.offsetHeight;
    if (graphWidth && graphHeight) {
      const minBoxSize = Math.min(graphWidth, graphHeight);
      setGraphSize(minBoxSize - 112);
    };
  }, [graphRef, wv, wh]);

  return (
    <>
      <TestControls isRunning={isRunning} setIsRunning={setIsRunning}/>
      <div className={styles.classicResults}>
        <div className={styles.uncontrolled}>
          {
            dataToShow?.classic &&
            <ClassicResult result={dataToShow.classic}/>
          }
          {
            dataToShow?.bootstrap && (
              <>
                <Divider />
                <Typography textAlign='center'>
                  Bootstrap-вариант теста обращения [Tauxe L., 2010]
                </Typography>
                <Typography textAlign='center'>
                  Если области внутри границ 95%-го доверия (пунктирные линии) пересекаются во всех трёх компонентах, данные "проходят" тест обращения.
                  В противном случае (нет пересечений) тест не пройден. 
                </Typography>
              </>
            )
          } 
        </div>
      </div>
      {
        dataToShow?.bootstrap &&
        <GraphsSkeleton 
          graph={{
            node: <ReversalTestGraph 
              graphId={`reversalTest`} 
              width={graphSize}
              height={graphSize}
              data={dataToShow.bootstrap}
            />,
            ref: graphRef
          }}
        />
      }
    </>
  )
};

export default ReversalTestUncontrolledContainer;
