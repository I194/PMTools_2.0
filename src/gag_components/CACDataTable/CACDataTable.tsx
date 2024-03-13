


import React, { FC, useEffect, useState } from "react";
import styles from './CACDataTable.module.scss';
import { DataGridDIRFromDIRRow, IDirData } from "../../../src/utils/GlobalTypes";
import { DataGrid, GridActionsCellItem, GridColumnHeaderParams, GridColumns, GridSelectionModel, GridValueFormatterParams } from '@mui/x-data-grid';
import DataTableDIRSkeleton from '../../../src/components/AppLogic/DataTablesDIR/InputDataTable/DataTableDIRSkeleton';
import { useAppDispatch, useAppSelector } from "../../../src/services/store/hooks";
import { setSelectedDirectionsIDs, setHiddenDirectionsIDs, setReversedDirectionsIDs } from "../../../src/services/reducers/dirPage";
import { GetDataTableBaseStyle } from "../../../src/components/AppLogic/DataTablesDIR/styleConstants";
import PMDInputDataTableToolbar from "../../../src/components/Common/DataTable/Toolbar/PMDInputDataTableToolbar";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { StatisticsModeDIR } from "../../../src/utils/graphs/types";


import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';

import { useTheme } from '@mui/material/styles';
import {
  primaryColor,
} from '../../../src/utils/ThemeConstants';
import Direction from "../../../src/utils/graphs/classes/Direction";






// import React, { FC, useEffect, useState, useCallback } from "react";
// import styles from './CACDataTable.module.scss';
// import { useTheme } from '@mui/material/styles';
// import { DataGrid, GridActionsCellItem, GridColumns, GridColumnHeaderParams, GridValueFormatterParams, GridEditRowsModel, GridCellParams, MuiEvent } from '@mui/x-data-grid';
// import StatisticsDataTablePMDSkeleton from '../../../src/components/AppLogic/DataTablesDIR/StatisticsDataTable/StatisticsDataTableDIRSkeleton';
// import { GetDataTableBaseStyle } from "../../../src/components/AppLogic/DataTablesDIR/styleConstants";
// import { DataGridDIRFromDIRRow, StatisitcsInterpretationFromDIR } from "../../../src/utils/GlobalTypes";
// import DeleteIcon from '@mui/icons-material/DeleteOutlined';
// import { useAppDispatch, useAppSelector } from "../../../src/services/store/hooks";
// import { deleteInterpretation, setAllInterpretations, updateCurrentFileInterpretations, updateCurrentInterpretation } from "../../../src/services/reducers/dirPage";
// import DIRStatisticsDataTableToolbar from "../../../src/components/Common/DataTable/Toolbar/DIRStatisticsDataTableToolbar";
// import equal from "deep-equal"
// import { acitvateHotkeys, deactivateHotkeys } from "../../../src/services/reducers/appSettings";







interface IDataTableDIR {
  data: IDirData | null;
};

const DataTableDIR: FC<IDataTableDIR> = ({ data }) => {

  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { selectedDirectionsIDs, hiddenDirectionsIDs, reversedDirectionsIDs } = useAppSelector(state => state.dirPageReducer);

  // selectionModel is array of ID's of rows
  const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);
  const [selectedRows, setSelectedRows] = useState<Array<DataGridDIRFromDIRRow>>([]);

  useEffect(() => {
    if (selectedDirectionsIDs) setSelectionModel(selectedDirectionsIDs);
    else setSelectionModel([]); 
  }, [selectedDirectionsIDs]);

  const toggleRowVisibility = (id: number) => (event: any) => {
    event.stopPropagation();
    const newhiddenDirectionsIDs = hiddenDirectionsIDs.includes(id) 
      ? hiddenDirectionsIDs.filter(hiddenId => hiddenId !== id) 
      : [...hiddenDirectionsIDs, id];
    dispatch(setHiddenDirectionsIDs(newhiddenDirectionsIDs))
  };

  const toggleAllRowsVisibility = (event: any) => {
    dispatch(setHiddenDirectionsIDs([]));
  };

  const toggleRowPolarity = (id: number) => (event: any) => {
    event.stopPropagation();
    const newReversedDirectionsIDs = reversedDirectionsIDs.includes(id)
      ? reversedDirectionsIDs.filter(reversedId => reversedId !== id)
      : [...reversedDirectionsIDs, id];
    dispatch(setReversedDirectionsIDs(newReversedDirectionsIDs));
  };

  const toggleAllRowsPolarity = (event: any) => {
    reversedDirectionsIDs.length > 0 ? 
      dispatch(setReversedDirectionsIDs([])) : 
      dispatch(setReversedDirectionsIDs(data?.interpretations?.map(interpretation => interpretation.id) ?? []));
  };

  const columns: GridColumns = [
    {
      field: 'toggleVisibility',
      type: 'actions',
      width: 40,
      renderHeader: (params: GridColumnHeaderParams) => (
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="Hide all directions" 
          onClick={toggleAllRowsVisibility}
          color="inherit"
        />
      ),
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={hiddenDirectionsIDs.includes(id as number) ? <VisibilityOffIcon /> : <VisibilityIcon />} 
            label="Toggle direction visibility"
            onClick={toggleRowVisibility(id as number)}
            color="inherit"
          />,
        ];
      },
    },
    {
      field: 'reversePolarity',
      type: 'actions',
      width: 40,
      renderHeader: (params: GridColumnHeaderParams) => (
        <GridActionsCellItem
          icon={<SwapVertRoundedIcon />}
          label="Reverse polarity for all directions"
          onClick={toggleAllRowsPolarity}
          color="inherit"
        />
      ),
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={
              reversedDirectionsIDs.includes(id as number) ?               
              <SettingsBackupRestoreIcon sx={{fill: primaryColor(theme.palette.mode)}}/> :
              <SwapVertRoundedIcon /> 
            } 
            label="Toggle direction polarity"
            onClick={toggleRowPolarity(id as number)}
            color="inherit"
          />,
        ];
      },
    },
    { field: 'id', headerName: 'ID', type: 'number', width: 40 },
    { field: 'index', headerName: '№', type: 'number', width: 40 },
    { field: 'label', headerName: 'Label', type: 'string', width: 90 },
    { field: 'code', headerName: 'Code', type: 'string', width: 80 },
    { field: 'stepRange', headerName: 'StepRange', type: 'string', width: 120 },
    { field: 'stepCount', headerName: 'N', type: 'number', width: 40 },
    { field: 'Dgeo', headerName: 'Dgeo', type: 'number', width: 70,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'Igeo', headerName: 'Igeo', type: 'number', width: 70,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'accuracyGeo', headerName: 'Kgeo', type: 'string', width: 70,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'confidenceRadiusGeo', headerName: 'MADgeo', type: 'string', width: 80,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'Dstrat', headerName: 'Dstrat', type: 'number', width: 70,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'Istrat', headerName: 'Istrat', type: 'number', width: 70,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'accuracyStrat', headerName: 'Kstrat', type: 'string', width: 70,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'confidenceRadiusStrat', headerName: 'MADstrat', type: 'string', width: 80,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'comment', headerName: 'Comment', type: 'string', width: 200 },
    { field: 'lat', headerName: 'Lat', type: 'number', width: 70, },
    { field: 'lon', headerName: 'Lon', type: 'number', width: 70, },
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
  });
  
  if (!data) return <DataTableDIRSkeleton />;
  let visibleIndex = 1;
  const rows: Array<DataGridDIRFromDIRRow> = data.interpretations.map((interpretation, index) => {
    const { id, label, code, stepRange, stepCount, Dgeo, Igeo, Dstrat, Istrat, MADgeo, Kgeo, MADstrat, Kstrat, comment } = interpretation;
    let geoDirection = new Direction(Dgeo, Igeo, 1);
    let stratDirection = new Direction(Dstrat, Istrat, 1);
    if (reversedDirectionsIDs.includes(id)) {
      geoDirection = geoDirection.reversePolarity();
      stratDirection = stratDirection.reversePolarity();
    };
    const DgeoFinal = +geoDirection.declination.toFixed(1);
    const IgeoFinal = +geoDirection.inclination.toFixed(1);
    const DstratFinal = +stratDirection.declination.toFixed(1);
    const IstratFinal = +stratDirection.inclination.toFixed(1);
    return {
      id,
      index: hiddenDirectionsIDs.includes(id) ? '-' : visibleIndex++,
      label,
      code: code as StatisticsModeDIR, 
      stepRange,
      stepCount,
      Dgeo: DgeoFinal,
      Igeo: IgeoFinal,
      Dstrat: DstratFinal,
      Istrat: IstratFinal,
      confidenceRadiusGeo: +MADgeo.toFixed(1),
      accuracyGeo: +(Kgeo || 0).toFixed(1),
      confidenceRadiusStrat: +MADstrat.toFixed(1),
      accuracyStrat: +(Kstrat || 0).toFixed(1),
      comment
    };
  });

  return (
    // <DataTablePMDSkeleton>
      <DataGrid 
        rows={rows} 
        columns={columns} 
        checkboxSelection
        selectionModel={selectionModel}
        onSelectionModelChange={(e) => {
          setSelectionModel(e);
          const selectedIDs = new Set(e);
          if ([...selectedIDs].length > 0) dispatch(setSelectedDirectionsIDs([...selectedIDs]));
          else dispatch(setSelectedDirectionsIDs(null));
          const selectedRows = rows.filter((r) => selectedIDs.has(r.id));
          setSelectedRows(selectedRows);
        }}
        components={{
        //   Toolbar: DIRInputDataTableToolbar, 
        }}
        sx={{
          ...GetDataTableBaseStyle(),
          '& .MuiDataGrid-cell': {
            padding: '0px 0px',
          },
          '& .MuiDataGrid-columnHeader': {
            padding: '0px 0px',
          }
        }}
        density={'compact'}
        hideFooter={rows.length < 100}
        getRowClassName={
          (params) =>  hiddenDirectionsIDs.includes(params.row.id) ? styles.hiddenRow : ''
        }
      />
    // </DataTablePMDSkeleton>
  )
}

export default DataTableDIR;
