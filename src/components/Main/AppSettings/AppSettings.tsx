import React, { FC } from "react";
import styles from './AppSettings.module.scss';
import { MenuList, MenuItem, Button, Input } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { useAppDispatch } from "../../../services/store/hooks";
import { setDirStatFiles, setInputFiles, setTreatmentFiles } from "../../../services/reducers/files";
import { useLocation } from "react-router-dom";

interface IAppSettings {

}

const AppSettings: FC<IAppSettings> = () => {

  const dispatch = useAppDispatch();
  const location = useLocation();

  const currentPage = location.pathname.slice(1, location.pathname.length);
  const availableFormats = {
    pca: ['.pmd', '.csv', '.xlsx'],
    dir: ['.dir', '.pmm', '.csv', 'xlsx'], 
  };

  const handleFileUpload = (event: any) => {
    const files = Array.from(event.currentTarget.files);
    if (currentPage === 'pca') dispatch(setTreatmentFiles(files));
    if (currentPage === 'dir') dispatch(setDirStatFiles(files));
    dispatch(setInputFiles(files));
  };

  if (currentPage !== 'pca' && currentPage !== 'dir') return null; 

  return (
    <div className={styles.buttons}>
      <Button
        variant="contained" 
        startIcon={<SettingsOutlinedIcon />}
        sx={{
          textTransform: 'none', 
          marginRight: '16px'
        }}
        component="span"
      >
        Настройки
      </Button>
      <Button
        variant="contained" 
        startIcon={<HelpOutlineOutlinedIcon />}
        sx={{
          textTransform: 'none', 
          marginRight: '16px'
        }}
        component="span"
      >
        Помощь
      </Button>
      <label 
        htmlFor="upload-file" 
        style={{
          flex: 'auto'
        }}
      >
        <Input 
          id="upload-file"
          type={'file'}  
          inputProps={{
            multiple: true,
            accept: availableFormats[currentPage].join(', '),
          }}
          disableUnderline={true}
          sx={{display: 'none'}}
          onChange={handleFileUpload}
        />

        <Button 
          variant="outlined" 
          startIcon={<UploadFileOutlinedIcon />}
          sx={{
            textTransform: 'none', 
            width: '100%',
            color: 'white',
          }}
          component="span"
        >
          Загрузить файл
        </Button>
      </label>
    </div>
  )
}

export default AppSettings;
