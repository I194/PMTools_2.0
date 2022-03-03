import React, { FC } from "react";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import StatisticsDataTablePMDSkeleton from './StatisticsDataTablePMDSkeleton';
import { GetDataTableBaseStyle } from "../styleConstants";
import { DataGridDIRRow, StatisitcsInterpretation } from "../../../../utils/GlobalTypes";

interface IStatisticsDataTablePMD {
  data: Array<StatisitcsInterpretation> | null;
};

const StatisticsDataTablePMD: FC<IStatisticsDataTablePMD> = ({ data }) => {

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', type: 'string', width: 40 },
    { field: 'code', headerName: 'Code', type: 'string', width: 70 },
    { field: 'stepRange', headerName: 'StepRange', type: 'string', width: 70 },
    { field: 'stepCount', headerName: 'N', type: 'number', width: 70 },
    { field: 'Dgeo', headerName: 'Dgeo', type: 'number', width: 70 },
    { field: 'Igeo', headerName: 'Igeo', type: 'number', width: 70 },
    { field: 'Dstrat', headerName: 'Dstrat', type: 'number', width: 70 },
    { field: 'Istrat', headerName: 'Istrat', type: 'number', width: 70 },
    { field: 'confidenceRadius', headerName: 'MAD', type: 'string', width: 70 },
    { field: 'comment', headerName: 'Comment', type: 'string', width: 200, editable: true }
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
  });

  if (!data) return <StatisticsDataTablePMDSkeleton />;

  const rows: Array<DataGridDIRRow> = data.map((statistics, index) => {
    const { id, code, stepRange, stepCount, Dgeo, Igeo, Dstrat, Istrat, confidenceRadius, comment } = statistics;
    return {
      id,
      code, 
      stepRange,
      stepCount,
      Dgeo,
      Igeo,
      Dstrat,
      Istrat,
      confidenceRadius,
      comment
    };
  });

  return (
    <StatisticsDataTablePMDSkeleton>
      <DataGrid 
        rows={rows} 
        columns={columns} 
        sx={GetDataTableBaseStyle()}
        hideFooter={true}
        autoHeight={true}
        density={'compact'}
        disableSelectionOnClick={true}
      />
    </StatisticsDataTablePMDSkeleton>
  );
};

export default StatisticsDataTablePMD;
