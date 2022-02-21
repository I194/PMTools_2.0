import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './PCAPage.module.scss';
import { useWindowSize } from '../../utils/GlobalHooks';
import { ZijdGraph, StereoGraph, MagGraph} from '../../components/Graph';
import { IPmdData } from '../../utils/files/fileManipulations';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
  bgColorBlocks,
  boxShadowStyle
} from '../../utils/ThemeConstants';

interface IGraphs {
  dataToShow: IPmdData;
};

const Graphs: FC<IGraphs> = ({ dataToShow }) => {
  
  const theme = useTheme();

  const [wv, wh] = useWindowSize();

  const graphLargeRef = useRef<HTMLDivElement>(null);
  const graphSmallTopRef = useRef<HTMLDivElement>(null);
  const graphLargeBotRef = useRef<HTMLDivElement>(null);

  const [largeGraphSize, setLargeGraphSize] = useState<number>(300);
  const [smallGraphSize, setSmallGraphSize] = useState<number>(300);

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
  }, [graphLargeRef.current, graphSmallTopRef.current, wv, wh]);

  return (
    <div 
      className={styles.graphs}
      style={{backgroundColor: bgColorMain(theme.palette.mode)}}
    >
      <div 
        className={styles.graphLarge} 
        style={{
          backgroundColor: bgColorBlocks(theme.palette.mode),
          WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
          MozBoxShadow: boxShadowStyle(theme.palette.mode),
          boxShadow: boxShadowStyle(theme.palette.mode),
        }}
        ref={graphLargeRef}
      >
        <ZijdGraph 
          graphId='zijd'
          width={largeGraphSize}
          height={largeGraphSize} 
          data={dataToShow}
        />
      </div>
      <div 
        className={styles.column}
        style={{backgroundColor: bgColorMain(theme.palette.mode)}}
      >
        <div 
          className={styles.graphSmall} 
          style={{
            backgroundColor: bgColorBlocks(theme.palette.mode),
            WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
            MozBoxShadow: boxShadowStyle(theme.palette.mode),
            boxShadow: boxShadowStyle(theme.palette.mode),
          }}
          ref={graphSmallTopRef}
        >
          <StereoGraph 
            graphId='stereo' 
            width={smallGraphSize}
            height={smallGraphSize}
            data={dataToShow}
          />
        </div>
        <div 
          className={styles.graphSmall} 
          ref={graphLargeBotRef}
          style={{
            backgroundColor: bgColorBlocks(theme.palette.mode),
            WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
            MozBoxShadow: boxShadowStyle(theme.palette.mode),
            boxShadow: boxShadowStyle(theme.palette.mode),
          }}
        > 
          <MagGraph 
            graphId='mag' 
            width={smallGraphSize}
            height={smallGraphSize}
            data={dataToShow}
          />
        </div>
      </div>
    </div>
  )
};

export default Graphs;
