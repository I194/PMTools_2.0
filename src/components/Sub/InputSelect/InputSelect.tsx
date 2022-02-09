import React, { FC, ReactChild, ReactNode } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';

interface IInputSelect {
  placeholder: string;
  leftIconButton: {icon: ReactNode, onClick: () => void};
  rightIconButtons: Array<{icon: ReactNode, onClick: () => void}>;
};

const InputSelect: FC<IInputSelect> = ({ placeholder, leftIconButton, rightIconButtons }) => {
  
  const createRightIconButton = (icon: ReactNode, onClick: () => void) => (
    <>
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <IconButton 
        onClick={onClick}
        color="primary" 
        sx={{ p: '10px' }} 
      >
        { icon }
      </IconButton>
    </>
  );

  return (
    <Paper
      component="form"
      sx={{ 
        p: '2px 4px', 
        display: 'flex', 
        alignItems: 'center', 
        minWidth: 400 
      }}
    >
      <IconButton 
        onClick={leftIconButton.onClick}
        sx={{ p: '10px' }} 
        aria-label="menu"
      >
        { leftIconButton.icon }
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder={ placeholder }
        inputProps={{ 'aria-label': placeholder }}
      />
      {
        rightIconButtons && 
        rightIconButtons.map((iconButton) => {
          return createRightIconButton(iconButton.icon, iconButton.onClick);
        })
      }
    </Paper>
  );
};

export default InputSelect;