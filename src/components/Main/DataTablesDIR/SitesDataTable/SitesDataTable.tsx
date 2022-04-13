import React, { FC, useCallback, useEffect, useState } from "react";
import styles from './SitesDataTable.module.scss';
import { useAppDispatch, useAppSelector } from "../../../../services/store/hooks";
import equal from "deep-equal"
import { GetDataTableBaseStyle } from "../styleConstants";
import SitesDataTableSkeleton from './SitesDataTableSkeleton';
import { DataGridDIRRow, IDirData } from "../../../../utils/GlobalTypes";
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

type SiteRow = {
  id: number;
  label: string;
  index: number | string;
  lat: number;
  lon: number;
};

interface IDataTableDIR {
  data: IDirData | null;
};


const SitesDataTable: FC<IDataTableDIR> = ({ data }) => {
  
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
    { field: 'lat', headerName: 'Lat', type: 'number', flex: 1, editable: true, cellClassName: styles[`editableCell_${theme.palette.mode}`] },
    { field: 'lon', headerName: 'Lon', type: 'number', flex: 1, editable: true, cellClassName: styles[`editableCell_${theme.palette.mode}`] },
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
    col.disableColumnMenu = true;
  });

  console.log(data)

  if (!data) return <SitesDataTableSkeleton />;
  let visibleIndex = 1;
  const rows: Array<SiteRow> = data.interpretations.map((interpretation, index) => {
    const { id, label } = interpretation;
    return {
      id,
      index: hiddenDirectionsIDs.includes(id) ? '-' : visibleIndex++,
      label,
      lat: 0,
      lon: 0,
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
            Toolbar: DIROutputDataTableToolbar,
          }}
          disableSelectionOnClick={true}
        />
      </SitesDataTableSkeleton>
    </>
    
  );
};

export default SitesDataTable;
