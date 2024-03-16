import React, { FC, useEffect } from "react";
import styles from './DataTablePMD.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  bgColorBlocks,
  boxShadowStyle
} from '../../../../utils/ThemeConstants';

const DataTablePMDSkeleton: FC = ({ children }) => {

  const theme = useTheme();

  return (
    <div 
      className={styles.tableLarge}
      style={{
        backgroundColor: bgColorBlocks(theme.palette.mode),
        WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
        MozBoxShadow: boxShadowStyle(theme.palette.mode),
        boxShadow: boxShadowStyle(theme.palette.mode),
      }}
    >
      <div className={styles.dataTable}>
        { children }
      </div>
    </div>
  )
}

export default DataTablePMDSkeleton;
