import React, { FC, useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

interface IDropdownSelect {
  label: string;
  options: Array<string>;
  onOptionSelect: () => void;
}

const DropdownSelect: FC<IDropdownSelect> = ({ label, options, onOptionSelect }) => {

  const [selectedOption, setSelectedOption] = useState('');

  const handleSelect = (event: SelectChangeEvent) => {
    setSelectedOption(event.target.value);
    onOptionSelect();
  };

  return (
    <FormControl variant="filled" sx={{ minWidth: 200 }}>
      <InputLabel>{ label }</InputLabel>
      <Select
        value={selectedOption}
        onChange={handleSelect}
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