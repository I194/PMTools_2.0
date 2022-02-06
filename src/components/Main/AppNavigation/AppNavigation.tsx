import React, { FC } from "react";
import styles from './AppNavigation.module.scss';
import { Button } from '@mui/material';
import { NavLink } from 'react-router-dom';

interface INavButton {
  label: string;
  to: string;
}

const NavButton: FC<INavButton> = ({ label, to }) => {
  return (
    <NavLink to={to}>
      <Button
        variant="contained" 
        sx={{
          textTransform: 'none'
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
        to={'git'}
      />
      <NavButton 
        label={'Главная страница'}
        to={'/'}
      />
    </div>
  )
}

export default AppNavigation;
