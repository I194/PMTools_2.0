import { separatorColor, borderColor } from '../../../utils/ThemeConstants';

export const getDataTableBaseStyle = (mode: 'light' | 'dark') => ({
  border: 'none',
  borderRadius: '0px',
  borderColor: borderColor(mode),
  '.MuiDataGrid-columnSeparator': {
    color: separatorColor(mode),
  },
  '.MuiDataGrid-columnHeaders': {
    borderColor: borderColor(mode),
  },
  '.MuiDataGrid-cell': {
    borderColor: borderColor(mode),
    padding: '0px 0px',
  },
  '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus': {
    outline: 'none',
  },
  '.MuiDataGrid-row:hover': {
    cursor: 'pointer',
  },
  '.MuiDataGrid-columnHeader': {
    padding: '0px 0px',
  },
});
