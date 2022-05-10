import React, { FC, useEffect, useState } from "react";
import styles from './DataTablePMD.module.scss';
import { IPmdData } from "../../../../utils/GlobalTypes";
import { DataGrid, GridActionsCellItem, GridColDef, GridColumnHeaderParams, GridColumns, GridSelectionModel, GridValueFormatterParams } from '@mui/x-data-grid';
import DataTablePMDSkeleton from './DataTablePMDSkeleton';
import { DataGridPMDRow } from "../../../../utils/GlobalTypes";
import { useAppDispatch, useAppSelector } from "../../../../services/store/hooks";
import { setSelectedStepsIDs, setHiddenStepsIDs } from "../../../../services/reducers/pcaPage";
import { GetDataTableBaseStyle } from "../styleConstants";
import PMDInputDataTableToolbar from "../../../Sub/DataTable/Toolbar/PMDInputDataTableToolbar";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface IDataTablePMD {
  data: IPmdData | null;
};

const DataTablePMD: FC<IDataTablePMD> = ({ data }) => {

  const dispatch = useAppDispatch();

  const { selectedStepsIDs, hiddenStepsIDs } = useAppSelector(state => state.pcaPageReducer);
  // selectionModel is array of ID's of rows
  const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);
  const [selectedRows, setSelectedRows] = useState<Array<DataGridPMDRow>>([]);

  useEffect(() => {
    if (selectedStepsIDs) setSelectionModel(selectedStepsIDs);
    else setSelectionModel([]); 
  }, [selectedStepsIDs]);

  const toggleRowVisibility = (id: number) => (event: any) => {
    event.stopPropagation();
    const newHiddenStepsIDs = hiddenStepsIDs.includes(id) 
      ? hiddenStepsIDs.filter(hiddenId => hiddenId !== id) 
      : [...hiddenStepsIDs, id];
    dispatch(setHiddenStepsIDs(newHiddenStepsIDs))
  };

  const toggleAllRowsVisibility = (event: any) => {
    dispatch(setHiddenStepsIDs([]));
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
            icon={hiddenStepsIDs.includes(id as number) ? <VisibilityOffIcon /> : <VisibilityIcon />} 
            label="Toggle step visibility"
            onClick={toggleRowVisibility(id as number)}
            color="inherit"
          />,
        ];
      },
    },
    { field: 'id', headerName: 'ID', type: 'number', width: 40 },
    { field: 'index', headerName: '№', type: 'string', width: 40 },
    { field: 'step', headerName: 'Step', type: 'string', width: 70 },
    { field: 'Dgeo', headerName: 'Dgeo', type: 'string', width: 70 },
    { field: 'Igeo', headerName: 'Igeo', type: 'number', width: 70 },
    { field: 'Dstrat', headerName: 'Dstrat', type: 'number', width: 70 },
    { field: 'Istrat', headerName: 'Istrat', type: 'number', width: 70 },
    { field: 'mag', headerName: 'MAG', type: 'string', width: 90},
    { field: 'a95', headerName: 'a95', type: 'number', width: 50 },
    { field: 'comment', headerName: 'Comment', type: 'string', width: 200 }
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
  });
  
  if (!data) return <DataTablePMDSkeleton />;
  let visibleIndex = 1;
  const rows: Array<DataGridPMDRow> = data.steps.map((stepData, index) => {
    const { id, step, Dgeo, Igeo, Dstrat, Istrat, mag, a95, comment } = stepData;
    return {
      id,
      index: hiddenStepsIDs.includes(id) ? '-' : visibleIndex++,
      step,
      Dgeo: Dgeo.toFixed(1),
      Igeo: Igeo.toFixed(1),
      Dstrat: Dstrat.toFixed(1),
      Istrat: Istrat.toFixed(1),
      mag: mag.toExponential(2).toUpperCase(),
      a95: a95.toFixed(1),
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
          if ([...selectedIDs].length > 0) dispatch(setSelectedStepsIDs([...selectedIDs]));
          else dispatch(setSelectedStepsIDs(null));
          const selectedRows = rows.filter((r) => selectedIDs.has(r.id));
          setSelectedRows(selectedRows);
        }}
        components={{
          Toolbar: PMDInputDataTableToolbar, 
        }}
        sx={GetDataTableBaseStyle()}
        hideFooter={rows.length < 100}
        getRowClassName={
          (params) =>  hiddenStepsIDs.includes(params.row.id) ? styles.hiddenRow : ''
        }
      />
    </DataTablePMDSkeleton>
  )
}

export default DataTablePMD;
