import React, { FC } from "react";
import styles from './DataTablePMD.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
  bgColorBlocks,
  boxShadowStyle
} from '../../../../utils/ThemeConstants';

const MetaDataTablePMDSkeleton: FC = ({ children }) => {

  const theme = useTheme();

  return (
    <div 
      className={styles.metadata}
      style={{
        backgroundColor: bgColorMain(theme.palette.mode),
      }}
    >
      <div 
        className={styles.table}
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

export default MetaDataTablePMDSkeleton;
