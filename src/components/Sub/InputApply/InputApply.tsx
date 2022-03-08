import React, { FC, useState } from 'react';
import styles from './InputApply.module.scss';
import { IconButton, TextField } from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';

interface IInputApply {
  label?: string;
  helperText?: string;
  onApply: (value: string) => void;
};

const InputApply: FC<IInputApply> = ({
  label,
  helperText,
  onApply,
}) => {

  const [value, setValue] = useState<string>('');

  const handleEnterPress = (event: any) => {
    if (event.key === 'Enter') {
      onApply(value);
    };
  };

  return (
    <div className={styles.inputApply}>
      <TextField
        label={label || ''}
        helperText={helperText || ''}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyPress={handleEnterPress}
        variant="standard"
      />
      <IconButton
        onClick={() => onApply(value)}
      >
        {<DirectionsIcon />}
      </IconButton>
    </div>
  )
};

export default InputApply;
