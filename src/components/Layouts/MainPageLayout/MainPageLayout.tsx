import React, { FC } from "react";
import styles from "./MainPageLayout.module.scss";
import { Outlet, RouteProps } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
  bgColorBlocks,
  boxShadowStyle,
  textColor
} from '../../../utils/ThemeConstants';

const MainPageLayout: FC<RouteProps> = () => {

  const theme = useTheme();
 
  return (
    <div 
      className={styles.container}
      style={{
        backgroundColor: bgColorMain(theme.palette.mode),
      }}
    >
      <Outlet />
    </div>
  );
};

export default MainPageLayout;
