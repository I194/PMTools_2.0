import React, { FC, useCallback, useEffect, useState } from "react";
import styles from './OutputDataTablePMD.module.scss';
import equal from "deep-equal"
import { DataGrid, GridColDef, GridEditRowsModel, gridFilteredSortedRowIdsSelector, gridVisibleColumnFieldsSelector, useGridApiContext } from '@mui/x-data-grid';
import StatisticsDataTablePMDSkeleton from './OutputDataTablePMDSkeleton';
import { GetDataTableBaseStyle } from "../styleConstants";
import { DataGridDIRRow, StatisitcsInterpretation } from "../../../../utils/GlobalTypes";
import PMDOutputDataTableToolbar from '../../../Sub/DataTable/Toolbar/PMDOutputDataTableToolbar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useAppDispatch, useAppSelector } from "../../../../services/store/hooks";
import { setAllInterpretations, setOutputFilename } from "../../../../services/reducers/pcaPage";
import { useDebounce } from "../../../../utils/GlobalHooks";

const OutputDataTablePMD: FC = () => {
  
  const dispatch = useAppDispatch();

  const data = useAppSelector(state => state.pcaPageReducer.allInterpretations);
  const [editRowsModel, setEditRowsModel] = useState<GridEditRowsModel>({});
  const [filename, setFilename] = useState<string>('PCA Interpretations');
  const debouncedFilename = useDebounce(filename, 500);

  const handleEditRowsModelChange = useCallback((model: GridEditRowsModel) => {
    setEditRowsModel(model);
  }, []);

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
        return {
          ...interpretation,
          comment: newComment
        };
      });
      if (!equal(updatedData, data)) dispatch(setAllInterpretations(updatedData));
    };
  }, [data, editRowsModel]);

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
        <IconButton 
          color="error" 
          sx={{
            position: 'absolute',
            right: '8px'
          }}
        >
          <CloseOutlinedIcon />
        </IconButton>
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
            Toolbar: PMDOutputDataTableToolbar,
          }}
          disableSelectionOnClick={true}
        />
      </StatisticsDataTablePMDSkeleton>
    </>
    
  );
};

export default OutputDataTablePMD;
