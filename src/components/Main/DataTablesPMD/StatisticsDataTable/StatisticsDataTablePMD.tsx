import React, { FC, useEffect, useState } from "react";
import styles from './StatisticsDataTablePMD.module.scss';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import StatisticsDataTablePMDSkeleton from './StatisticsDataTablePMDSkeleton';
import { GetDataTableBaseStyle } from "../styleConstants";
import { DataGridDIRRow, StatisitcsInterpretation } from "../../../../utils/GlobalTypes";
import PMDStatisticsDataTableToolbar from "../../../Sub/DataTable/Toolbar/PMDStatisticsDataTableToolbar";
import { useAppSelector } from "../../../../services/store/hooks";

interface IStatisticsDataTablePMD {
  data: Array<StatisitcsInterpretation> | null;
};

const StatisticsDataTablePMD: FC<IStatisticsDataTablePMD> = ({ data }) => {

  const theme = useTheme();

  const { currentInterpretation } = useAppSelector(state => state.pcaPageReducer);
  const [currentClass, setCurrentClass] = useState(styles.current_dark);

  useEffect(() => {
    setCurrentClass(theme.palette.mode === 'dark' ? styles.current_dark : styles.current_light);
  }, [theme])

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', type: 'string', width: 90 },
    { field: 'code', headerName: 'Code', type: 'string', width: 70 },
    { field: 'stepRange', headerName: 'StepRange', type: 'string', width: 120 },
    { field: 'stepCount', headerName: 'N', type: 'number', width: 40 },
    { field: 'Dgeo', headerName: 'Dgeo', type: 'number', width: 70 },
    { field: 'Igeo', headerName: 'Igeo', type: 'number', width: 70 },
    { field: 'Dstrat', headerName: 'Dstrat', type: 'number', width: 70 },
    { field: 'Istrat', headerName: 'Istrat', type: 'number', width: 70 },
    { field: 'confidenceRadius', headerName: 'MAD', type: 'string', width: 70 },
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
    col.disableColumnMenu = true;
  });

  if (!data || !data.length) return <StatisticsDataTablePMDSkeleton />;

  const rows: Array<Omit<DataGridDIRRow, 'comment'>> = data.map((statistics, index) => {
    const { id, code, stepRange, stepCount, Dgeo, Igeo, Dstrat, Istrat, confidenceRadius } = statistics;
    return {
      id,
      code, 
      stepRange,
      stepCount,
      Dgeo: +Dgeo.toFixed(1),
      Igeo: +Igeo.toFixed(1),
      Dstrat: +Dstrat.toFixed(1),
      Istrat: +Istrat.toFixed(1),
      confidenceRadius: +confidenceRadius.toFixed(1),
    };
  });

  return (
    <StatisticsDataTablePMDSkeleton>
      <DataGrid 
        rows={rows} 
        columns={columns} 
        sx={GetDataTableBaseStyle()}
        hideFooter={true}
        density={'compact'}
        disableSelectionOnClick={true}
        getRowClassName={
          (params) => params.row.id === currentInterpretation?.id ? currentClass : ''
        }
      />
    </StatisticsDataTablePMDSkeleton>
  );
};

export default StatisticsDataTablePMD;
