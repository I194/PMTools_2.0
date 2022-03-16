import React, { FC, useEffect } from "react";
import styles from './AppNavigation.module.scss';
import NavButton from './NavButton';

import { useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";
import { setColorMode } from "../../../services/reducers/appSettings";
import { IconButton } from "@mui/material";
import { useSystemTheme } from "../../../utils/GlobalHooks";
import { useMediaQuery } from "react-responsive";

const AppNavigation: FC = ({}) => {
  
  const isSmallScreen = useMediaQuery({ query: '(max-width: 1464px)' });

  const dispatch = useAppDispatch();
  const { colorMode } = useAppSelector(state => state.appSettingsReducer);
  const systemTheme = useSystemTheme();

  const onColorModeClick = () => {
    dispatch(setColorMode(colorMode === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    dispatch(setColorMode(systemTheme));
  }, [systemTheme]);

  const theme = useTheme();

  return (
    <div className={styles.navButtons}>
      <NavButton 
        label={isSmallScreen ? 'PCA' : 'Магнитные чистки (PCA)'}
        to={'pca'}
      />
      <NavButton 
        label={isSmallScreen ? 'DIR' : 'Статистика направлений (DIR)'}
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
      <IconButton onClick={onColorModeClick} color="inherit" sx={{position: 'absolute', right: '0px'}}>
        {theme.palette.mode === 'dark' ? <Brightness7Icon color="primary" /> : <Brightness4Icon color="primary" />}
      </IconButton>
    </div>
  )
}

export default AppNavigation;
