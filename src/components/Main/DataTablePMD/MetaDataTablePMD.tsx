import React, { FC } from "react";
import styles from './DataTablePMD.module.scss';
import { IPmdData } from "../../../utils/files/fileManipulations";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
  bgColorBlocks,
  separatorColor,
  borderColor,
  boxShadowStyle
} from '../../../utils/ThemeConstants';

interface IMetaDataTablePMD {
  data: IPmdData['metadata'];
};

const MetaDataTablePMD: FC<IMetaDataTablePMD> = ({ data }) => {

  const theme = useTheme();

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
    <div 
      className={styles.metadata}
      style={{
        backgroundColor: bgColorMain(theme.palette.mode),
      }}
    >
      <div 
        className={styles.table}
        style={{
          backgroundColor: bgColorBlocks(theme.palette.mode),
          WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
          MozBoxShadow: boxShadowStyle(theme.palette.mode),
          boxShadow: boxShadowStyle(theme.palette.mode),
        }}
      >
        <DataGrid 
          rows={rows} 
          columns={columns} 
          sx={{
            borderRadius: '0px',
            borderColor: borderColor(theme.palette.mode),
            maxHeight: '100%',
            '.MuiDataGrid-columnHeaders': {
              maxHeight: '20px!important',
              minHeight: '20px!important',
            },
            '.MuiDataGrid-virtualScroller': {
              marginTop: '20px!important',
              borderColor: borderColor(theme.palette.mode)
            },
            '.MuiDataGrid-columnSeparator': {
              color: separatorColor(theme.palette.mode)
            },
            '.MuiDataGrid-cell': {
              borderColor: borderColor(theme.palette.mode)
            }
          }}
          hideFooter={true}
          autoHeight={true}
          density={'compact'}
          disableSelectionOnClick={true}
        />
      </div>
    </div>
  )

}

export default MetaDataTablePMD;
