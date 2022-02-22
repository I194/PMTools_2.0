import React, { FC, ReactElement, ReactNode, useEffect, useRef, useState } from 'react';
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
import { PMDGraph } from '../../utils/GlobalTypes';

interface IGraphsSkeleton {
  graphLarge: {node: ReactNode, ref: React.RefObject<HTMLDivElement>} | null ;
  graphSmallTop: {node: ReactNode, ref: React.RefObject<HTMLDivElement>} | null;
  graphSmallBot: {node: ReactNode, ref: React.RefObject<HTMLDivElement>} | null;
};

const GraphsSkeleton: FC<IGraphsSkeleton> = ({ graphLarge, graphSmallTop, graphSmallBot }) => {
  
  const theme = useTheme();

  return (
    <div 
      className={styles.graphs}
      style={{backgroundColor: bgColorMain(theme.palette.mode)}}
    >
      <div 
        className={styles.graphLarge} 
        ref={graphLarge?.ref}
        style={{
          backgroundColor: bgColorBlocks(theme.palette.mode),
          WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
          MozBoxShadow: boxShadowStyle(theme.palette.mode),
          boxShadow: boxShadowStyle(theme.palette.mode),
        }}
      >
        { graphLarge?.node }
      </div>
      <div 
        className={styles.column}
        style={{backgroundColor: bgColorMain(theme.palette.mode)}}
      >
        <div 
          className={styles.graphSmall} 
          ref={graphSmallTop?.ref}
          style={{
            backgroundColor: bgColorBlocks(theme.palette.mode),
            WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
            MozBoxShadow: boxShadowStyle(theme.palette.mode),
            boxShadow: boxShadowStyle(theme.palette.mode),
          }}
        >
          { graphSmallTop?.node }
        </div>
        <div 
          className={styles.graphSmall} 
          ref={graphSmallBot?.ref}
          style={{
            backgroundColor: bgColorBlocks(theme.palette.mode),
            WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
            MozBoxShadow: boxShadowStyle(theme.palette.mode),
            boxShadow: boxShadowStyle(theme.palette.mode),
          }}
        > 
          { graphSmallBot?.node }
        </div>
      </div>
    </div>
  )
};

export default GraphsSkeleton;
