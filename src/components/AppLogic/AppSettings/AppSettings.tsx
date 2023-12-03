import React, { FC, useEffect, useState } from "react";
import styles from './AppSettings.module.scss';
import { IconButton, Button, Input } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";
import { useTheme } from '@mui/material/styles';
import {
  textColor
} from '../../../utils/ThemeConstants';
import { useMediaQuery } from "react-responsive";
import ModalWrapper from "../../Common/Modal/ModalWrapper";
import SettingsModal from "../../Common/Modal/SettingsModal/SettingsModal";
import { setHotkeys } from "../../../services/reducers/appSettings";

import { DefaultButton, DefaultResponsiveButton } from "../../Common/Buttons";
import { useTranslation } from "react-i18next";
import { HotkeysType } from "../../../utils/GlobalTypes";
import { useDefaultHotkeys } from "../../../utils/GlobalHooks";
import HelpModal from "../../Common/Modal/HelpModal/HelpModal";

import * as dirPageReducer from '../../../services/reducers/dirPage';
import OutputDataTablePMD from "../DataTablesPMD/OutputDataTable/OutputDataTablePMD";
import OutputDataTableDIR from "../DataTablesDIR/OutputDataTable/OutputDataTableDIR";
import CurrentFileSelector from "./CurrentFileSelector";

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
  const { t, i18n } = useTranslation('translation');
  const dispatch = useAppDispatch();
  const widthLessThan1400 = useMediaQuery({ query: '(max-width: 1400px)' });

  const defaultHotkeys = useDefaultHotkeys();
  const { hotkeys } = useAppSelector(state => state.appSettingsReducer);

  const availableFormats = {
    pca: ['.pmd', '.squid', '.rs3', '.csv', '.xlsx'],
    dir: ['.dir', '.pmm', '.csv', '.xlsx'], 
  };

  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showPMDTotalStatisticsOutput, setShowPMDTotalStatisticsOutput] = useState<boolean>(false);
  const [showDIRTotalStatisticsOutput, setShowDIRTotalStatisticsOutput] = useState<boolean>(false);

  const onSettingsClick = () => {
    setShowSettings(true);
  };

  const onHelpClick = () => {
    setShowHelp(true);
  };

  const onOpenExportModalClick = () => {
    if (currentPage === 'pca') {
      setShowPMDTotalStatisticsOutput(true);
    }

    if (currentPage === 'dir') {
      setShowDIRTotalStatisticsOutput(true);
    }
  }

  const loadHotkeys = () => {
    const hotkeysStored: HotkeysType = JSON.parse(localStorage.getItem('hotkeys')!);
  
    if (!hotkeysStored || !hotkeysStored.length) {
      // Дублирование функционала, актуальная операция в редьюсере
      // localStorage.setItem('hotkeys', JSON.stringify(defaultHotkeys));
      return defaultHotkeys;
    }
  
    return hotkeysStored;
  };

  useEffect(() => {
    if (!hotkeys.length) dispatch(setHotkeys(loadHotkeys()));
  }, []);

  return (
    <>
      <div className={styles.buttons}>
        <DefaultResponsiveButton
          icon={<SettingsOutlinedIcon />}
          text={t('appLayout.settings.settings')}
          onClick={onSettingsClick}
          variant='outlined'
          forceSmall
        />
        <DefaultResponsiveButton
          icon={<HelpOutlineOutlinedIcon />}
          text={t('appLayout.settings.help')}
          onClick={onHelpClick}
          variant='outlined'
          forceSmall
        />
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
            />
          }
          <DefaultResponsiveButton
            icon={<UploadFileOutlinedIcon />}
            text={t('appLayout.settings.import')}
            disabled={currentPage !== 'pca' && currentPage !== 'dir'}
            component="span"
            id="upload-file-button"
          />
        </label>
        <DefaultResponsiveButton
          icon={<FileDownloadOutlinedIcon />}
          text={t('appLayout.settings.export')}
          onClick={onOpenExportModalClick}
        />
        <CurrentFileSelector currentPage={currentPage} /> 
      </div>
      <ModalWrapper
        open={showSettings}
        setOpen={setShowSettings}
        size={{width: '60vw', height: '60vh'}}
      >
        <SettingsModal />
      </ModalWrapper>
      <ModalWrapper
        open={showHelp}
        setOpen={setShowHelp}
        // size={{width: '21vw', height: '12vh'}}
      >
        <HelpModal />
      </ModalWrapper>
      <ModalWrapper
        open={showPMDTotalStatisticsOutput}
        setOpen={setShowPMDTotalStatisticsOutput}
        size={{width: '80vw', height: '60vh'}}
      >
        <OutputDataTablePMD />
      </ModalWrapper>
      <ModalWrapper
        open={showDIRTotalStatisticsOutput}
        setOpen={setShowDIRTotalStatisticsOutput}
        size={{width: '80vw', height: '60vh'}}
      >
        <OutputDataTableDIR />
      </ModalWrapper>
    </>
  )
}

export default AppSettings;
