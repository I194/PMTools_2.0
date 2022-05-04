import React, { FC, useEffect } from "react";
import styles from './NavPanel.module.scss';
import { useMediaQuery } from "react-responsive";
import NavButton from "./NavButton";
// import pmtoolsLogo from './pmtools_logo.png';
import { default as pmtoolsLogo } from './PMTools_logo.svg';
import { NavLink } from "react-router-dom";

const NavPanel = () => {
  
  const isSmallScreen = useMediaQuery({ query: '(max-width: 1464px)' });

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
        label='Источники'
        to={'/references'}
      />
    </div>
  );
}

export default NavPanel;
