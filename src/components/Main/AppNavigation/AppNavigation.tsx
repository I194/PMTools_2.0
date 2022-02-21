import React, { FC } from "react";
import styles from './AppNavigation.module.scss';
import NavButton from './NavButton';

import { useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";
import { setColorMode } from "../../../services/reducers/appSettings";
import { IconButton } from "@mui/material";

const AppNavigation: FC = ({}) => {

  const dispatch = useAppDispatch();
  const { colorMode } = useAppSelector(state => state.appSettingsReducer);

  const onColorModeClick = () => {
    dispatch(setColorMode(colorMode === 'dark' ? 'light' : 'dark'));
  };

  const theme = useTheme();

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
      <IconButton onClick={onColorModeClick} color="inherit">
        {theme.palette.mode === 'dark' ? <Brightness7Icon color="primary" /> : <Brightness4Icon color="primary" />}
      </IconButton>
    </div>
  )
}

export default AppNavigation;
