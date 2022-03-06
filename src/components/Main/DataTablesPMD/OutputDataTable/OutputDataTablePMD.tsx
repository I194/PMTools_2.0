import React, { FC } from "react";
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import StatisticsDataTablePMDSkeleton from './OutputDataTablePMDSkeleton';
import { GetDataTableBaseStyle } from "../styleConstants";
import { DataGridDIRRow, StatisitcsInterpretation } from "../../../../utils/GlobalTypes";
import PMDStatisticsDataTableToolbar from "../../../Sub/DataTable/Toolbar/PMDStatisticsDataTableToolbar";

interface IOutputDataTablePMD {
  data: Array<StatisitcsInterpretation> | null;
};

const OutputDataTablePMD: FC<IOutputDataTablePMD> = ({ data }) => {

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', type: 'string', width: 120 },
    { field: 'code', headerName: 'Code', type: 'string', width: 70 },
    { field: 'stepRange', headerName: 'StepRange', type: 'string', width: 120 },
    { field: 'stepCount', headerName: 'N', type: 'number', width: 40 },
    { field: 'Dgeo', headerName: 'Dgeo', type: 'number', width: 70 },
    { field: 'Igeo', headerName: 'Igeo', type: 'number', width: 70 },
    { field: 'Dstrat', headerName: 'Dstrat', type: 'number', width: 70 },
    { field: 'Istrat', headerName: 'Istrat', type: 'number', width: 70 },
    { field: 'confidenceRadius', headerName: 'MAD', type: 'string', width: 70 },
    { field: 'comment', headerName: 'Comment', type: 'string', flex: 1, editable: true }
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
    col.disableColumnMenu = true;
  });

  if (!data || !data.length) return <StatisticsDataTablePMDSkeleton />;

  const rows: Array<DataGridDIRRow> = data.map((statistics, index) => {
    const { id, code, stepRange, stepCount, Dgeo, Igeo, Dstrat, Istrat, confidenceRadius, comment } = statistics;
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
        density={'compact'}
        disableSelectionOnClick={true}
      />
    </StatisticsDataTablePMDSkeleton>
  );
};

export default OutputDataTablePMD;
