import React, { FC, ReactChild, ReactNode } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';

interface IInputSelect {
  placeholder: string;
  leftIconButton: {icon: ReactNode, onClick: () => void};
  rightIconButtons: Array<{icon: ReactNode, onClick: () => void}>;
  inputText: string;
  setInputText: React.Dispatch<React.SetStateAction<string>>;
};

const InputSelect: FC<IInputSelect> = ({ placeholder, leftIconButton, rightIconButtons, inputText, setInputText }) => {

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };
  
  const createRightIconButton = (icon: ReactNode, onClick: () => void, index: number) => (
    <>
      <Divider sx={{ height: '80%', mr: 0.5, ml: 0.5 }} orientation="vertical"/>
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
        minWidth: 400,
        height: '56px',
        boxSizing: 'border-box'
      }}
    >
      <IconButton 
        onClick={leftIconButton.onClick}
        color='primary'
        sx={{ p: '10px' }} 
        aria-label="menu"
      >
        { leftIconButton.icon }
      </IconButton>
      <InputBase
        sx={{ 
          ml: 1,
          flex: 1,
          '.MuiInputBase-input': {
            padding: '0px',
          }
        }}
        placeholder={ placeholder }
        inputProps={{ 'aria-label': placeholder }}
        value={inputText}
        onChange={handleChange}
      />
      {
        rightIconButtons && 
        rightIconButtons.map((iconButton, index) => {
          return createRightIconButton(iconButton.icon, iconButton.onClick, index);
        })
      }
    </Paper>
  );
};

export default InputSelect;