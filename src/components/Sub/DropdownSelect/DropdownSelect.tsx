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
    <div>
      <FormControl variant="filled" sx={{ m: 1, minWidth: 200 }}>
        <InputLabel>{ label }</InputLabel>
        <Select
          value={selectedOption}
          onChange={handleSelect}
        >
          {
            options.map((option) => <MenuItem value={option}>{ option }</MenuItem>)
          }
        </Select>
      </FormControl>
    </div>
  );
};

export default DropdownSelect;