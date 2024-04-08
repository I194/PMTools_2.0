import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import styles from './VGPDataTable.module.scss';
import { useAppDispatch, useAppSelector } from "../../../../services/store/hooks";
import { GetDataTableBaseStyle } from "../styleConstants";
import SitesDataTableSkeleton from './VGPDataTableSkeleton';
import { VGPData } from "../../../../utils/GlobalTypes";
import { 
  DataGrid, 
  GridValueFormatterParams, 
} from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import { Button } from "@mui/material";
import SitesInputDataTableToolbar from "../../../Common/DataTable/Toolbar/SitesInputDataTableToolbar";
import calculateVGP from "../../../../utils/statistics/calculation/calculateVGP";
import useApiRef from "../useApiRef";
import { setVGPData } from "../../../../services/reducers/dirPage";
import VGPDataTableSkeleton from "./VGPDataTableSkeleton";
import VGPDataTableToolbar from "../../../Common/DataTable/Toolbar/VGPDataTableToolbar";
import { useCellModesModel } from "../../hooks";
import { VGPDataTableColumns, VGPRow } from "../types";

const VGPDataTable: FC = () => {
  const { cellModesModel, handleCellModesModelChange } = useCellModesModel();

  const { hiddenDirectionsIDs, vgpData } = useAppSelector(state => state.dirPageReducer);

  const columns: VGPDataTableColumns = [
    { field: 'id', headerName: 'ID', type: 'string', minWidth: 20, width: 30 },
    { field: 'index', headerName: '№', type: 'string', minWidth: 20, width: 30 },
    { field: 'poleLatitude', headerName: 'pole lat', type: 'number', width: 60,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'poleLongitude', headerName: 'pole lon', type: 'number', width: 70,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    // { field: 'poleLongitudeW', headerName: 'pole lon W', type: 'number', width: 72,
    //   valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    // },
    // { field: 'poleLongitudeE', headerName: 'pole lon E', type: 'number', width: 72,
    //   valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    // },
    { field: 'paleoLatitude', headerName: 'paleo lat', type: 'number', width: 70,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'dp', headerName: 'dp', type: 'number', minWidth: 20, width: 50,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'dm', headerName: 'dm', type: 'number', minWidth: 20, width: 50,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'sLat', headerName: 'site Lat', type: 'number', width: 60,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'sLon', headerName: 'site Lon', type: 'number', width: 60,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'age', headerName: 'age', type: 'number', width: 60,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'plateId', headerName: 'plate ID', type: 'number', width: 60,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(0)
    },
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
    col.disableColumnMenu = true;
  });

  if (!vgpData) return <VGPDataTableSkeleton />;

  let visibleIndex = 1;
  const rows: VGPRow[] = vgpData.map((vgp, index) => {
    const { id, poleLatitude, poleLongitude, paleoLatitude, dp, dm } = vgp;
    return {
      id,
      index: hiddenDirectionsIDs.includes(id) ? '-' : visibleIndex++,
      poleLatitude,
      poleLongitude,
      // poleLongitudeW: poleLongitude,
      // poleLongitudeE: Math.abs(poleLongitude - 360),
      paleoLatitude,
      dp,
      dm,
      sLat: vgp.lat,
      sLon: vgp.lon,
      age: vgp.age,
      plateId: vgp.plateId,
    };
  });

  return <>
    <VGPDataTableSkeleton>
      <DataGrid 
        rows={rows} 
        columns={columns}
        cellModesModel={cellModesModel}
        onCellModesModelChange={handleCellModesModelChange}
        sx={{
          ...GetDataTableBaseStyle(),
          '& .MuiDataGrid-cell': {
            padding: '0px 0px',
          },
          '& .MuiDataGrid-columnHeader': {
            padding: '0px 0px',
          }
        }}
        hideFooter={rows.length < 100}
        density={'compact'}
        components={{
          Toolbar: VGPDataTableToolbar,
        }}
        disableRowSelectionOnClick={true}
      />
    </VGPDataTableSkeleton>
  </>;
};

export default VGPDataTable;
