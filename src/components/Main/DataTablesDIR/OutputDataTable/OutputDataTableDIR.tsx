import React, { FC, useCallback, useEffect, useState } from "react";
import styles from './OutputDataTableDIR.module.scss';
import { useAppDispatch, useAppSelector } from "../../../../services/store/hooks";
import { useDebounce } from "../../../../utils/GlobalHooks";
import equal from "deep-equal"
import { GetDataTableBaseStyle } from "../styleConstants";
import StatisticsDataTablePMDSkeleton from './OutputDataTableDIRSkeleton';
import PMDOutputDataTableToolbar from '../../../Sub/DataTable/Toolbar/PMDOutputDataTableToolbar';
import { DataGridDIRRow } from "../../../../utils/GlobalTypes";
import { deleteAllInterpretations, deleteInterpretation, setAllInterpretations, setOutputFilename, updateCurrentFileInterpretations, updateCurrentInterpretation } from "../../../../services/reducers/dirPage";
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { 
  DataGrid, 
  GridActionsCellItem, 
  GridColumnHeaderParams, 
  GridColumns, 
  GridEditRowsModel,
  GridValueFormatterParams, 
} from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import DIROutputDataTableToolbar from "../../../Sub/DataTable/Toolbar/DIROutputDataTableToolbar";

const OutputDataTableDIR: FC = () => {
  
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const data = useAppSelector(state => state.dirPageReducer.allInterpretations);
  const { dirStatData, currentDataDIRid } = useAppSelector(state => state.parsedDataReducer);
  const [editRowsModel, setEditRowsModel] = useState<GridEditRowsModel>({});
  const [filename, setFilename] = useState<string>('DIR Interpretations');
  const debouncedFilename = useDebounce(filename, 500);

  const handleEditRowsModelChange = useCallback((model: GridEditRowsModel) => {
    setEditRowsModel(model);
  }, []);
  
  const handleRowDelete = (label: string) => (event: any) => {
    event.stopPropagation();
    dispatch(deleteInterpretation(label));
    
    // это всё надо упростить и перенести в мидлвару
    // и ещё заполнять поле currentFile при обновлении currentDataDIR/PMDid (тоже в мидлваре)
    const currentFileName = dirStatData![currentDataDIRid || 0]?.name;
    const deletedRowParentFile = data.filter(
      interpretation => interpretation.label === label
    )[0].parentFile;

    if (deletedRowParentFile === currentFileName) {
      dispatch(updateCurrentFileInterpretations(deletedRowParentFile));
      dispatch(updateCurrentInterpretation());
    };
  };

  const handleDeleteAllRows = (event: any) => {
    event.stopPropagation();
    dispatch(deleteAllInterpretations());
  };

  const columns: GridColumns = [
    { field: 'id', headerName: 'Label', type: 'string', width: 120 },
    { field: 'code', headerName: 'Code', type: 'string', width: 70 },
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
    { field: 'confidenceRadius', headerName: 'MAD', type: 'string', width: 70,
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'comment', headerName: 'Comment', type: 'string', flex: 1, editable: true, cellClassName: styles[`editableCell_${theme.palette.mode}`] },
    {
      field: 'actions',
      type: 'actions',
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

  useEffect(() => {
    if (debouncedFilename) {
      dispatch(setOutputFilename(debouncedFilename as string));
    } else {
      dispatch(setOutputFilename(filename));
    };
  }, [debouncedFilename]);

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
      if (!equal(updatedData, data)) dispatch(setAllInterpretations(updatedData));
    };
  }, [data, editRowsModel]);

  if (!data || !data.length) return <StatisticsDataTablePMDSkeleton />;

  const rows: Array<Omit<DataGridDIRRow, 'id' | 'label'>> = data.map((statistics, index) => {
    const { label, code, stepRange, stepCount, Dgeo, Igeo, Dstrat, Istrat, confidenceRadius, comment } = statistics;
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
      comment
    };
  });

  const handleFilenameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilename(event.target.value);
  };  

  return (
    <>
      <div className={styles.toolbar}>
        <TextField
          id="allInterpretationsPCA_filename"
          label="Имя файла"
          value={filename}
          onChange={handleFilenameChange}
          variant="standard"
        />
      </div>
      <StatisticsDataTablePMDSkeleton>
        <DataGrid 
          rows={rows} 
          columns={columns} 
          editRowsModel={editRowsModel}
          onEditRowsModelChange={handleEditRowsModelChange}
          sx={GetDataTableBaseStyle()}
          hideFooter={true}
          density={'compact'}
          components={{
            Toolbar: DIROutputDataTableToolbar,
          }}
          disableSelectionOnClick={true}
        />
      </StatisticsDataTablePMDSkeleton>
    </>
    
  );
};

export default OutputDataTableDIR;
