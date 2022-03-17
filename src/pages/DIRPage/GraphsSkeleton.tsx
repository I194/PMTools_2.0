import React, { FC, ReactNode } from 'react';
import styles from './DIRPage.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
  bgColorBlocks,
  boxShadowStyle
} from '../../utils/ThemeConstants';

interface IGraphsSkeleton {
  graph: {node: ReactNode, ref: React.RefObject<HTMLDivElement>} | null ;
};

const GraphsSkeleton: FC<IGraphsSkeleton> = ({ graph }) => {
  
  const theme = useTheme();

  return (
    <div 
      className={styles.graphs}
      style={{backgroundColor: bgColorMain(theme.palette.mode)}}
    >
      <div 
        className={styles.graphLarge} 
        ref={graph?.ref}
        style={{
          backgroundColor: bgColorBlocks(theme.palette.mode),
          WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
          MozBoxShadow: boxShadowStyle(theme.palette.mode),
          boxShadow: boxShadowStyle(theme.palette.mode),
        }}
      >
        { graph?.node }
      </div>
    </div>
  )
};

export default GraphsSkeleton;
