import React, { forwardRef, useImperativeHandle } from 'react';
import styles from './SitesDataTable.module.scss';
import { useAppSelector } from '../../../../services/store/hooks';
import { getDataTableBaseStyle } from '../styleConstants';
import SitesDataTableSkeleton from './SitesDataTableSkeleton';
import { DataGrid, GridValueFormatterParams } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import SitesInputDataTableToolbar from '../../../Common/DataTable/Toolbar/SitesInputDataTableToolbar';
import useApiRef from '../useApiRef';
import { IDataTableDIR, SiteDataTableColumns, SiteRow, SitesDataTableHandle } from '../types';

const SitesDataTable = forwardRef<SitesDataTableHandle, IDataTableDIR>(({ data }, ref) => {
  const theme = useTheme();

  const { hiddenDirectionsIDs } = useAppSelector((state) => state.dirPageReducer);
  const sitesData = useAppSelector((state) => state.parsedDataReducer.siteData)?.data;

  const columns: SiteDataTableColumns = [
    { field: 'id', headerName: 'ID', type: 'string', minWidth: 20, width: 30 },
    { field: 'index', headerName: '№', type: 'string', minWidth: 20, width: 30 },
    { field: 'label', headerName: 'Label', type: 'string', width: 70 },
    {
      field: 'lat',
      headerName: 'Lat',
      type: 'number',
      flex: 1,
      editable: true,
      cellClassName: styles[`editableCell_${theme.palette.mode}`],
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1),
    },
    {
      field: 'lon',
      headerName: 'Lon',
      type: 'number',
      flex: 1,
      editable: true,
      cellClassName: styles[`editableCell_${theme.palette.mode}`],
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1),
    },
    {
      field: 'age',
      headerName: 'age',
      type: 'number',
      width: 70,
      editable: true,
      cellClassName: styles[`editableCell_${theme.palette.mode}`],
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1),
    },
    {
      field: 'plateId',
      headerName: 'plate ID',
      type: 'number',
      width: 70,
      editable: true,
      cellClassName: styles[`editableCell_${theme.palette.mode}`],
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(0),
    },
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
    col.disableColumnMenu = true;
  });

  const { apiRef, enhancedColumns } = useApiRef(columns);

  useImperativeHandle(ref, () => ({
    getRows: () => Array.from(apiRef?.current?.getRowModels()?.values() || []) as SiteRow[],
  }));

  if (!data) return <SitesDataTableSkeleton />;

  let visibleIndex = 1;
  const rows: SiteRow[] = data.interpretations.map((interpretation, index) => {
    const { id, label } = interpretation;
    return {
      id,
      index: hiddenDirectionsIDs.includes(id) ? '-' : visibleIndex++,
      label,
      lat: sitesData ? sitesData[index]?.lat || 0 : 0,
      lon: sitesData ? sitesData[index]?.lon || 0 : 0,
      age: sitesData ? sitesData[index]?.age || 0 : 0,
      plateId: sitesData ? sitesData[index]?.plateId || 0 : 0,
    };
  });

  return (
    <div className={styles.container}>
      <SitesDataTableSkeleton>
        <DataGrid
          rows={rows}
          columns={enhancedColumns}
          sx={{
            ...getDataTableBaseStyle(theme.palette.mode),
            '& .MuiDataGrid-cell': {
              padding: '0px 0px',
            },
            '& .MuiDataGrid-columnHeader': {
              padding: '0px 0px',
              minWidth: '0px!important',
            },
          }}
          hideFooter={rows.length < 100}
          density={'compact'}
          components={{
            Toolbar: SitesInputDataTableToolbar,
          }}
          disableRowSelectionOnClick={true}
          getRowClassName={(params) =>
            hiddenDirectionsIDs.includes(params.row.id) ? styles.hiddenRow : ''
          }
        />
      </SitesDataTableSkeleton>
    </div>
  );
});

export default SitesDataTable;
