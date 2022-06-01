import { Typography, Button } from "@mui/material";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { addDirStatFiles, addTreatmentFiles } from "../../../../services/reducers/files";
import { useAppDispatch } from "../../../../services/store/hooks";
import { textColor } from "../../../../utils/ThemeConstants";
import { UploadButton } from "../../Buttons";
import styles from "./UploadModal.module.scss";
import { useTheme } from "@mui/material/styles";

import examplePCA from './examples/examplePCA.pmd';
import exampleDIR from './examples/exampleDIR.pmm';

type Props = {
  page: 'pca' | 'dir';
}

const UploadModal = ({page}: Props) => {

  const theme = useTheme();
  const dispatch = useAppDispatch();

  const handleFileUpload = (event: any, files?: Array<File>) => {;
    const acceptedFiles = files ? files : Array.from(event.currentTarget.files);
    if (page === 'pca') dispatch(addTreatmentFiles(acceptedFiles));
    if (page === 'dir') dispatch(addDirStatFiles(acceptedFiles));
  };

  const onDrop = useCallback(acceptedFiles => {
    handleFileUpload(undefined, acceptedFiles);
  }, [page]);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, noClick: true})
  const rootProps = (page === 'pca' || page === 'dir' ? {...getRootProps()} : undefined);

  const useExample = async () => {
    const fileArr = [];
    if (page === 'pca') {
      const rawPCA = await fetch(examplePCA).then(res => res.text());
      fileArr.push(new File([rawPCA], 'examplePCA.pmd'));
    };
    if (page === 'dir') {
      const rawDIR = await fetch(exampleDIR).then(res => res.text());
      fileArr.push(new File([rawDIR], 'exampleDIR.pmm'));
    };
    handleFileUpload(undefined, fileArr);
  };

  const availableFormats = {
    pca: ['.pmd', '.squid', '.rs3', '.csv', '.xlsx'],
    dir: ['.dir', '.pmm', '.csv', '.xlsx'], 
  };

  // накладывается на глобальный импорт через dnd в appLayout...
  return (
    <div className={styles.container}>
      <div className={styles.upload}>
        <UploadButton 
          accept={availableFormats[page]}
          onUpload={handleFileUpload}
          label={`Загрузите файлы (${availableFormats[page].join(', ')})`}
        />
        <Button 
          variant='contained'
          color='primary'
          sx={{
            textTransform: 'none',
            ml: '24px',
          }}
          onClick={useExample}
        >
          Или воспользуйтесь примером
        </Button>
      </div>
      <div 
        className={styles.dropContainer}
        style={{
          borderColor: theme.palette.mode === 'light' ? '#474c50' : '#fff',
          boxShadow: isDragActive ? `0px 0px 12px 1px ${textColor(theme.palette.mode)}` : 'none',
        }}
      >
        <Typography variant="h4" color={textColor(theme.palette.mode)}>
          Или перетащите файлы поверх приложения
        </Typography>
      </div>
    </div>
  )
};

export default UploadModal;
