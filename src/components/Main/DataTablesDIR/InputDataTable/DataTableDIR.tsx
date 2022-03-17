import React, { FC, useEffect, useState } from "react";
import styles from './DataTableDIR.module.scss';
import { DataGridDIRRow, IDirData } from "../../../../utils/GlobalTypes";
import { DataGrid, GridActionsCellItem, GridColumnHeaderParams, GridColumns, GridSelectionModel, GridValueFormatterParams } from '@mui/x-data-grid';
import DataTablePMDSkeleton from './DataTableDIRSkeleton';
import { useAppDispatch, useAppSelector } from "../../../../services/store/hooks";
import { setSelectedDirectionsIDs, sethiddenDirectionsIDs } from "../../../../services/reducers/dirPage";
import { GetDataTableBaseStyle } from "../styleConstants";
import PMDInputDataTableToolbar from "../../../Sub/DataTable/Toolbar/PMDInputDataTableToolbar";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { StatisticsModeDIR } from "../../../../utils/graphs/types";
import DataTableDIRSkeleton from "./DataTableDIRSkeleton";

interface IDataTableDIR {
  data: IDirData | null;
};

const DataTableDIR: FC<IDataTableDIR> = ({ data }) => {

  const dispatch = useAppDispatch();

  const { selectedDirectionsIDs, hiddenDirectionsIDs } = useAppSelector(state => state.dirPageReducer);

  // selectionModel is array of ID's of rows
  const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);
  const [selectedRows, setSelectedRows] = useState<Array<DataGridDIRRow>>([]);

  useEffect(() => {
    if (selectedDirectionsIDs) setSelectionModel(selectedDirectionsIDs);
    else setSelectionModel([]); 
  }, [selectedDirectionsIDs]);

  const toggleRowVisibility = (id: number) => (event: any) => {
    event.stopPropagation();
    const newhiddenDirectionsIDs = hiddenDirectionsIDs.includes(id) 
      ? hiddenDirectionsIDs.filter(hiddenId => hiddenId !== id) 
      : [...hiddenDirectionsIDs, id];
    dispatch(sethiddenDirectionsIDs(newhiddenDirectionsIDs))
  };

  const toggleAllRowsVisibility = (event: any) => {
    dispatch(sethiddenDirectionsIDs([]));
  };

  const columns: GridColumns = [
    {
      field: 'actions',
      type: 'actions',
      width: 40,
      renderHeader: (params: GridColumnHeaderParams) => (
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="Hide all steps"
          onClick={toggleAllRowsVisibility}
          color="inherit"
        />
      ),
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={hiddenDirectionsIDs.includes(id as number) ? <VisibilityOffIcon /> : <VisibilityIcon />} 
            label="Toggle step visibility"
            onClick={toggleRowVisibility(id as number)}
            color="inherit"
          />,
        ];
      },
    },
    { field: 'id', headerName: 'ID', type: 'string', width: 40 },
    { field: 'index', headerName: '№', type: 'string', width: 40 },
    { field: 'label', headerName: 'Label', type: 'string', width: 80 },
    { field: 'code', headerName: 'Code', type: 'string', width: 80 },
    { field: 'stepRange', headerName: 'StepRange', type: 'string', width: 120 },
    { field: 'stepCount', headerName: 'N', type: 'number', width: 40 },
    { field: 'Dgeo', headerName: 'Dgeo', type: 'number', width: 70,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'Igeo', headerName: 'Igeo', type: 'number', width: 70,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'Dstrat', headerName: 'Dstrat', type: 'number', width: 70,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'Istrat', headerName: 'Istrat', type: 'number', width: 70,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'k', headerName: 'k', type: 'number', width: 40, },
    { field: 'confidenceRadius', headerName: 'MAD', type: 'string', width: 70,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'comment', headerName: 'Comment', type: 'string', width: 200 },
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
  });
  
  if (!data) return <DataTableDIRSkeleton />;
  let visibleIndex = 1;
  const rows: Array<DataGridDIRRow> = data.interpretations.map((interpretation, index) => {
    const { id, label, code, stepRange, stepCount, Dgeo, Igeo, Dstrat, Istrat, k, mad, comment } = interpretation;
    return {
      id,
      index: hiddenDirectionsIDs.includes(id) ? '-' : visibleIndex++,
      label,
      code: code as StatisticsModeDIR, 
      stepRange,
      stepCount,
      Dgeo: +Dgeo.toFixed(1),
      Igeo: +Igeo.toFixed(1),
      Dstrat: +Dstrat.toFixed(1),
      Istrat: +Istrat.toFixed(1),
      k: +k.toFixed(1),
      confidenceRadius: +mad.toFixed(1),
      comment
    };
  });

  return (
    <DataTablePMDSkeleton>
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
          Toolbar: PMDInputDataTableToolbar, 
        }}
        sx={GetDataTableBaseStyle()}
        hideFooter={true}
        getRowClassName={
          (params) =>  hiddenDirectionsIDs.includes(params.row.id) ? styles.hiddenRow : ''
        }
      />
    </DataTablePMDSkeleton>
  )
}

export default DataTableDIR;
