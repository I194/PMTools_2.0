import React, { FC } from "react";
import styles from './OutputDataTableDIR.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
  bgColorBlocks,
  boxShadowStyle
} from '../../../../utils/ThemeConstants';

const StatisticsDataTablePMDSkeleton: FC = ({ children }) => {

  const theme = useTheme();

  return (
    <div 
      className={styles.tableFull}
      style={{
        backgroundColor: bgColorBlocks(theme.palette.mode),
        WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
        MozBoxShadow: boxShadowStyle(theme.palette.mode),
        boxShadow: boxShadowStyle(theme.palette.mode),
      }}
    >
      { children }
    </div>
  )

}

export default StatisticsDataTablePMDSkeleton;
