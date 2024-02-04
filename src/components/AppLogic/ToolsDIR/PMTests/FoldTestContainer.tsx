import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './PMTests.module.scss';
import { useWindowSize } from '../../../../utils/GlobalHooks';
import GraphsSkeleton from './GraphsSkeleton';
import { FoldTestResult, IDirData } from '../../../../utils/GlobalTypes';
import { foldTestBootstrap } from '../../../../utils/statistics/PMTests';
import FoldTestGraph from '../../../AppGraphs/FoldTestGraph/FoldTestGraph';
import { Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  textColor,
  primaryColor,
  successColor,
} from '../../../../utils/ThemeConstants';

import getCDF from '../../../../utils/graphs/formatters/getCDF';
import { useTranslation } from 'react-i18next';

const Controls = ({ isRunning, setIsRunning }: { isRunning: boolean, setIsRunning: (isRunning: boolean) => void }) => {
  const { t, i18n } = useTranslation('translation');
  
  return (
    <div className={styles.controls}>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => setIsRunning(true)} 
        disabled={isRunning}
        sx={{
          width: 'fit-content',
          textTransform: 'none',
        }}
      >
        {
          isRunning 
            ? t("pmtests.controls.running")
            : t("pmtests.controls.run")
        }
      </Button>
    </div>
  );
};

type Props = {
  dataToAnalyze: IDirData | null;
}

const FoldTestContainer = ({ dataToAnalyze }: Props) => {

  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');
  const [dataToShow, setDataToShow] = useState<FoldTestResult>({untilts: [], savedBootstraps: []});
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (dataToAnalyze && isRunning) foldTestBootstrap(dataToAnalyze, 1000, setDataToShow, setIsRunning);
  }, [dataToAnalyze, isRunning]);

  const [wv, wh] = useWindowSize();

  const foldTestGraphRef = useRef<HTMLDivElement>(null);

  const [graphSize, setGraphSize] = useState<number>(300);

  useEffect(() => {
    const graphWidth = foldTestGraphRef.current?.offsetWidth;
    const graphHeight = foldTestGraphRef.current?.offsetHeight;
    if (graphWidth && graphHeight) {
      const minBoxSize = Math.min(graphWidth, graphHeight);
      setGraphSize(minBoxSize - 112);
    };
  }, [foldTestGraphRef, wv, wh]);

  if (!dataToShow.untilts.length) return (
    <>
      <Controls isRunning={isRunning} setIsRunning={setIsRunning}/>
      <GraphsSkeleton 
        graph={{node: null, ref: foldTestGraphRef}} 
      />
    </>
  );

  const { untilts } = dataToShow;
  const untiltsCDF = getCDF(untilts);

  const unfoldingMinimun = untilts[parseInt((0.025 * untiltsCDF.length).toString(), 10)] || -50;
  const unfoldingMaximum = untilts[parseInt((0.975 * untiltsCDF.length).toString(), 10)] || 150;

  return (
    <>
      <Controls isRunning={isRunning} setIsRunning={setIsRunning}/>
      <div className={styles.result}>
        <div className={styles.resultRow}>
          <Typography variant='body1' color={textColor(theme.palette.mode)}>
            {t("pmtests.foldTest.first")}
          </Typography>
          <Typography variant='body1' color={primaryColor(theme.palette.mode)} ml='8px' fontWeight={600}>
            {`${unfoldingMinimun} — ${unfoldingMaximum}`}
          </Typography>
        </div>
        <div className={styles.resultRow}>
          <Typography variant='body1' color={textColor(theme.palette.mode)}>
            {t("pmtests.foldTest.second")}
          </Typography>
          <Typography variant='body1' color={successColor(theme.palette.mode)} ml='8px' fontWeight={600}>
            {`${Math.min(...dataToShow.untilts)} — ${Math.max(...dataToShow.untilts)}`}
          </Typography>
        </div>
      </div>
      <GraphsSkeleton 
        graph={{
          node: <FoldTestGraph 
            graphId={`foldTest`} 
            width={graphSize * 3}
            height={graphSize}
            data={dataToShow}
          />,
          ref: foldTestGraphRef
        }}
      />
    </>
  )
};

export default FoldTestContainer;
