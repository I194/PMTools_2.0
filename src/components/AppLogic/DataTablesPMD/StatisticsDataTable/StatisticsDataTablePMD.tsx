import React, { FC, useEffect, useState, useCallback } from "react";
import styles from './StatisticsDataTablePMD.module.scss';
import { useTheme } from '@mui/material/styles';
import { 
  DataGrid, GridActionsCellItem, GridColumns, GridColumnHeaderParams, GridValueFormatterParams, 
  GridEditRowsModel, MuiEvent, GridCellParams,
} from '@mui/x-data-grid';
import StatisticsDataTablePMDSkeleton from './StatisticsDataTablePMDSkeleton';
import { GetDataTableBaseStyle } from "../styleConstants";
import { DataGridDIRFromPCARow, StatisitcsInterpretationFromPCA } from "../../../../utils/GlobalTypes";
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { useAppDispatch, useAppSelector } from "../../../../services/store/hooks";
import { deleteInterpretation, setAllInterpretations, updateCurrentFileInterpretations, updateCurrentInterpretation } from "../../../../services/reducers/pcaPage";
import PMDStatisticsDataTableToolbar from "../../../Sub/DataTable/Toolbar/PMDStatisticsDataTableToolbar";
import equal from "deep-equal";
import { acitvateHotkeys, deactivateHotkeys } from "../../../../services/reducers/appSettings";

interface IStatisticsDataTablePMD {
  data: Array<StatisitcsInterpretationFromPCA> | null;
};

const StatisticsDataTablePMD: FC<IStatisticsDataTablePMD> = ({ data }) => {

  const dispatch = useAppDispatch();
  const theme = useTheme();

  const { currentInterpretation } = useAppSelector(state => state.pcaPageReducer);
  const [editRowsModel, setEditRowsModel] = useState<GridEditRowsModel>({});
  const [currentClass, setCurrentClass] = useState(styles.current_dark);

  const handleEditRowsModelChange = useCallback((model: GridEditRowsModel) => {
    setEditRowsModel(model);
  }, []);

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

  useEffect(() => {
    setCurrentClass(theme.palette.mode === 'dark' ? styles.current_dark : styles.current_light);
  }, [theme]);

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
    { field: 'id', headerName: 'ID', type: 'string', width: 50, hide: true},
    { field: 'label', headerName: 'Label', type: 'string', width: 70  },
    { field: 'code', headerName: 'Code', type: 'string', width: 50 },
    { field: 'stepRange', headerName: 'StepRange', type: 'string', width: 90 },
    { field: 'stepCount', headerName: 'N', type: 'number', minWidth: 24, width: 24 },
    { field: 'Dgeo', headerName: 'Dgeo', type: 'number', width: 60,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'Igeo', headerName: 'Igeo', type: 'number', width: 50,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'Dstrat', headerName: 'Dstrat', type: 'number', width: 60,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'Istrat', headerName: 'Istrat', type: 'number', width: 50,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'confidenceRadius', headerName: 'MAD', type: 'string', width: 50,
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

  if (!data || !data.length) return <StatisticsDataTablePMDSkeleton />;

  const rows: Array<Omit<DataGridDIRFromPCARow, 'comment' | 'id' | 'label' | 'uuid'>> = data.map((statistics, index) => {
    const { uuid, label, code, stepRange, stepCount, Dgeo, Igeo, Dstrat, Istrat, confidenceRadius, comment } = statistics;
    return {
      id: uuid,
      label,
      code, 
      stepRange,
      stepCount,
      Dgeo: +Dgeo.toFixed(1),
      Igeo: +Igeo.toFixed(1),
      Dstrat: +Dstrat.toFixed(1),
      Istrat: +Istrat.toFixed(1),
      confidenceRadius: +confidenceRadius.toFixed(1),
      comment
    };
  });

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
          Toolbar: PMDStatisticsDataTableToolbar,
        }}
      />
    </StatisticsDataTablePMDSkeleton>
  );
};

export default StatisticsDataTablePMD;
