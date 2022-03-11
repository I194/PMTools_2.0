import React, { FC, useCallback, useEffect, useState } from 'react';
import styles from './DropdownSelect.module.scss';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent,  } from '@mui/material';
import DropdownSelect, { IDropdownSelect } from './DropdownSelect';

interface IDropdownSelectWithButtons extends IDropdownSelect {
  useArrowListeners?: boolean;
};

const DropdownSelectWithButtons: FC<IDropdownSelectWithButtons> = ({ 
  label, 
  options, 
  onOptionSelect, 
  defaultValue, 
  minWidth,
  m,
  useArrowListeners
}) => {

  const [selectedOption, setSelectedOption] = useState(defaultValue || '');
  const [open, setOpen] = React.useState(false);

  console.log(selectedOption)

  const handleSelect = (event: SelectChangeEvent) => {
    setSelectedOption(event.target.value);
    onOptionSelect(event.target.value);
    setOpen(false);
  };

  const handleLeftCkick = () => {
    let newOptionIndex = (options.findIndex((option) => option === selectedOption ) - 1);
    if (newOptionIndex < 0) newOptionIndex += options.length;
    const newSelectedOption = options[newOptionIndex];
    setSelectedOption(newSelectedOption);
    onOptionSelect(newSelectedOption);
  };

  const handleRightCkick = () => {
    const newSelectedOption = options[
      (options.findIndex((option) => option === selectedOption ) + 1) % options.length
    ];
    console.log(selectedOption, newSelectedOption);
    setSelectedOption(newSelectedOption);
    onOptionSelect(newSelectedOption);
  };

  const handleArrowBtnClick = (e: any) => {
    if (!useArrowListeners) return null; 
    const key = (e.code as string);
    const { ctrlKey, shiftKey, altKey } = e; 
    if ((shiftKey || altKey) && key === 'ArrowLeft') {
      handleLeftCkick();
    };
    if ((shiftKey || altKey) && key === 'ArrowRight') {
      handleRightCkick();
    };
  }

  useEffect(() => {
    window.addEventListener("keydown", handleArrowBtnClick);
    return () => {
      window.removeEventListener("keydown", handleArrowBtnClick);
    };
  }, [selectedOption]);


  return (
    <div className={styles.DropdownSelectWithButtons}>
      <IconButton
        sx={{
          p: 0,
          mt: '16px'
        }}
        onClick={handleLeftCkick}
      >
        <KeyboardArrowLeftIcon />
      </IconButton>
      <FormControl variant="standard" sx={{ minWidth: minWidth || '200px', m: m || '0' }}>
        <InputLabel>{ label }</InputLabel>
        <Select
          value={selectedOption}
          onChange={handleSelect}
          open={open}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          sx={{
            margin: 0,
          }}
        >
          {
            options.map((option, index) => (
              <MenuItem 
                value={option} 
                key={index}
              >
                { option }
              </MenuItem>
            ))
          }
        </Select>
      </FormControl>
      <IconButton
        sx={{
          p: 0,
          mt: '16px'
        }}
        onClick={handleRightCkick}
      >
        <KeyboardArrowRightIcon />
      </IconButton>
    </div>
  )
};

export default DropdownSelectWithButtons;