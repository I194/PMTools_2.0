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
  } 
  
  if (external) {
    return (
      <Button
        variant="contained" 
        sx={{
          textTransform: 'none',
        }}
        component="span"
        onClick={onClickExternal}
      >
        { label }
      </Button>
    )
  }

  return (
    <NavLink to={to}>
      <Button
        variant="contained" 
        sx={{
          textTransform: 'none',
        }}
        component="span"
      >
        { label }
      </Button>
    </NavLink>
  )
}

interface IAppNavigation {

}

const AppNavigation: FC<IAppNavigation> = () => {

  return (
    <div className={styles.navButtons}>
      <NavButton 
        label={'Магнитные чистки (PCA)'}
        to={'pca'}
      />
      <NavButton 
        label={'Статистика направлений (DIR)'}
        to={'dir'}
      />
      <NavButton 
        label={'Репозиторий проекта'}
        to={'https://github.com/I194/PMTools_2.0'}
        external={true}
      />
      <NavButton 
        label={'Главная страница'}
        to={'/'}
      />
    </div>
  )
}

export default AppNavigation;
