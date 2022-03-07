import React, { FC, useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

interface IDropdownSelect {
  label: string;
  options: Array<string>;
  onOptionSelect: (option: string) => void;
  defaultValue?: string;
}

const DropdownSelect: FC<IDropdownSelect> = ({ label, options, onOptionSelect, defaultValue }) => {

  const [selectedOption, setSelectedOption] = useState(defaultValue || '');
  const [open, setOpen] = React.useState(false);

  const handleSelect = (event: SelectChangeEvent) => {
    setSelectedOption(event.target.value);
    onOptionSelect(event.target.value);
    setOpen(false);
  };

  return (
    <FormControl variant="standard" sx={{ minWidth: 200, ml: '16px' }}>
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
  );
};

export default DropdownSelect;