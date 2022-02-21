import React, { FC, useEffect } from "react";
import styles from './DataTablePMD.module.scss';
import { IPmdData } from "../../../utils/files/fileManipulations";
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
  bgColorBlocks,
  separatorColor,
  borderColor,
  boxShadowStyle
} from '../../../utils/ThemeConstants';

interface IDataTablePMD {
  data: IPmdData;
};

const DataTablePMD: FC<IDataTablePMD> = ({ data }) => {

  const theme = useTheme();

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', type: 'string', width: 40 },
    { field: 'step', headerName: 'Step', type: 'string', width: 70 },
    { field: 'Dgeo', headerName: 'Dgeo', type: 'number', width: 70 },
    { field: 'Igeo', headerName: 'Igeo', type: 'number', width: 70 },
    { field: 'Dstrat', headerName: 'Dstrat', type: 'number', width: 70 },
    { field: 'Istrat', headerName: 'Istrat', type: 'number', width: 70 },
    { field: 'mag', headerName: 'MAG', type: 'number', width: 70 },
    { field: 'a95', headerName: 'a95', type: 'number', width: 50 },
    { field: 'comment', headerName: 'Comment', type: 'string', width: 200 }
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
  })

  const rows = data.steps.map((stepData, index) => {
    const { step, Dgeo, Igeo, Dstrat, Istrat, mag, a95, comment } = stepData;
    return {
      id: index,
      step,
      Dgeo,
      Igeo,
      Dstrat,
      Istrat,
      mag: mag.toExponential(2).toLocaleUpperCase(),
      a95,
      comment
    };
  });

  return (
    <div 
      className={styles.tableLarge}
      style={{
        backgroundColor: bgColorBlocks(theme.palette.mode),
        WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
        MozBoxShadow: boxShadowStyle(theme.palette.mode),
        boxShadow: boxShadowStyle(theme.palette.mode),
      }}
    >
      <div className={styles.dataTable}>
        <DataGrid 
          rows={rows} 
          columns={columns} 
          checkboxSelection
          components={{
            Toolbar: GridToolbar,
          }}
          sx={{
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
            }
          }}
          hideFooter={true}
        />
      </div>
    </div>
  )
}

export default DataTablePMD;
