import React, { FC, ReactNode } from 'react';
import Button from '@mui/material/Button';
import { ButtonProps } from '@mui/material/Button';
import { ToggleOffOutlined, ToggleOnOutlined } from '@mui/icons-material';

interface ToggleButtonProps extends Omit<ButtonProps, 'color' | 'onClick'> {
  isActive: boolean;
  onToggle: () => void;
  label?: ReactNode;
  activeColor?: ButtonProps['color'];
  inactiveColor?: ButtonProps['color'];
}

const ToggleButton: FC<ToggleButtonProps> = ({
  isActive,
  onToggle,
  label,
  activeColor = 'warning',
  inactiveColor = 'primary',
  sx,
  children,
  variant = 'outlined',
  ...rest
}) => {
  return (
    <Button
      color={isActive ? activeColor : inactiveColor}
      onClick={onToggle}
      variant={variant}
      sx={{
        borderRadius: '16px',
        fontWeight: isActive ? 600 : 400,
        maxHeight: '36.5px',
        ...sx,
      }}
      {...rest}
    >
      {label ?? children}
      {isActive ? 
        <ToggleOnOutlined sx={{fontSize: '24px', marginLeft: '4px'}} /> : 
        <ToggleOffOutlined sx={{fontSize: '24px', marginLeft: '4px'}} />
      }
    </Button>
  );
};

export default ToggleButton;


