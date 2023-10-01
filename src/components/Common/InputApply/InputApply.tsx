import React, { FC, useState } from 'react';
import styles from './InputApply.module.scss';
import { IconButton, TextField } from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';

interface IInputApply {
  label?: string;
  helperText?: string;
  onApply: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

const InputApply: FC<IInputApply> = ({
  label,
  helperText,
  onApply,
  disabled,
  placeholder
}) => {

  const [value, setValue] = useState<string>('');

  const handleApply = () => {
    onApply(value);
    // очищение поля ввода
    setValue('');
  };

  const handleEnterPress = (event: any) => {
    if (event.key === 'Enter') {
      handleApply();
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
        autoFocus={true}
        disabled={disabled}
        placeholder={placeholder || ''}
        sx={{width: '100%'}}
      />
      <IconButton
        onClick={handleApply}
      >
        {<DirectionsIcon />}
      </IconButton>
    </div>
  )
};

export default InputApply;
