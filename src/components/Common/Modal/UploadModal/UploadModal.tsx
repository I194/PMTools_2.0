import { Typography, Button, Checkbox, FormControlLabel, TextField } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppDispatch } from '../../../../services/store/hooks';
import { textColor } from '../../../../utils/ThemeConstants';
import { UploadButton } from '../../Buttons';
import styles from './UploadModal.module.scss';
import { useTheme } from '@mui/material/styles';

import examplePCA from '../../../../assets/examples/examplePCA.pmd';
import exampleDIR from '../../../../assets/examples/exampleDIR.pmm';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from 'react-i18next';
import { filesToData } from '../../../../services/axios/filesAndData';
import { generateMergedName } from '../../../../utils/files/mergeUtils';

type Props = {
  page: 'pca' | 'dir';
  open?: boolean;
};

const UploadModal = ({ page, open }: Props) => {
  const theme = useTheme();
  const { t } = useTranslation('translation');
  const dispatch = useAppDispatch();
  const widthLessThan720 = useMediaQuery({ maxWidth: 719 });

  const [mergeEnabled, setMergeEnabled] = useState(false);
  const [mergeName, setMergeName] = useState('');

  useEffect(() => {
    if (open) {
      setMergeEnabled(false);
      setMergeName('');
    }
  }, [open]);

  const handleFileUpload = (event: any, files?: Array<File>) => {
    const acceptedFiles: File[] = files ? files : Array.from(event.currentTarget.files);

    const mergeMode =
      mergeEnabled && page === 'dir'
        ? {
            enabled: true as const,
            name: mergeName || generateMergedName(acceptedFiles.map((f) => f.name)),
          }
        : undefined;

    if (page === 'pca') dispatch(filesToData({ files: acceptedFiles, format: 'pmd' }));
    if (page === 'dir') dispatch(filesToData({ files: acceptedFiles, format: 'dir', mergeMode }));
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      handleFileUpload(undefined, acceptedFiles);
    },
    [page, mergeEnabled, mergeName],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });
  const rootProps = page === 'pca' || page === 'dir' ? { ...getRootProps() } : undefined;

  const useExample = async () => {
    const fileArr = [];
    if (page === 'pca') {
      const rawPCA = await fetch(examplePCA).then((res) => res.text());
      fileArr.push(new File([rawPCA], 'examplePCA.pmd'));
    }
    if (page === 'dir') {
      const rawDIR = await fetch(exampleDIR).then((res) => res.text());
      fileArr.push(new File([rawDIR], 'exampleDIR.pmm'));
    }
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
          label={`${t('importModal.import')} (${availableFormats[page].join(', ')})`}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{
            textTransform: 'none',
          }}
          onClick={useExample}
        >
          {t('importModal.useExample')}
        </Button>
      </div>
      {page === 'dir' && (
        <div className={styles.mergeOptions}>
          <FormControlLabel
            control={
              <Checkbox
                checked={mergeEnabled}
                onChange={(e) => setMergeEnabled(e.target.checked)}
                size="small"
              />
            }
            label={t('importModal.mergeFiles')}
            sx={{ color: textColor(theme.palette.mode) }}
          />
          {mergeEnabled && (
            <TextField
              size="small"
              label={t('importModal.mergedCollectionName')}
              value={mergeName}
              onChange={(e) => setMergeName(e.target.value)}
              placeholder={t('importModal.mergedCollectionPlaceholder')}
              sx={{
                minWidth: 280,
                '& .MuiInputBase-input': { color: textColor(theme.palette.mode) },
                '& .MuiInputLabel-root': { color: textColor(theme.palette.mode) },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: textColor(theme.palette.mode) },
                },
              }}
            />
          )}
        </div>
      )}
      {!widthLessThan720 && (
        <div
          className={styles.dropContainer}
          style={{
            borderColor: theme.palette.mode === 'light' ? '#474c50' : '#fff',
            boxShadow: isDragActive ? `0px 0px 12px 1px ${textColor(theme.palette.mode)}` : 'none',
          }}
        >
          <Typography variant="h4" color={textColor(theme.palette.mode)} textAlign="center">
            {t('importModal.useDnD')}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default UploadModal;
