import React, { FC, useEffect } from "react";
import styles from './DataTablePMD.module.scss';
import { IPmdData } from "../../../utils/files/fileManipulations";
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import {
  separatorColor,
  borderColor,
} from '../../../utils/ThemeConstants';
import DataTablePMDSkeleton from './DataTablePMDSkeleton';

interface IDataTablePMD {
  data: IPmdData | null;
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
  });
  
  if (!data) return <DataTablePMDSkeleton />;

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
    <DataTablePMDSkeleton>
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
    </DataTablePMDSkeleton>
  )
}

export default DataTablePMD;
