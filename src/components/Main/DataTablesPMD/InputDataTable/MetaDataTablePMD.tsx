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

  const rows = [{...data, id: 0, isRowSelectable: false}];

  if (!data) return <MetaDataTablePMDSkeleton />;

  return (
    <MetaDataTablePMDSkeleton>
      <DataGrid 
        rows={rows} 
        columns={columns} 
        sx={GetDataTableBaseStyle()}
        hideFooter={true}
        autoHeight={true}
        density={'compact'}
        disableSelectionOnClick={true}
      />
    </MetaDataTablePMDSkeleton>
  );
};

export default MetaDataTablePMD;
