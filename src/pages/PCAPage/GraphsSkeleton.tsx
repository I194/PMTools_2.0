import React, { FC, ReactNode } from 'react';
import styles from './PCAPage.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
  bgColorBlocks,
  boxShadowStyle,
  bgColorCharts
} from '../../utils/ThemeConstants';
import { PMDGraph } from '../../utils/GlobalTypes';

interface IGraphsSkeleton {
  graphLarge: {node: ReactNode, ref: React.RefObject<HTMLDivElement>} | null;
  graphLargeToExport: {node: ReactNode, ref: React.RefObject<HTMLDivElement>} | null;
  graphSmallTop?: {node: ReactNode, ref: React.RefObject<HTMLDivElement>} | null;
  graphSmallTopToExport?: {node: ReactNode, ref: React.RefObject<HTMLDivElement>} | null;
  graphSmallBot?: {node: ReactNode, ref: React.RefObject<HTMLDivElement>} | null;
  graphSmallBotToExport?: {node: ReactNode, ref: React.RefObject<HTMLDivElement>} | null;
};

const GraphsSkeleton: FC<IGraphsSkeleton> = ({ 
  graphLarge, 
  graphLargeToExport,
  graphSmallTop, 
  graphSmallTopToExport,
  graphSmallBot,
  graphSmallBotToExport,
}) => {
  
  const theme = useTheme();

  return (
    <div 
      className={styles.graphs}
      style={{backgroundColor: bgColorMain(theme.palette.mode)}}
    >
      <>
        <div 
          className={styles.graphLarge} 
          ref={graphLarge?.ref}
          style={{
            backgroundColor: bgColorCharts(theme.palette.mode),
            WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
            MozBoxShadow: boxShadowStyle(theme.palette.mode),
            boxShadow: boxShadowStyle(theme.palette.mode),
          }}
        >
          { graphLarge?.node }
        </div>
        <div 
          ref={graphLargeToExport?.ref}
          style={{display: 'none'}}
        >
          { graphLargeToExport?.node }
        </div>
      </>
      <div 
        className={styles.column}
        style={{backgroundColor: bgColorMain(theme.palette.mode)}}
      >
        <>
          <div 
            className={styles.graphSmall} 
            ref={graphSmallTop?.ref}
            style={{
              backgroundColor: bgColorCharts(theme.palette.mode),
              WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
              MozBoxShadow: boxShadowStyle(theme.palette.mode),
              boxShadow: boxShadowStyle(theme.palette.mode),
            }}
          >
            { graphSmallTop?.node }
          </div>
          <div 
            ref={graphSmallTopToExport?.ref}
            style={{display: 'none'}}
          >
            { graphSmallTopToExport?.node }
          </div>
        </>
        <>
          <div 
            className={styles.graphSmall} 
            ref={graphSmallBot?.ref}
            style={{
              backgroundColor: bgColorCharts(theme.palette.mode),
              WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
              MozBoxShadow: boxShadowStyle(theme.palette.mode),
              boxShadow: boxShadowStyle(theme.palette.mode),
            }}
          > 
            { graphSmallBot?.node }
          </div>
          <div 
            ref={graphSmallBotToExport?.ref}
            style={{display: 'none'}}
          >
            { graphSmallBotToExport?.node }
          </div>
        </>
      </div>
    </div>
  )
};

export default GraphsSkeleton;
