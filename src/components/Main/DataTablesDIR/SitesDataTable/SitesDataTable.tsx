import React, { FC, useCallback, useEffect, useState } from "react";
import styles from './SitesDataTable.module.scss';
import { useAppDispatch, useAppSelector } from "../../../../services/store/hooks";
import equal from "deep-equal"
import { GetDataTableBaseStyle } from "../styleConstants";
import SitesDataTableSkeleton from './SitesDataTableSkeleton';
import { DataGridDIRRow, IDirData, ISitesLatLon } from "../../../../utils/GlobalTypes";
import { setAllInterpretations,  } from "../../../../services/reducers/dirPage";
import { 
  DataGrid, 
  GridActionsCellItem, 
  GridColumnHeaderParams, 
  GridColumns, 
  GridEditRowsModel,
  GridValueFormatterParams, 
} from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import DIROutputDataTableToolbar from "../../../Sub/DataTable/Toolbar/DIROutputDataTableToolbar";
import SitesInputDataTableToolbar from "../../../Sub/DataTable/Toolbar/SitesInputDataTableToolbar";

type SiteRow = {
  id: number;
  label: string;
  index: number | string;
  lat: number;
  lon: number;
};

interface IDataTableDIR {
  data: IDirData | null;
  latLonData?: ISitesLatLon['coords'];
};


const SitesDataTable: FC<IDataTableDIR> = ({ data, latLonData }) => {
  
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const { dirStatData, currentDataDIRid } = useAppSelector(state => state.parsedDataReducer);
  const { selectedDirectionsIDs, hiddenDirectionsIDs } = useAppSelector(state => state.dirPageReducer);
  const [editRowsModel, setEditRowsModel] = useState<GridEditRowsModel>({});

  const handleEditRowsModelChange = useCallback((model: GridEditRowsModel) => {
    setEditRowsModel(model);
  }, []);

  const columns: GridColumns = [
    { field: 'id', headerName: 'ID', type: 'string', width: 30 },
    { field: 'index', headerName: '№', type: 'string', width: 30 },
    { field: 'label', headerName: 'Label', type: 'string', width: 80 },
    { field: 'lat', headerName: 'Lat', type: 'number', flex: 1, editable: true, 
      cellClassName: styles[`editableCell_${theme.palette.mode}`],
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'lon', headerName: 'Lon', type: 'number', flex: 1, editable: true, 
      cellClassName: styles[`editableCell_${theme.palette.mode}`],
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
    col.disableColumnMenu = true;
  });

  if (!data) return <SitesDataTableSkeleton />;
  console.log(latLonData);
  let visibleIndex = 1;
  const rows: Array<SiteRow> = data.interpretations.map((interpretation, index) => {
    const { id, label } = interpretation;
    return {
      id,
      index: hiddenDirectionsIDs.includes(id) ? '-' : visibleIndex++,
      label,
      lat: latLonData ? latLonData[index]?.lat : 0,
      lon: latLonData ? latLonData[index]?.lon : 0,
    };
  });
  
  return (
    <>
      <SitesDataTableSkeleton>
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
      </SitesDataTableSkeleton>
    </>
    
  );
};

export default SitesDataTable;
