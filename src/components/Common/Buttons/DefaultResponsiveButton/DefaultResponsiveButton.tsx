import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { IconButton } from '@mui/material';
import { ButtonProps } from "@mui/material";
import DefaultButton from '../DefaultButton/DefaultButton';
import DefaultIconButton from '../DefaultIconButton/DefaultIconButton';

type Props = {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  variant?: "text" | "contained" | "outlined";
  color?: "inherit" | "primary" | "default" | "secondary" | "error" | "info" | "success" | "warning";
  forceSmall?: boolean;
} & ButtonProps & {component?: React.ElementType}

const DefaultResponsiveButton = ({ 
  icon, 
  text, 
  onClick, 
  variant='contained', 
  color='primary',
  forceSmall,
  ...props
}: Props) => {
  const widthLessThan1400 = useMediaQuery({ query: '(max-width: 1400px)' });

  return (
    <>
      {
        (widthLessThan1400 || forceSmall)
          ? 
            <DefaultIconButton 
              color={color}
              onClick={onClick}
              {...props}
            >
              { icon }
            </DefaultIconButton>
          :
            <DefaultButton
              startIcon={icon}
              onClick={onClick}
              variant={variant}
              color={color}
              {...props}
            >
              { text }
            </DefaultButton>
      }
    </>
  );
};

export default DefaultResponsiveButton;

