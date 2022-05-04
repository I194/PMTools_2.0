import React, { FC, useCallback } from "react";
import styles from "./MainPageLayout.module.scss";
import { Outlet, RouteProps, useLocation, } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
  bgColorBlocks,
  boxShadowStyle,
  textColor
} from '../../../utils/ThemeConstants';

const MainPageLayout: FC<RouteProps> = () => {

  const location = useLocation();
  const theme = useTheme();
 
  return (
    <div className={styles.container}>
      <Outlet />
    </div>
  );
};

export default MainPageLayout;
