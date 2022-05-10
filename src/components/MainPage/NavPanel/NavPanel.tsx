import React, { FC, useEffect } from "react";
import styles from './NavPanel.module.scss';
import { useMediaQuery } from "react-responsive";
import NavButton from "./NavButton";
import pmtoolsLogo from './pmtools_logo.png';
// import { default as pmtoolsLogo } from './PMTools_logo.svg';
import { NavLink } from "react-router-dom";
import { IconButton } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { useSystemTheme } from "../../../utils/GlobalHooks";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LanguageIcon from '@mui/icons-material/Language';
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";
import { setColorMode } from "../../../services/reducers/appSettings";

const NavPanel = () => {

  const dispatch = useAppDispatch();

  const isSmallScreen = useMediaQuery({ query: '(max-width: 1464px)' });
  const { colorMode } = useAppSelector(state => state.appSettingsReducer);
  const systemTheme = useSystemTheme();
  const theme = useTheme();

  const onColorModeClick = () => {
    dispatch(setColorMode(colorMode === 'dark' ? 'light' : 'dark'));
  };

  const onLanguageClick = () => {
    console.log('language click');
  };

  useEffect(() => {
    dispatch(setColorMode(systemTheme));
  }, [systemTheme]);

  return (
    <div className={styles.container}>
      <NavLink to='/' style={{marginRight: '16px'}}>
        <img src={pmtoolsLogo} alt='pmtools logo' width={248}/>
      </NavLink>
      <NavButton 
        label='Почему PMTools?'
        to={'/why-pmtools'}
      />
      <NavButton 
        label={isSmallScreen ? 'PCA' : 'Магнитные чистки (PCA)'}
        to={'/app/pca'}
      />
      <NavButton 
        label={isSmallScreen ? 'DIR' : 'Статистика направлений (DIR)'}
        to={'/app/dir'}
      />
      <NavButton 
        label={'Репозиторий проекта'}
        to={'https://github.com/I194/PMTools_2.0'}
        external={true}
      />
      <NavButton 
        label='Авторы и источники'
        to={'/authors'}
      />
      <div className={styles.settings}>  
        <IconButton onClick={onColorModeClick} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon color="primary" /> : <Brightness4Icon color="primary" />}
        </IconButton>
        <IconButton onClick={onLanguageClick} color="inherit" disabled>
          <LanguageIcon />
        </IconButton>
      </div>
    </div>
  );
}

export default NavPanel;
