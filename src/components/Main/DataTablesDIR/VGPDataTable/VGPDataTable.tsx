import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import styles from './VGPDataTable.module.scss';
import { useAppDispatch, useAppSelector } from "../../../../services/store/hooks";
import { GetDataTableBaseStyle } from "../styleConstants";
import SitesDataTableSkeleton from './VGPDataTableSkeleton';
import { VGPData } from "../../../../utils/GlobalTypes";
import { 
  DataGrid, 
  GridColumns, 
  GridEditRowsModel,
  GridValueFormatterParams, 
} from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import { Button } from "@mui/material";
import SitesInputDataTableToolbar from "../../../Sub/DataTable/Toolbar/SitesInputDataTableToolbar";
import calculateVGP from "../../../../utils/statistics/calculation/calculateVGP";
import useApiRef from "../useApiRef";
import { setVGPData } from "../../../../services/reducers/dirPage";
import VGPDataTableSkeleton from "./VGPDataTableSkeleton";

type VGPRow = {
  id: number;
  index: number | string;
  poleLatitude: number,
  poleLongitude: number,
  paleoLatitude: number,
  dp: number,
  dm: number,
};

const VGPDataTable: FC = () => {
  
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const { selectedDirectionsIDs, hiddenDirectionsIDs, reference, vgpData } = useAppSelector(state => state.dirPageReducer);
  const [editRowsModel, setEditRowsModel] = useState<GridEditRowsModel>({});

  const handleEditRowsModelChange = useCallback((model: GridEditRowsModel) => {
    setEditRowsModel(model);
  }, []);

  const columns: GridColumns = [
    { field: 'id', headerName: 'ID', type: 'string', width: 30 },
    { field: 'index', headerName: '№', type: 'string', width: 30 },
    { field: 'poleLatitude', headerName: 'pole lat', type: 'number', flex: 1,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'poleLongitude', headerName: 'pole lon', type: 'number', flex: 1,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'paleoLatitude', headerName: 'paleo lat', type: 'number', flex: 1,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'dp', headerName: 'dp', type: 'number', width: 60,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'dm', headerName: 'dm', type: 'number', width: 60,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
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
  const rows: Array<VGPRow> = vgpData.map((vgp, index) => {
    const { id, poleLatitude, poleLongitude, paleoLatitude, dp, dm } = vgp;
    return {
      id,
      index: hiddenDirectionsIDs.includes(id) ? '-' : visibleIndex++,
      poleLatitude,
      poleLongitude,
      paleoLatitude,
      dp,
      dm,
    };
  });

  return (
    <>
      <VGPDataTableSkeleton>
        <DataGrid 
          rows={rows} 
          columns={columns}
          editRowsModel={editRowsModel}
          onEditRowsModelChange={handleEditRowsModelChange}
          sx={{
            ...GetDataTableBaseStyle(),
            '& .MuiDataGrid-cell': {
              padding: '0px 0px',
            },
            '& .MuiDataGrid-columnHeader': {
              padding: '0px 0px',
            }
          }}
          hideFooter={true}
          density={'compact'}
          components={{
            Toolbar: SitesInputDataTableToolbar,
          }}
          disableSelectionOnClick={true}
        />
      </VGPDataTableSkeleton>
    </>
    
  );
};

export default VGPDataTable;
