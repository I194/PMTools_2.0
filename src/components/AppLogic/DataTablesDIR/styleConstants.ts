import React from 'react';
import {
  separatorColor,
  borderColor,
} from '../../../utils/ThemeConstants';
import { useTheme } from '@mui/material/styles';

export const GetDataTableBaseStyle = () => {

  const theme = useTheme();

  return ({
    border: 'none',
    borderRadius: '0px',
    borderColor: borderColor(theme.palette.mode),
    '.MuiDataGrid-columnSeparator': {
      color: separatorColor(theme.palette.mode)
    },
    '.MuiDataGrid-columnHeaders': {
      borderColor: borderColor(theme.palette.mode)
    },
    '.MuiDataGrid-cell': {
      borderColor: borderColor(theme.palette.mode)
    },
    "& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus": {
      outline: "none"
    },
    '.MuiDataGrid-row:hover': {
      cursor: 'pointer',
    },
  });
};