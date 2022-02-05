import React, { FC, useEffect } from "react";
import styles from './DataTable.module.scss';
import { MenuList, MenuItem, Button, Input } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";
import { setInputFiles } from "../../../services/reducers/files";
import { getDirectionalData } from "../../../utils/files/fileManipulations";

interface IDataTable {

}

const DataTable: FC<IDataTable> = () => {

  const files = useAppSelector(state => state.filesReducer.inputFiles);

  useEffect(() => {
    if (files) {
      // const parsedData = files.map((file) => {
      //   return await getDirectionalData(file, 'pmd') as IPmdData;
      // });
    }
  }, [files])

  if (!files) return null;

  return (
    <div className={styles.dataTable}>
      {
        files.map((file, index) => {
          return (
            <p>
              { `${index}: ${file.name}` }
            </p>
          )
        })
        
      }
    </div>
  )
}

export default DataTable;
