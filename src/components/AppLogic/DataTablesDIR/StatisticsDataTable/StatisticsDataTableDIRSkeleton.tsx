import React, { FC } from "react";
import styles from './StatisticsDataTableDIR.module.scss';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
  bgColorBlocks,
  boxShadowStyle
} from '../../../../utils/ThemeConstants';
import InfoButton from "../../../Common/Buttons/InfoButton/InfoButton";

const StatisticsDataTableDIRSkeleton: FC = ({ children }) => {

  const theme = useTheme();

  return (
    <div 
      className={styles.tableSmall}
      style={{
        backgroundColor: bgColorBlocks(theme.palette.mode),
        WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
        MozBoxShadow: boxShadowStyle(theme.palette.mode),
        boxShadow: boxShadowStyle(theme.palette.mode),
      }}
    >
      { children }
      <InfoButton contentType="statisticsDataTable" position={{right: 0}} />
    </div>
  )

}

export default StatisticsDataTableDIRSkeleton;
