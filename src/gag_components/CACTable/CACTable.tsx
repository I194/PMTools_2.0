import * as React from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'firstName', headerName: 'First name', width: 130 },
  { field: 'lastName', headerName: 'Last name', width: 130 },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 90,
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.firstName || ''} ${params.row.lastName || ''}`,
  },
];

const rows = [
  { id: 1, lastName: 'Snow1', firstName: 'Jon', age: 33 },
  { id: 2, lastName: 'Snow2', firstName: 'Jon', age: 378 },
  { id: 3, lastName: 'Snow3', firstName: 'Jon', age: 358654 },
  { id: 4, lastName: 'Snow4', firstName: 'Jon', age: 357654765 },

];
export function CACTable() {


  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            page: 0, 
            pageSize: 5,
          },
        }}
        // pageSizeOptions={[5, 10]}
        checkboxSelection
      />
    </div>
  );
}