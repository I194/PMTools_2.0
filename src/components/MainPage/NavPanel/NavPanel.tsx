import React, { FC, useEffect, useState } from "react";
import styles from './NavPanel.module.scss';
import { useMediaQuery } from "react-responsive";
import NavButton from "./NavButton";
import pmtoolsLogo from './pmtools_logo.png';
// import { default as pmtoolsLogo } from './PMTools_logo.svg';
import { NavLink } from "react-router-dom";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { useSystemTheme } from "../../../utils/GlobalHooks";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LanguageIcon from '@mui/icons-material/Language';
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";
import { setColorMode } from "../../../services/reducers/appSettings";
import MenuIcon from '@mui/icons-material/Menu';

const NavPanel = () => {

  const dispatch = useAppDispatch();

  const isMobileScreen = useMediaQuery({ query: '(max-width: 920px)' });
  const isTabletScreen = useMediaQuery({ query: '(min-width: 921px) and (max-width: 1464px)' });
  const { colorMode } = useAppSelector(state => state.appSettingsReducer);
  const theme = useTheme();

  const onColorModeClick = () => {
    dispatch(setColorMode(colorMode === 'dark' ? 'light' : 'dark'));
  };

  const onLanguageClick = () => {
    console.log('language click');
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const navButtons = [
    <NavButton 
      label='Почему PMTools?'
      to={'/why-pmtools'}
    />,
    <NavButton 
      label={isTabletScreen ? 'PCA' : 'Магнитные чистки (PCA)'}
      to={'/app/pca'}
    />,
    <NavButton 
      label={isTabletScreen ? 'DIR' : 'Статистика направлений (DIR)'}
      to={'/app/dir'}
    />,
    <NavButton 
      label={'Репозиторий проекта'}
      to={'https://github.com/I194/PMTools_2.0'}
      external={true}
    />,
    <NavButton 
      label='Авторы и источники'
      to={'/authors'}
    />
  ];

  return (
    <div className={styles.container}>
      <NavLink to='/' style={{marginRight: '16px'}}>
        <img src={pmtoolsLogo} alt='pmtools logo' width={248}/>
      </NavLink>
      {
        !isMobileScreen &&
        <>
          <NavButton 
          label='Почему PMTools?'
          to={'/why-pmtools'}
          />
          <NavButton 
            label={isTabletScreen ? 'PCA' : 'Магнитные чистки (PCA)'}
            to={'/app/pca'}
          />
          <NavButton 
            label={isTabletScreen ? 'DIR' : 'Статистика направлений (DIR)'}
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
        </>
      }
      {
        isMobileScreen &&
        <>
          <IconButton
            aria-label="more"
            id="long-button"
            aria-controls={open ? 'long-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleClick}
            sx={{
              ml: '16px',
            }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="long-menu"
            MenuListProps={{
              'aria-labelledby': 'long-button',
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              style: {
                width: 'auto',
              },
            }}
          >
            {navButtons.map((button, index) => (
              <MenuItem key={index} onClick={handleClose} divider>
                { button }
              </MenuItem>
            ))}
          </Menu>
        </>
      }
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
