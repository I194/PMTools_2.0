import React, { FC, useCallback } from "react";
import styles from './AppSettings.module.scss';
import { MenuList, MenuItem, Button, Input } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { useAppDispatch } from "../../../services/store/hooks";
import { setDirStatFiles, setInputFiles, setTreatmentFiles } from "../../../services/reducers/files";
import { useLocation } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import {
  textColor
} from '../../../utils/ThemeConstants';

import {useDropzone} from 'react-dropzone'
import { useMediaQuery } from "react-responsive";

interface IAppSettings {
  onFileUpload: (event: any, files?: Array<File>) => void;
  dndInputProps: any;
  currentPage: string;
};

const AppSettings: FC<IAppSettings> = ({
  onFileUpload,
  dndInputProps,
  currentPage,
}) => {
  const theme = useTheme();

  const isSmallScreen = useMediaQuery({ query: '(max-width: 1464px)' })

  const availableFormats = {
    pca: ['.pmd', '.csv', '.xlsx'],
    dir: ['.dir', '.pmm', '.csv', 'xlsx'], 
  };

  return (
    <div className={styles.buttons}>
      <Button
        variant="contained" 
        startIcon={<SettingsOutlinedIcon />}
        sx={{
          textTransform: 'none', 
          marginRight: '16px',
          '.MuiButton-startIcon': isSmallScreen ? {
            margin: 0,
          } : {},
        }}
        component="span"
      >
      { isSmallScreen ? '' : 'Настройки'}
      </Button>
      <Button
        variant="contained" 
        startIcon={<HelpOutlineOutlinedIcon />}
        sx={{
          textTransform: 'none', 
          marginRight: '16px',
          '.MuiButton-startIcon': isSmallScreen ? {
            margin: 0,
          } : {},
        }}
        component="span"
      >
        { isSmallScreen ? '' : 'Помощь'}
      </Button>
      <label 
        htmlFor="upload-file" 
        style={{
          flex: 'auto'
        }}
      >
        {
          (currentPage === 'pca' || currentPage === 'dir') &&
          <Input 
            id="upload-file"
            type={'file'}  
            inputProps={{
              ...dndInputProps,
              multiple: true,
              accept: availableFormats[currentPage].join(', '),
            }}
            disableUnderline={true}
            sx={{display: 'none'}}
            // onChange={onFileUpload}
          />
        }
        <Button 
          variant="outlined" 
          startIcon={<UploadFileOutlinedIcon />}
          disabled={currentPage !== 'pca' && currentPage !== 'dir'}
          sx={{
            textTransform: 'none', 
            width: '100%',
            color: textColor(theme.palette.mode),
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
