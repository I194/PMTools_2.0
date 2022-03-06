import React, { FC } from "react";
import styles from './DataTablePMD.module.scss';
import { IPmdData } from "../../../../utils/files/fileManipulations";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import MetaDataTablePMDSkeleton from './MetaDataTablePMDSkeleton';
import { GetDataTableBaseStyle } from "../styleConstants";

interface IMetaDataTablePMD {
  data: IPmdData['metadata'] | null | undefined;
};

const MetaDataTablePMD: FC<IMetaDataTablePMD> = ({ data }) => {

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', type: 'string', flex: 1 },
    { field: 'a', headerName: 'Core Azimuth', type: 'string', flex: 1 },
    { field: 'b', headerName: 'Core Dip', description: 'Core hade is measured, we use the plunge (90 - hade)', type: 'number', flex: 1 },
    { field: 's', headerName: 'Bedding Strike', type: 'number', flex: 1 },
    { field: 'd', headerName: 'Bedding Dip', type: 'number', flex: 1 },
    { field: 'v', headerName: 'Volume', type: 'number', flex: 1 }
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
    col.disableColumnMenu = true;
  })

  const rows = [{...data, id: 0, isRowSelectable: false}];

  if (!data) return <MetaDataTablePMDSkeleton />;

  return (
    <MetaDataTablePMDSkeleton>
      <DataGrid 
        rows={rows} 
        columns={columns} 
        sx={{
          ...GetDataTableBaseStyle(),
          '& .MuiDataGrid-columnHeaders': {
            minHeight: '24px!important',
            maxHeight: '24px!important',
            lineHeight: '24px!important',
          },
          '& .MuiDataGrid-virtualScroller': {
            marginTop: '24px!important',
          }
        }}
        hideFooter={true}
        autoHeight={true}
        getRowHeight={() => 24}
        density={'compact'}
        disableSelectionOnClick={true}
      />
    </MetaDataTablePMDSkeleton>
  );
};

export default MetaDataTablePMD;
