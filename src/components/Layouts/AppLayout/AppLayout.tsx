import React, { FC, useCallback } from "react";
import styles from "./AppLayout.module.scss";
import { Outlet, RouteProps, useLocation, } from "react-router-dom";
import { useAppDispatch } from "../../../services/store/hooks";
import { addDirStatFiles, addTreatmentFiles } from "../../../services/reducers/files";
import { AppSettings, AppNavigation } from "../../AppLogic";
import { useDropzone } from "react-dropzone";
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
  bgColorBlocks,
  boxShadowStyle,
  textColor
} from '../../../utils/ThemeConstants';
import GraphSelector from "../../AppLogic/GraphsSelector/GraphsSelector";
import { useMediaQuery } from "react-responsive";

const AppLayout: FC<RouteProps> = () => {

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const widthLessThan1400 = useMediaQuery({ query: '(max-width: 1400px)' });
  const location = useLocation();
  const currentPage = location.pathname.split('/').pop() || location.pathname;

  const handleFileUpload = (event: any, files?: Array<File>) => {;
    const acceptedFiles = files ? files : Array.from(event.currentTarget.files);
    if (currentPage === 'pca') dispatch(addTreatmentFiles(acceptedFiles));
    if (currentPage === 'dir') dispatch(addDirStatFiles(acceptedFiles));
  };

  const onDrop = useCallback(acceptedFiles => {
    handleFileUpload(undefined, acceptedFiles);
  }, [currentPage]);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, noClick: true})
  const rootProps = (currentPage === 'pca' || currentPage === 'dir' ? {...getRootProps()} : undefined);
 
  return (
    <>
      <div {...rootProps}>
        {
          isDragActive && 
          <div className={styles.dropFiles} style={{color: textColor(theme.palette.mode)}}>
            Отпустите файлы для загрузки
          </div>
        }
        <div 
          className={styles.appContainer}
          style={{
            backgroundColor: bgColorMain(theme.palette.mode),
            WebkitFilter: isDragActive ? 'blur(2px)' : 'none', 
          }}
        >
          <div 
            className={styles.top}
            style={{backgroundColor: bgColorMain(theme.palette.mode)}}
          >
            <div 
              className={styles.settings}
              style={{backgroundColor: bgColorMain(theme.palette.mode)}}
            >
              <div 
                className={styles.appSettings} 
                style={{
                  backgroundColor: bgColorBlocks(theme.palette.mode),
                  WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
                  MozBoxShadow: boxShadowStyle(theme.palette.mode),
                  boxShadow: boxShadowStyle(theme.palette.mode),
                }}
              >
                <AppSettings 
                  onFileUpload={handleFileUpload} 
                  dndInputProps={{...getInputProps()}}
                  currentPage={currentPage}
                />
              </div>
            </div>
            <div 
              className={styles.navigation}
              style={{backgroundColor: bgColorMain(theme.palette.mode)}}
            >
              <div 
                className={styles.pages}
                style={{
                  backgroundColor: bgColorBlocks(theme.palette.mode),
                  WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
                  MozBoxShadow: boxShadowStyle(theme.palette.mode),
                  boxShadow: boxShadowStyle(theme.palette.mode),
                }}
              >
                <AppNavigation />
              </div>
            </div>
            {
              widthLessThan1400 && currentPage === 'pca' &&
              <div 
                className={styles.settings}
                style={{backgroundColor: bgColorMain(theme.palette.mode)}}
              >
                <div 
                  className={styles.appSettings} 
                  style={{
                    backgroundColor: bgColorBlocks(theme.palette.mode),
                    WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
                    MozBoxShadow: boxShadowStyle(theme.palette.mode),
                    boxShadow: boxShadowStyle(theme.palette.mode),
                  }}
                >
                  <GraphSelector />
                </div>
              </div>
            }
          </div>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AppLayout;
