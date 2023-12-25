import React, { FC, useEffect, useState, useCallback } from "react";
import styles from './StatisticsDataTableDIR.module.scss';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridActionsCellItem, GridColumns, GridColumnHeaderParams, GridValueFormatterParams, GridEditRowsModel, GridCellParams, MuiEvent } from '@mui/x-data-grid';
import StatisticsDataTablePMDSkeleton from './StatisticsDataTableDIRSkeleton';
import { GetDataTableBaseStyle } from "../styleConstants";
import { DataGridDIRFromDIRRow, StatisitcsInterpretationFromDIR } from "../../../../utils/GlobalTypes";
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { useAppDispatch, useAppSelector } from "../../../../services/store/hooks";
import { deleteInterpretation, setAllInterpretations, updateCurrentFileInterpretations, setLastInterpretationAsCurrent, setCurrentInterpretationByLabel, setNextOrPrevInterpretationAsCurrent } from "../../../../services/reducers/dirPage";
import DIRStatisticsDataTableToolbar from "../../../Common/DataTable/Toolbar/DIRStatisticsDataTableToolbar";
import equal from "deep-equal"
import { acitvateHotkeys, deactivateHotkeys } from "../../../../services/reducers/appSettings";

interface IStatisticsDataTableDIR {
  currentFileInterpretations: Array<StatisitcsInterpretationFromDIR> | null;
};

const StatisticsDataTableDIR: FC<IStatisticsDataTableDIR> = ({ currentFileInterpretations }) => {

  const dispatch = useAppDispatch();
  const theme = useTheme();

  const { currentInterpretation, allInterpretations } = useAppSelector(state => state.dirPageReducer);
  const [editRowsModel, setEditRowsModel] = useState<GridEditRowsModel>({});
  const [currentClass, setCurrentClass] = useState(styles.current_dark);

  const handleEditRowsModelChange = useCallback((model: GridEditRowsModel) => {
    setEditRowsModel(model);
  }, []);

  useEffect(() => {
    setCurrentClass(theme.palette.mode === 'dark' ? styles.current_dark : styles.current_light);
  }, [theme]);

  useEffect(() => {
    if (currentFileInterpretations && Object.keys(editRowsModel).length !== 0) {
      const updatedAllInterpretations = allInterpretations.map((interpretation) => {
        const rowId = Object.keys(editRowsModel)[0];
        const newComment = editRowsModel[rowId]?.comment?.value as string;
        console.log('here', rowId, interpretation.uuid);
        if (rowId !== interpretation.label) return interpretation;
        return {
          ...interpretation,
          comment: newComment
        };
      });
      if (!equal(updatedAllInterpretations, allInterpretations)) {
        dispatch(setAllInterpretations(updatedAllInterpretations));
        dispatch(updateCurrentFileInterpretations(currentFileInterpretations[0].parentFile));
        dispatch(setLastInterpretationAsCurrent());
      }
    };
  }, [currentFileInterpretations, editRowsModel, allInterpretations]);

  useEffect(() => {
    window.addEventListener("keydown", handleArrowBtnClick);
    return () => {
      window.removeEventListener("keydown", handleArrowBtnClick);
    };
  }, []);

  const handleArrowBtnClick = (e: any) => {
    const key = (e.code as string);
    const { shiftKey } = e; 
    if ((shiftKey) && key === 'ArrowUp') {
      dispatch(setNextOrPrevInterpretationAsCurrent({ changeDirection: 'up' }));
    };
    if ((shiftKey) && key === 'ArrowDown') {
      dispatch(setNextOrPrevInterpretationAsCurrent({ changeDirection: 'down' }));
    };
  }

  const handleRowDelete = (id: string) => (event: any) => {
    event.stopPropagation();
    dispatch(deleteInterpretation(id));
    if (currentFileInterpretations) {
      dispatch(updateCurrentFileInterpretations(currentFileInterpretations[0].parentFile));
      dispatch(setLastInterpretationAsCurrent());
    };
  };

  const handleDeleteAllRows = (event: any) => {
    event.stopPropagation();
    if (currentFileInterpretations) {
      currentFileInterpretations.forEach(interpretation => {
        dispatch(deleteInterpretation(interpretation.label));
      });
      dispatch(updateCurrentFileInterpretations(currentFileInterpretations[0].parentFile));
      dispatch(setLastInterpretationAsCurrent());
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

  if (!currentFileInterpretations || !currentFileInterpretations.length) return <StatisticsDataTablePMDSkeleton />;

  const rows: Array<Omit<DataGridDIRFromDIRRow, | 'id' | 'label'>> = currentFileInterpretations.map((statistics) => {
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

  const setRowAsCurrentInterpretation = (rowId: string) => {
    dispatch(setCurrentInterpretationByLabel({label: rowId}));
  }

  return (
    <StatisticsDataTablePMDSkeleton>
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
        onRowClick={(params) => setRowAsCurrentInterpretation(params.row.id)}
      />
    </StatisticsDataTablePMDSkeleton>
  );
};

export default StatisticsDataTableDIR;
