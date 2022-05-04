import React, { FC } from "react";
import styles from './AppNavigation.module.scss';
import { Button } from '@mui/material';
import { NavLink } from 'react-router-dom';

interface INavButton {
  label: string;
  to: string;
  external?: boolean;
}

const NavButton: FC<INavButton> = ({ label, to, external }) => {

  const onClickExternal = () => {
    window.location.href = to;
  };
  
  if (external) {
    return (
      <Button
        variant="contained" 
        sx={{
          textTransform: 'none',
          marginRight: '16px',
        }}
        component="span"
        onClick={onClickExternal}
      >
        { label }
      </Button>
    )
  };

  return (
    <NavLink to={to}>
      {
        ({ isActive }) => {
          return (
            <Button
            variant="contained" 
            color={ isActive ? 'secondary' : 'primary' }
            sx={{
              textTransform: 'none',
              marginRight: '16px',
              // textDecoration: isActive ? 'underline' : 'none',
              fontWeight: isActive ? 700 : 500,
            }}
            component="span"
            >
              { label }
            </Button>
          );
        }
      }
    </NavLink>
  )
}

export default NavButton;
