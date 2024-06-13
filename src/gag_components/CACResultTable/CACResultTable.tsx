import React, { FC, useEffect, useState, useCallback } from "react";
import styles from './CACResultTable.module.scss';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridActionsCellItem, GridColumns, GridColumnHeaderParams, GridValueFormatterParams, GridEditRowsModel, GridCellParams, MuiEvent } from '@mui/x-data-grid';
import StatisticsDataTablePMDSkeleton from '../../../src/components/AppLogic/DataTablesDIR/StatisticsDataTable/StatisticsDataTableDIRSkeleton';
import { GetDataTableBaseStyle } from "../../../src/components/AppLogic/DataTablesDIR/styleConstants";
import { DataGridDIRFromDIRRow, StatisitcsInterpretationFromDIR } from "../../../src/utils/GlobalTypes";
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { useAppDispatch, useAppSelector } from "../../../src/services/store/hooks";
import { deleteInterpretation, setAllInterpretations, updateCurrentFileInterpretations, updateCurrentInterpretation } from "../../../src/services/reducers/dirPage";
import DIRStatisticsDataTableToolbar from "../../../src/components/Common/DataTable/Toolbar/DIRStatisticsDataTableToolbar";
import equal from "deep-equal"
import { acitvateHotkeys, deactivateHotkeys } from "../../../src/services/reducers/appSettings";

interface IStatisticsDataTableDIR {
  data: Array<StatisitcsInterpretationFromDIR> | null;
};

const CACDataTable: FC<IStatisticsDataTableDIR> = ({ data }) => {

  const dispatch = useAppDispatch();
  const theme = useTheme();

  const { currentInterpretation } = useAppSelector(state => state.dirPageReducer);
  const [editRowsModel, setEditRowsModel] = useState<GridEditRowsModel>({});
  const [currentClass, setCurrentClass] = useState(styles.current_dark);

  const handleEditRowsModelChange = useCallback((model: GridEditRowsModel) => {
    setEditRowsModel(model);
  }, []);

  useEffect(() => {
    setCurrentClass(theme.palette.mode === 'dark' ? styles.current_dark : styles.current_light);
  }, [theme]);

  useEffect(() => {
    if (data && Object.keys(editRowsModel).length !== 0) {
      const updatedData = data.map((interpretation, index) => {
        const rowId = Object.keys(editRowsModel)[0];
        const newComment = editRowsModel[rowId]?.comment?.value as string;
        if (rowId !== interpretation.label) return interpretation;
        return {
          ...interpretation,
          comment: newComment
        };
      });
      if (!equal(updatedData, data)) {
        dispatch(setAllInterpretations(updatedData));
        dispatch(updateCurrentFileInterpretations(data[0].parentFile));
        dispatch(updateCurrentInterpretation());
      }
    };
  }, [data, editRowsModel]);

  const handleRowDelete = (id: string) => (event: any) => {
    event.stopPropagation();
    dispatch(deleteInterpretation(id));
    if (data) {
      dispatch(updateCurrentFileInterpretations(data[0].parentFile));
      dispatch(updateCurrentInterpretation());
    };
  };

  const handleDeleteAllRows = (event: any) => {
    event.stopPropagation();
    if (data) {
      data.forEach(interpretation => {
        dispatch(deleteInterpretation(interpretation.label));
      });
      dispatch(updateCurrentFileInterpretations(data[0].parentFile));
      dispatch(updateCurrentInterpretation());
    };
  };

  const columns: GridColumns = [
    {
      field: 'actions',
      type: 'actions',
      minWidth: 40,
      width: 40,
      renderHeader: (params: GridColumnHeaderParams) => (
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete all interpretations"
          onClick={handleDeleteAllRows}
          color="inherit"
        />
      ),
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete interpretation"
            onClick={handleRowDelete(id as string)}
            color="inherit"
          />,
        ];
      },
    },
    { field: 'id', headerName: 'Label', type: 'string', width: 70 },
    { field: 'code', headerName: 'Code', type: 'string', width: 60 },
    { field: 'stepRange', headerName: 'StepRange', type: 'string', width: 90 },
    { field: 'stepCount', headerName: 'N', type: 'number', minWidth: 30, width: 30 },
    { field: 'Dgeo', headerName: 'Dgeo', type: 'number', width: 70,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'Igeo', headerName: 'Igeo', type: 'number', width: 60,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'accuracyGeo', headerName: 'Kgeo', type: 'string', width: 60,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'confidenceRadiusGeo', headerName: 'MADgeo', type: 'string', width: 80,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'Dstrat', headerName: 'Dstrat', type: 'number', width: 70,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'Istrat', headerName: 'Istrat', type: 'number', width: 60,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'accuracyStrat', headerName: 'Kstrat', type: 'string', width: 60,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'confidenceRadiusStrat', headerName: 'MADstrat', type: 'string', width: 80,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'comment', headerName: 'Comment', type: 'string', minWidth: 210, flex: 1, editable: true, cellClassName: styles[`editableCell_${theme.palette.mode}`] },
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
    col.disableColumnMenu = true;
  });

  if (!data || !data.length) return <></>;

  const rows: Array<Omit<DataGridDIRFromDIRRow, | 'id' | 'label'>> = data.map((statistics, index) => {
    const { label, code, stepRange, stepCount, Dgeo, Igeo, Dstrat, Istrat, confidenceRadiusGeo, Kgeo, confidenceRadiusStrat, Kstrat, comment } = statistics;
    return {
      id: label,
      code, 
      stepRange,
      stepCount,
      Dgeo: +Dgeo.toFixed(1),
      Igeo: +Igeo.toFixed(1),
      Dstrat: +Dstrat.toFixed(1),
      Istrat: +Istrat.toFixed(1),
      confidenceRadiusGeo: +confidenceRadiusGeo.toFixed(1),
      accuracyGeo: +(Kgeo || 0).toFixed(1),
      confidenceRadiusStrat: +confidenceRadiusStrat.toFixed(1),
      accuracyStrat: +(Kstrat || 0).toFixed(1),
      comment
    };
  });

  return (

    <>
    {
      data[0].label
      
    }



      <DataGrid 
        rows={rows} 
        columns={columns} 
        editRowsModel={editRowsModel}
        onEditRowsModelChange={handleEditRowsModelChange}
        onCellEditStart={(params: GridCellParams, event: MuiEvent) => {
          dispatch(deactivateHotkeys());
        }}
        onCellEditStop={(params: GridCellParams, event: MuiEvent) => {
          dispatch(acitvateHotkeys());
        }}
        sx={{
          ...GetDataTableBaseStyle(),
          '& .MuiDataGrid-cell': {
            padding: '0px 0px',
          },
          '& .MuiDataGrid-columnHeader': {
            padding: '0px 0px',
          },
          p: '0 4px 0 0'
        }}
        hideFooter={rows.length < 100}
        density={'compact'}
        disableSelectionOnClick={true}
        getRowClassName={
          (params) => params.row.id === currentInterpretation?.label ? currentClass : ''
        }
        components={{
          Toolbar: DIRStatisticsDataTableToolbar
        }}
      />
  </>


  );
};

export default CACDataTable;

