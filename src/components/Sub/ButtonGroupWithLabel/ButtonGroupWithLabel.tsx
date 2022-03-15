import React, { FC, ReactNode } from 'react';
import { Button, ButtonGroup, FormControl, InputLabel } from '@mui/material';

interface IButtonGroupWithLabel {
  label: string;
};

const ButtonGroupWithLabel: FC<IButtonGroupWithLabel> = ({ label, children }) => {
  return (
    <FormControl 
        variant="standard" 
        sx={{
          m: '0 0 0 16px',
          minWidth: 'fit-content'
        }}
      >
        <InputLabel sx={{transform: 'translate(0, -1.5px) scale(0.75)',}}>{ label }</InputLabel>
        <ButtonGroup variant="outlined" sx={{mt: '16px'}}>
          { children }
        </ButtonGroup>
      </FormControl>
  );
};

export default ButtonGroupWithLabel;