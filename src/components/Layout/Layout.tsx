import React, { FC, useEffect, useState } from "react";
import styles from "./Layout.module.scss";
import { Outlet, RouteProps, } from "react-router-dom";
import { AppSettings, AppNavigation } from "../Main";
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
  bgColorBlocks,
  boxShadowStyle
} from '../../utils/ThemeConstants';

const Layout: FC<RouteProps> = () => {

  const theme = useTheme();
 
  return (
    <div 
      className={styles.appContainer}
      style={{backgroundColor: bgColorMain(theme.palette.mode)}}
    >
      <div 
        className={styles.top}
        style={{backgroundColor: bgColorMain(theme.palette.mode)}}
      >
        <div 
          className={styles.settings}
          style={{backgroundColor: bgColorMain(theme.palette.mode)}}
        >
          <div 
            className={styles.appSettings} 
            style={{
              backgroundColor: bgColorBlocks(theme.palette.mode),
              WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
              MozBoxShadow: boxShadowStyle(theme.palette.mode),
              boxShadow: boxShadowStyle(theme.palette.mode),
            }}
          >
            <AppSettings />
          </div>
        </div>
        <div 
          className={styles.navigation}
          style={{backgroundColor: bgColorMain(theme.palette.mode)}}
        >
          <div 
            className={styles.pages}
            style={{
              backgroundColor: bgColorBlocks(theme.palette.mode),
              WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
              MozBoxShadow: boxShadowStyle(theme.palette.mode),
              boxShadow: boxShadowStyle(theme.palette.mode),
            }}
          >
            <AppNavigation />
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default Layout;
