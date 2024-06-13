import * as React from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'id',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 30,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.id || ''}`,
  },
  {
    field: 'Code',
    headerName: 'Code',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 60,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.Code || ''}`,
  },

  {
    field: 'N',
    headerName: 'N',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 25,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.N || ''}`,
  },
  {
    field: 'Lat',
    headerName: 'Lat',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 75,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.Lat || ''}`,
  },
  {
    field: 'Lon',
    headerName: 'Lon',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 75,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.Lon || ''}`,
  },
  {
    field: 'ZoneRad',
    headerName: 'ZoneRad',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 75,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.ZoneRad || ''}`,
  },

  {
    field: 'FishLat',
    headerName: 'FishLat',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 75,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.FishLat || ''}`,
  },
  {
    field: 'FishLon',
    headerName: 'FishLon',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 75,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.FishLon || ''}`,
  },
  {
    field: 'alpha95',
    headerName: 'alpha95',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 75,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.alpha95 || ''}`,
  },
//   {
//     field: 'age',
//     headerName: 'Age',
//     type: 'number',
//     width: 90,
//   },
//   {
//     field: 'fullName',
//     headerName: 'Full name',
//     description: 'This column has a value getter and is not sortable.',
//     sortable: false,
//     width: 160,
//     valueGetter: (params: GridValueGetterParams) =>
//       `${params.row.firstName || ''} ${params.row.lastName || ''}`,
//   },

];


interface HGGResult {
    rows: Row[]
}

type Row = {
    id: number,
    Code: string,
    N: number,
    Lat: string,
    Lon: string,
    ZoneRad: number,
    FishLat: string,
    FishLon: string,
    alpha95: string
};







export function CACResultTable({
    rows
}: HGGResult) {

  return (
    <div style={{ height: '100%', width: '100%' }}>
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