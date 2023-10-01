import React, { FC, useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { ListItemText, ListItem, IconButton } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export interface IDropdownSelect {
  label: string;
  options: Array<string>;
  onOptionSelect: (option: string) => void;
  defaultValue?: string;
  minWidth?: string;
  width?: string;
  maxWidth?: string;
  m?: string;
  showDelete?: boolean;
  onDelete?: (option: string) => void;
};

const DropdownSelect: FC<IDropdownSelect> = ({ 
  label, 
  options, 
  onOptionSelect, 
  defaultValue, 
  minWidth,
  width,
  maxWidth,
  m,
  showDelete,
  onDelete,
}) => {

  const [selectedOption, setSelectedOption] = useState(defaultValue || '');
  const [open, setOpen] = React.useState(false);

  const handleSelect = (event: SelectChangeEvent) => {
    setSelectedOption(event.target.value);
    onOptionSelect(event.target.value);
    setOpen(false);
  };

  const handleDeleteClick = (option: string) => {
    if (onDelete) onDelete(option);
  };

  return (
    <FormControl 
      variant="standard" 
      sx={{ 
        minWidth: minWidth || '200px', 
        width,
        maxWidth,
        m: m || '0 0 0 16px'
      }}
    >
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
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(option)}>
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
  );
};

export default DropdownSelect;