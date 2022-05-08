import React, { FC, useCallback, useEffect, useState } from "react";
import styles from './AppSettings.module.scss';
import { MenuList, MenuItem, Button, Input } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";
import { setDirStatFiles, setInputFiles, setTreatmentFiles } from "../../../services/reducers/files";
import { useLocation } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import {
  textColor
} from '../../../utils/ThemeConstants';

import {useDropzone} from 'react-dropzone'
import { useMediaQuery } from "react-responsive";
import ModalWrapper from "../../Sub/Modal/ModalWrapper";
import SettingsModal from "../../Sub/Modal/SettingsModal/SettingsModal";
import { deactivateHotkeys, setHotkeys } from "../../../services/reducers/appSettings";
import loadHotkeys, { defaultHotkeys } from "./hotkeys";

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
  const dispatch = useAppDispatch();
  const isSmallScreen = useMediaQuery({ query: '(max-width: 1464px)' });

  const { hotkeys } = useAppSelector(state => state.appSettingsReducer);

  const availableFormats = {
    pca: ['.pmd', '.csv', '.xlsx'],
    dir: ['.dir', '.pmm', '.csv', 'xlsx'], 
  };

  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const onSettingsClick = () => {
    setShowSettings(true);
  };

  const onHelpClick = () => {
    setShowHelp(true);
  };

  useEffect(() => {
    if (!hotkeys.length) dispatch(setHotkeys(loadHotkeys()));
  }, []);

  return (
    <>
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
          onClick={onSettingsClick}
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
          onClick={onHelpClick}
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
      <ModalWrapper
        open={showSettings}
        setOpen={setShowSettings}
        size={{width: '60vw', height: '60vh'}}
      >
        <SettingsModal />
      </ModalWrapper>
    </>
  )
}

export default AppSettings;
