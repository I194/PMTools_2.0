import React, { FC, useEffect, useState } from "react";
import styles from './StatisticsDataTableDIR.module.scss';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridActionsCellItem, GridColumns, GridColumnHeaderParams, GridValueFormatterParams } from '@mui/x-data-grid';
import StatisticsDataTablePMDSkeleton from './StatisticsDataTableDIRSkeleton';
import { GetDataTableBaseStyle } from "../styleConstants";
import { DataGridDIRRow, StatisitcsInterpretation } from "../../../../utils/GlobalTypes";
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { useAppDispatch, useAppSelector } from "../../../../services/store/hooks";
import { deleteInterpretation, updateCurrentFileInterpretations, updateCurrentInterpretation } from "../../../../services/reducers/dirPage";

interface IStatisticsDataTableDIR {
  data: Array<StatisitcsInterpretation> | null;
};

const StatisticsDataTableDIR: FC<IStatisticsDataTableDIR> = ({ data }) => {

  const dispatch = useAppDispatch();
  const theme = useTheme();

  const { currentInterpretation } = useAppSelector(state => state.dirPageReducer);
  const [currentClass, setCurrentClass] = useState(styles.current_dark);

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
    { field: 'id', headerName: 'Label', type: 'string', flex: 1 },
    { field: 'code', headerName: 'Code', type: 'string', flex: 1 },
    { field: 'stepRange', headerName: 'StepRange', type: 'string', width: 90 },
    { field: 'stepCount', headerName: 'N', type: 'number', minWidth: 30, width: 30 },
    { field: 'Dgeo', headerName: 'Dgeo', type: 'number', flex: 1,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'Igeo', headerName: 'Igeo', type: 'number', flex: 1,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'Dstrat', headerName: 'Dstrat', type: 'number', flex: 1,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'Istrat', headerName: 'Istrat', type: 'number', flex: 1,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'confidenceRadius', headerName: 'MAD', type: 'string', flex: 1,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'accuracy', headerName: 'k', type: 'string', flex: 1,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
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
    }
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
    col.disableColumnMenu = true;
  });

  if (!data || !data.length) return <StatisticsDataTablePMDSkeleton />;

  const rows: Array<Omit<DataGridDIRRow, 'comment' | 'id' | 'label'>> = data.map((statistics, index) => {
    const { label, code, stepRange, stepCount, Dgeo, Igeo, Dstrat, Istrat, confidenceRadius, k } = statistics;
    return {
      id: label,
      code, 
      stepRange,
      stepCount,
      Dgeo: +Dgeo.toFixed(1),
      Igeo: +Igeo.toFixed(1),
      Dstrat: +Dstrat.toFixed(1),
      Istrat: +Istrat.toFixed(1),
      confidenceRadius: +confidenceRadius.toFixed(1),
      accuracy: k ? +k.toFixed(1) : 0,
    };
  });

  return (
    <StatisticsDataTablePMDSkeleton>
      <DataGrid 
        rows={rows} 
        columns={columns} 
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
        disableSelectionOnClick={true}
        getRowClassName={
          (params) => params.row.id === currentInterpretation?.label ? currentClass : ''
        }
      />
    </StatisticsDataTablePMDSkeleton>
  );
};

export default StatisticsDataTableDIR;
