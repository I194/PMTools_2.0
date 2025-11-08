import React, { FC, useEffect, useState } from "react";
import styles from './AppNavigation.module.scss';
import NavButton from './NavButton';
import { useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LanguageIcon from '@mui/icons-material/Language';
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";
import { setColorMode } from "../../../services/reducers/appSettings";
import GitHubIcon from '@mui/icons-material/GitHub';
import OtherHousesIcon from '@mui/icons-material/OtherHouses';
import { DefaultIconButton } from "../../Common/Buttons";
import { useTranslation } from "react-i18next";
import { Menu, MenuItem, Typography, Button } from "@mui/material";
import ModalWrapper from "../../Common/Modal/ModalWrapper";
import ChangelogModal from "../../Common/Modal/ChangelogModal/ChangelogModal";

const AppNavigation: FC = ({}) => {

  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation('translation');
  // Окончательная установка темы идёт в app.tsx и опирается она на colorMode
  const { colorMode } = useAppSelector(state => state.appSettingsReducer);
  
  const onColorModeClick = () => {
    dispatch(setColorMode(colorMode === 'dark' ? 'light' : 'dark'));
  };

  const theme = useTheme();

  
  const [anchorElLang, setAnchorElLang] = useState<null | HTMLElement>(null);
  const openLang = Boolean(anchorElLang);
  const [showChangelog, setShowChangelog] = useState<boolean>(false);

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


  return (
    <div className={styles.navButtons}>
      <NavButton 
        label={t('appLayout.navPanel.PCA')}
        icon={'PCA'}
        to={'/app/pca'}
      />
      <NavButton 
        label={t('appLayout.navPanel.DIR')}
        icon={'DIR'}
        to={'/app/dir'}
      />
      <NavButton 
        label={t('appLayout.navPanel.projectRepo')}
        icon={<GitHubIcon />}
        to={'https://github.com/I194/PMTools_2.0'}
        external={true}
        forceSmall
      />
      <NavButton 
        label={t('appLayout.navPanel.mainPage')}
        icon={<OtherHousesIcon />}
        to={'/'}
        forceSmall
      />
      <div style={{position: 'absolute', right: '0px'}} className={styles.rightBlock}>
        <Button 
          variant="text" 
          color="primary" 
          className={styles.versionButton}
          onClick={() => setShowChangelog(true)}
        >
          v{process.env.REACT_APP_VERSION}
        </Button>
        <DefaultIconButton onClick={onColorModeClick} color="primary">
          {theme.palette.mode === 'dark' ? <Brightness7Icon color="primary" /> : <Brightness4Icon color="primary" />}
        </DefaultIconButton>
        <DefaultIconButton 
          onClick={handleClickLang} 
          color="primary"
          id="lang-button"
          aria-controls={openLang ? 'lang-menu' : undefined}
          aria-expanded={openLang ? 'true' : undefined}
          aria-haspopup="true"
        >
          <LanguageIcon color="primary" />
        </DefaultIconButton>
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
      <ModalWrapper
        open={showChangelog}
        setOpen={setShowChangelog}
        size={{ width: '56vw', height: '70vh' }}
      >
        <ChangelogModal />
      </ModalWrapper>
  </div>
  )
}

export default AppNavigation;
