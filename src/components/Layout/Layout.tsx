import React, { FC, useEffect } from "react";
import { Outlet, useNavigate, RouteProps, useLocation, Link } from "react-router-dom";
import styles from "./Layout.module.scss";

import { AppSettings, AppNavigation } from "../Main";

const Layout: FC<RouteProps> = () => {
  // const dispatch = useAppDispatch();
  const navigate = useNavigate();
 
  return (
    <div className={styles.appContainer}>
      <div className={styles.top}>
        <div className={styles.settings}>
          <div className={styles.appSettings}>
            <AppSettings />
          </div>
        </div>
        <div className={styles.navigation}>
          <div className={styles.pages}>
            <AppNavigation />
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default Layout;
