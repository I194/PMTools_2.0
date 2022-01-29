import React, { FC, useEffect } from "react";
import { Outlet, useNavigate, RouteProps, useLocation, Link } from "react-router-dom";
import styles from "./Layout.module.scss";

const Layout: FC<RouteProps> = () => {
  // const dispatch = useAppDispatch();
  const navigate = useNavigate();

 
  return (
    <div className={styles.appContainer}>
      <Outlet />
    </div>
  );
};

export default Layout;
