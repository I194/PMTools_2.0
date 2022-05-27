
import React from 'react';
import styles from './About.module.scss';
import { Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { textColor } from '../../../utils/ThemeConstants';
import { NavLink } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

const About = () => {

  
  const isSmallScreen = useMediaQuery({ query: '(max-width: 920px)' });
  const theme = useTheme();

  return (
    <div className={styles.container}>
      <Typography variant='h3' color={textColor(theme.palette.mode)} textAlign='center' mb='16px' fontSize={isSmallScreen ? '42px' : '48px'}>
        Работайте с результатами палеомагнитных исследований. 
      </Typography>
      <Typography variant='h4' color={textColor(theme.palette.mode)} textAlign='center' mb='16px' fontSize={isSmallScreen ? '30px' : '34px'}>
        В любое время, в любом месте, с любого устройства.
      </Typography>
      <Typography variant='h4' color={textColor(theme.palette.mode)} textAlign='center' fontSize={isSmallScreen ? '30px' : '34px'}>
        И не беспокойтесь о защите данных.
      </Typography>

      <NavLink to={'/app/pca'} style={{textDecoration: 'none'}}>
        <Button
          variant="contained"
          color="primary"
          sx={{
            textTransform: 'none',
            fontSize: '18px',
            borderRadius: '4px',
            padding: '8px 24px',
            width: 'fit-content',
            mt: '42px',
          }}
        >
          Приступить к работе
        </Button>
      </NavLink>
    </div>
  );
};

export default About;
