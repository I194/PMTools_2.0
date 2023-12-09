import React, { FC, ReactNode } from 'react';
import { Button, ButtonGroup, FormControl, InputLabel } from '@mui/material';
import styles from './ButtonGroupWithLabel.module.scss'; 
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

interface IButtonGroupWithLabel {
  label: string;
};

const ButtonGroupWithLabel: FC<IButtonGroupWithLabel> = ({ label, children }) => {
  return (
    <FormControl 
        variant="standard" 
        sx={{
          minWidth: 'fit-content'
        }}
      >
        {/* <div className={styles.hint}>
          <HelpOutlineOutlinedIcon sx={{width: '20px', height: '20px'}}/>
        </div> */}
        {/* <InputLabel sx={{transform: 'translate(0, -1.5px) scale(0.75)',}}>{ label }</InputLabel> */}
        <ButtonGroup variant="outlined">
          { children }
        </ButtonGroup>
      </FormControl>
  );
};

export default ButtonGroupWithLabel;