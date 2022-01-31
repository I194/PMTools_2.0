import React, { FC, useEffect } from "react";
import styles from './DataTable.module.scss';
import { MenuList, MenuItem, Button, Input } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";
import { setInputFiles } from "../../../services/reducers/files";

interface IDataTable {

}

const DataTable: FC<IDataTable> = () => {

  const files = useAppSelector(state => state.filesReducer.inputFiles);

  useEffect(() => {
    console.log(files);
  }, [files])

  return (
    <div className={styles.dataTable}>

    </div>
  )
}

export default DataTable;
