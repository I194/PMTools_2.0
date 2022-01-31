import React, { FC, useEffect } from "react";
import { Outlet, useNavigate, RouteProps, useLocation, Link } from "react-router-dom";
import styles from "./Layout.module.scss";

import { AppSettings, DataTable } from "../Main";

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

          </div>
        </div>
      </div>
      <div className={styles.instruments}>
        <div className={styles.dataSettings}>

        </div>
      </div>
      <div className={styles.data}>
        <div className={styles.tables}>
          <div className={styles.tableSmall}>

          </div>
          <div className={styles.tableLarge}>
            <DataTable />
          </div>
        </div>
        <div className={styles.graphs}>
          <div className={styles.graphLarge}>

          </div>
          <div className={styles.column}>
            <div className={styles.graphSmall}>

            </div>
            <div className={styles.graphSmall}>

            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default Layout;
