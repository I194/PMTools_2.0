import React, { FC, useCallback, useEffect, useState } from 'react';
import styles from './DropdownSelect.module.scss';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { FormControl, IconButton, InputLabel, ListItem, ListItemText, MenuItem, Select, SelectChangeEvent, Tooltip, Typography,  } from '@mui/material';
import DropdownSelect, { IDropdownSelect } from './DropdownSelect';
import { DefaultIconButton } from '../Buttons';
import { primaryBorderColor } from '../../../utils/ThemeConstants';
import { useTheme } from '@mui/material/styles';

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
  width,
  maxWidth,
  m,
  useArrowListeners,
  showDelete,
  onDelete,
  onDeleteAll,
}) => {

  const [selectedOption, setSelectedOption] = useState(defaultValue || '');
  const [open, setOpen] = React.useState(false);

  const theme = useTheme();

  useEffect(() => {
    if (defaultValue) {
      setSelectedOption(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    if (!options.length) setSelectedOption(''); 
    else if (!options.includes(selectedOption)) setSelectedOption(options[0]);
  }, [selectedOption, options]);

  const handleSelect = (event: SelectChangeEvent) => {
    setSelectedOption(event.target.value);
    onOptionSelect(event.target.value);
    setOpen(false);
  };

  const handleLeftClick = useCallback(() => {
    let newOptionIndex = (options.findIndex((option) => option === selectedOption ) - 1);
    if (newOptionIndex < 0) newOptionIndex += options.length;
    const newSelectedOption = options[newOptionIndex];
    setSelectedOption(newSelectedOption);
    onOptionSelect(newSelectedOption);
  }, [options, selectedOption, onOptionSelect]);

  const handleRightClick = useCallback(() => {
    const newSelectedOption = options[
      (options.findIndex((option) => option === selectedOption ) + 1) % options.length
    ];
    setSelectedOption(newSelectedOption);
    onOptionSelect(newSelectedOption);
  }, [options, selectedOption, onOptionSelect]);

  const handleArrowBtnClick = useCallback((e: KeyboardEvent) => {
    if (!useArrowListeners) return;
    const key = e.code;
    const { shiftKey } = e; 
    if (shiftKey && key === 'ArrowLeft') {
      handleLeftClick();
    }
    if (shiftKey && key === 'ArrowRight') {
      handleRightClick();
    }
  }, [useArrowListeners, handleLeftClick, handleRightClick]);

  useEffect(() => {
    if (!useArrowListeners) return;
    window.addEventListener("keydown", handleArrowBtnClick);
    return () => {
      window.removeEventListener("keydown", handleArrowBtnClick);
    };
  }, [useArrowListeners, handleArrowBtnClick]);

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, option: string) => {
    event.stopPropagation();
    if (onDelete) {
      onDelete(option);
    }
  };
  
  return (
    <div className={styles.DropdownSelectWithButtons} style={{borderColor: primaryBorderColor(theme.palette.mode)}}>
      <DefaultIconButton
        sx={{
          p: 0,
        }}
        onClick={handleLeftClick}
      >
        <Tooltip 
          title={<Typography variant='body1'>Shift + ←</Typography>}
          enterDelay={250}
          arrow
        >
          <KeyboardArrowLeftIcon />
        </Tooltip>
      </DefaultIconButton>
      <FormControl 
        variant="standard" 
        sx={{ 
          minWidth: minWidth || '200px', 
          width,
          maxWidth,
          m: m || '0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Select
          value={selectedOption}
          onChange={handleSelect}
          open={open}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          sx={{
            margin: 0,
            border: 0,
            '::before': {
              border: 0
            },
            '& .MuiListItem-root': {
              display: 'none',
            },
            '& .MuiListItemText-root': {
              textOverflow: "ellipsis",
              overflow: 'hidden',
              margin: 0
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
      <DefaultIconButton
        sx={{
          p: 0,
        }}
        onClick={handleRightClick}
      >
        <Tooltip 
          title={<Typography variant='body1'>Shift + →</Typography>}
          enterDelay={250}
          arrow
        >
          <KeyboardArrowRightIcon />
        </Tooltip>
      </DefaultIconButton>
      {
        !!onDeleteAll &&
        <DefaultIconButton
          sx={{
            p: 0,
          }}
          onClick={onDeleteAll}
        >
          <DeleteForeverIcon />
        </DefaultIconButton>
      }
    </div>
  )
};

export default DropdownSelectWithButtons;