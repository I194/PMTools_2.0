import React, { FC, useEffect } from "react";
import styles from './DataTablePMD.module.scss';
import { IPmdData } from "../../../utils/files/fileManipulations";
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import MetaDataTablePMD from './MetaDataTablePMD';

interface IDataTablePMD {
  data: IPmdData;
};

const DataTablePMD: FC<IDataTablePMD> = ({ data }) => {

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
    <div className={styles.dataTable}>
      <DataGrid 
        rows={rows} 
        columns={columns} 
        sx={{
          color: 'white',
          '.MuiDataGrid-toolbarContainer': {
            
          }
        }}
        checkboxSelection
        components={{
          Toolbar: GridToolbar,
        }}
        hideFooter={true}
      />
    </div>
  )
}

export default DataTablePMD;
