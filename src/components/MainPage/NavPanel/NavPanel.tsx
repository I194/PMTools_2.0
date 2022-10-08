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
import { useTranslation } from 'react-i18next';

const NavPanel = () => {

  const dispatch = useAppDispatch();

  const isMobileScreen = useMediaQuery({ query: '(max-width: 920px)' });
  const isTabletScreen = useMediaQuery({ query: '(min-width: 921px) and (max-width: 1464px)' });
  const { colorMode } = useAppSelector(state => state.appSettingsReducer);
  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');

  const onColorModeClick = () => {
    dispatch(setColorMode(colorMode === 'dark' ? 'light' : 'dark'));
  };

  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null);
  const [anchorElLang, setAnchorElLang] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorElMenu);
  const openLang = Boolean(anchorElLang);

  const handleClickMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorElMenu(null);
  };

  const handleClickLang = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElLang(event.currentTarget);
  };

  const handleCloseLang = () => {
    setAnchorElLang(null);
  };

  const handleSelectLang = (lng: string) => {
    i18n.changeLanguage(lng);
    setAnchorElLang(null);
  };

  const navButtons = [
    <NavButton 
      label={t('mainLayout.navPanel.whyPMTools')}
      to={'/why-pmtools'}
    />,
    <NavButton 
      label={isTabletScreen ? 'PCA' : t('mainLayout.navPanel.PCA')}
      to={'/app/pca'}
    />,
    <NavButton 
      label={isTabletScreen ? 'DIR' : t('mainLayout.navPanel.DIR')}
      to={'/app/dir'}
    />,
    <NavButton 
      label={t('mainLayout.navPanel.projectRepo')}
      to={'https://github.com/I194/PMTools_2.0'}
      external={true}
    />,
    <NavButton 
      label={t('mainLayout.navPanel.authorsAndHistory')}
      to={'/authors-and-history'}
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
            label={t('mainLayout.navPanel.whyPMTools')}
            to={'/why-pmtools'}
          />
          <NavButton 
            label={isTabletScreen ? 'PCA' : t('mainLayout.navPanel.PCA')}
            to={'/app/pca'}
          />
          <NavButton 
            label={isTabletScreen ? 'DIR' : t('mainLayout.navPanel.DIR')}
            to={'/app/dir'}
          />
          <NavButton 
            label={t('mainLayout.navPanel.projectRepo')}
            to={'https://github.com/I194/PMTools_2.0'}
            external={true}
          />
          <NavButton 
            label={t('mainLayout.navPanel.authorsAndHistory')}
            to={'/authors-and-history'}
          />
        </>
      }
      {
        isMobileScreen &&
        <>
          <IconButton
            aria-label="more"
            id="long-button"
            aria-controls={openMenu ? 'long-menu' : undefined}
            aria-expanded={openMenu ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleClickMenu}
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
            anchorEl={anchorElMenu}
            open={openMenu}
            onClose={handleCloseMenu}
            PaperProps={{
              style: {
                width: 'auto',
              },
            }}
          >
            {navButtons.map((button, index) => (
              <MenuItem key={index} onClick={handleCloseMenu} divider>
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
        <IconButton 
          onClick={handleClickLang} 
          color="inherit"
          id="lang-button"
          aria-controls={openLang ? 'lang-menu' : undefined}
          aria-expanded={openLang ? 'true' : undefined}
          aria-haspopup="true"
        >
          <LanguageIcon color="primary" />
        </IconButton>
        <Menu
            id="lang-menu"
            MenuListProps={{
              'aria-labelledby': 'lang-button',
            }}
            anchorEl={anchorElLang}
            open={openLang}
            onClose={handleCloseLang}
            PaperProps={{
              style: {
                width: 'auto',
              },
            }}
          >
            <MenuItem onClick={() => handleSelectLang('en')} divider>
              en
            </MenuItem>
            <MenuItem onClick={() => handleSelectLang('ru')} divider>
              ru
            </MenuItem>
          </Menu>
      </div>
    </div>
  );
}

export default NavPanel;
