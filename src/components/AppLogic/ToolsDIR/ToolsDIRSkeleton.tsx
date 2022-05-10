import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './ToolsDIR.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
  bgColorBlocks,
  boxShadowStyle
} from '../../../utils/ThemeConstants';

const ToolsPMDSkeleton: FC = ({ children }) => {

  const theme = useTheme();

  return (
    <div 
      className={styles.instruments}
      style={{backgroundColor: bgColorMain(theme.palette.mode)}}
    >
      <div 
        className={styles.dataSettings}
        style={{
          backgroundColor: bgColorBlocks(theme.palette.mode),
          WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
          MozBoxShadow: boxShadowStyle(theme.palette.mode),
          boxShadow: boxShadowStyle(theme.palette.mode),
        }}
      >
        { children }
      </div>
    </div>
  )
}

export default ToolsPMDSkeleton;