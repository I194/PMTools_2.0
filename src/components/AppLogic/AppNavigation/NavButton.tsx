import React, { FC } from "react";
import styles from './AppNavigation.module.scss';
import { Button } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { DefaultResponsiveButton } from "../../Common/Buttons";

interface INavButton {
  label: string;
  icon: React.ReactNode;
  to: string;
  external?: boolean;
}

const NavButton: FC<INavButton> = ({ label, icon, to, external }) => {

  const onClickExternal = () => {
    window.location.href = to;
  };
  
  if (external) {
    return (
      <DefaultResponsiveButton
        text={label}
        icon={icon}
        onClick={onClickExternal}
      />
    )
  };

  return (
    <NavLink to={to}>
      {
        ({ isActive }) => {
          return (
            <DefaultResponsiveButton
              text={label}
              icon={icon}
              color={ isActive ? 'secondary' : 'primary' }
            />
          );
        }
      }
    </NavLink>
  )
}

export default NavButton;
