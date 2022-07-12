import React, { FC, useCallback, useEffect, useState } from 'react';
import styles from './DropdownSelect.module.scss';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { FormControl, IconButton, InputLabel, ListItem, ListItemText, MenuItem, Select, SelectChangeEvent,  } from '@mui/material';
import DropdownSelect, { IDropdownSelect } from './DropdownSelect';

interface IDropdownSelectWithButtons extends IDropdownSelect {
  useArrowListeners?: boolean;
  onDeleteAll?: () => void;
};

const DropdownSelectWithButtons: FC<IDropdownSelectWithButtons> = ({ 
  label, 
  options, 
  onOptionSelect, 
  defaultValue, 
  minWidth,
  m,
  useArrowListeners,
  showDelete,
  onDelete,
  onDeleteAll,
}) => {

  const [selectedOption, setSelectedOption] = useState(defaultValue || '');
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (!options.length) setSelectedOption(''); 
    else if (!options.includes(selectedOption)) setSelectedOption(options[0]);
  }, [selectedOption, options]);

  const handleSelect = (event: SelectChangeEvent) => {
    setSelectedOption(event.target.value);
    onOptionSelect(event.target.value);
    setOpen(false);
  };

  const handleLeftClick = () => {
    let newOptionIndex = (options.findIndex((option) => option === selectedOption ) - 1);
    if (newOptionIndex < 0) newOptionIndex += options.length;
    const newSelectedOption = options[newOptionIndex];
    setSelectedOption(newSelectedOption);
    onOptionSelect(newSelectedOption);
  };

  const handleRightClick = () => {
    const newSelectedOption = options[
      (options.findIndex((option) => option === selectedOption ) + 1) % options.length
    ];
    setSelectedOption(newSelectedOption);
    onOptionSelect(newSelectedOption);
  };

  const handleArrowBtnClick = (e: any) => {
    if (!useArrowListeners) return null; 
    const key = (e.code as string);
    const { ctrlKey, shiftKey, altKey } = e; 
    if ((shiftKey) && key === 'ArrowLeft') {
      handleLeftClick();
    };
    if ((shiftKey) && key === 'ArrowRight') {
      handleRightClick();
    };
  }

  useEffect(() => {
    window.addEventListener("keydown", handleArrowBtnClick);
    return () => {
      window.removeEventListener("keydown", handleArrowBtnClick);
    };
  }, [selectedOption]);

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, option: string) => {
    event.stopPropagation();
    if (onDelete) {
      onDelete(option);
    }
  };
  
  return (
    <div className={styles.DropdownSelectWithButtons}>
      <IconButton
        sx={{
          p: 0,
          mt: '16px'
        }}
        onClick={handleLeftClick}
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
            '& .MuiListItem-root': {
              display: 'none',
            }
          }}
        >
          {
            options.map((option, index) => (
              <MenuItem 
                value={option} 
                key={index}
              >
                <ListItemText primary={option} disableTypography/>
                {
                  showDelete && 
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={(event) => handleDeleteClick(event, option)}>
                        <DeleteForeverIcon />
                      </IconButton>
                    }
                  />
                }
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
        onClick={handleRightClick}
      >
        <KeyboardArrowRightIcon />
      </IconButton>
      {
        !!onDeleteAll &&
        <IconButton
          sx={{
            p: 0,
            mt: '16px'
          }}
          onClick={onDeleteAll}
        >
          <DeleteForeverIcon />
        </IconButton>
      }
    </div>
  )
};

export default DropdownSelectWithButtons;