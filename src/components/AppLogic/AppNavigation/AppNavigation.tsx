import React, { FC, useEffect } from "react";
import styles from './AppNavigation.module.scss';
import NavButton from './NavButton';
import { useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";
import { setColorMode } from "../../../services/reducers/appSettings";
import GitHubIcon from '@mui/icons-material/GitHub';
import OtherHousesIcon from '@mui/icons-material/OtherHouses';
import { DefaultIconButton } from "../../Sub/Buttons";

const AppNavigation: FC = ({}) => {

  const dispatch = useAppDispatch();
  // Окончательная установка темы идёт в app.tsx и опирается она на colorMode
  const { colorMode } = useAppSelector(state => state.appSettingsReducer);
  
  const onColorModeClick = () => {
    dispatch(setColorMode(colorMode === 'dark' ? 'light' : 'dark'));
  };

  const theme = useTheme();

  return (
    <div className={styles.navButtons}>
      <NavButton 
        label={'Магнитные чистки'}
        icon={'PCA'}
        to={'/app/pca'}
      />
      <NavButton 
        label={'Статистика направлений'}
        icon={'DIR'}
        to={'/app/dir'}
      />
      <NavButton 
        label={'Репозиторий проекта'}
        icon={<GitHubIcon />}
        to={'https://github.com/I194/PMTools_2.0'}
        external={true}
      />
      <NavButton 
        label={'Главная страница'}
        icon={<OtherHousesIcon />}
        to={'/'}
      />
      <DefaultIconButton onClick={onColorModeClick} sx={{position: 'absolute', right: '0px'}}>
        {theme.palette.mode === 'dark' ? <Brightness7Icon color="primary" /> : <Brightness4Icon color="primary" />}
      </DefaultIconButton>
    </div>
  )
}

export default AppNavigation;
