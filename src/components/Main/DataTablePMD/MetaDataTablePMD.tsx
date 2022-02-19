import React, { FC } from "react";
import styles from './DataTablePMD.module.scss';
import { IPmdData } from "../../../utils/files/fileManipulations";
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';

interface IMetaDataTablePMD {
  data: IPmdData['metadata'];
};

const MetaDataTablePMD: FC<IMetaDataTablePMD> = ({ data }) => {

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', type: 'string' },
    { field: 'a', headerName: 'Core Azimuth', type: 'string' },
    { field: 'b', headerName: 'Core Dip', description: 'Core hade is measured, we use the plunge (90 - hade)', type: 'number' },
    { field: 's', headerName: 'Bedding Strike', type: 'number' },
    { field: 'd', headerName: 'Bedding Dip', type: 'number' },
    { field: 'v', headerName: 'Volume', type: 'number' }
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
    col.disableColumnMenu = true;
  })

  const rows = [{...data, id: 0}];

  return (
    <DataGrid 
      rows={rows} 
      columns={columns} 
      sx={{
        color: 'white',
        maxHeight: '100%',
        '.MuiDataGrid-columnHeaders': {
          maxHeight: '20px!important',
          minHeight: '20px!important',
        },
        '.MuiDataGrid-virtualScroller': {
          marginTop: '20px!important',
        }
      }}
      hideFooter={true}
      autoHeight={true}
      density={'compact'}
      disableSelectionOnClick={true}
    />
  )

}

export default MetaDataTablePMD;
