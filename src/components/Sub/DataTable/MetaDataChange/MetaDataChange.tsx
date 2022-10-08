import React, { FC, useState } from 'react';
import styles from './MetaDataChange.module.scss';
import { Button, IconButton, TextField } from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import { IPmdData } from '../../../../utils/GlobalTypes';
import { useAppDispatch, useAppSelector } from '../../../../services/store/hooks';
import equal from "deep-equal"
import { setTreatmentData } from '../../../../services/reducers/parsedData';
import { useTranslation } from 'react-i18next';

interface IMetaDataChange {
  oldMetadata: IPmdData['metadata'];
  onApply: () => void;
};

const MetaDataChange: FC<IMetaDataChange> = ({ oldMetadata, onApply }) => {

  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation('translation');
  const { treatmentData } = useAppSelector(state => state.parsedDataReducer);
  const [newMetadata, setNewMetadata] = useState<IPmdData['metadata']>(oldMetadata);

  if (!treatmentData) return null;

  const handleApply = () => {
    const newTreatmentData = treatmentData.map(pmdData => {
      if (equal(pmdData.metadata, oldMetadata)) {
        return {
          ...pmdData,
          metadata: newMetadata
        };
      };
      return pmdData;
    });
    if (!equal(newTreatmentData, treatmentData)) dispatch(setTreatmentData(newTreatmentData));
    onApply();
  };

  const handleEnterPress = (event: any) => {
    if (event.key === 'Enter') {
      handleApply();
    };
  };

  const handleMetadataPropertyChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, 
    property: 'a' | 'b' | 's' | 'd' | 'v'
  ) => {
    setNewMetadata({
      ...newMetadata,
      [property]: +event.target.value
    });
  };

  return (
    <div className={styles.metadataInputs}>
      <TextField
        label='Core Azimuth'
        value={newMetadata.a}
        onChange={(event) => handleMetadataPropertyChange(event, 'a')}
        onKeyPress={handleEnterPress}
        variant="standard"
        size='small'
        sx={{mb: '8px'}}
      />
      <TextField
        label='Core Dip'
        value={newMetadata.b}
        onChange={(event) => handleMetadataPropertyChange(event, 'b')}
        onKeyPress={handleEnterPress}
        variant="standard"
        size='small'
        sx={{mb: '8px'}}
      />
      <TextField
        label='Bedding Strike'
        value={newMetadata.s}
        onChange={(event) => handleMetadataPropertyChange(event, 's')}
        onKeyPress={handleEnterPress}
        variant="standard"
        size='small'
        sx={{mb: '8px'}}
      />
      <TextField
        label='Bedding Dip'
        value={newMetadata.d}
        onChange={(event) => handleMetadataPropertyChange(event, 'd')}
        onKeyPress={handleEnterPress}
        variant="standard"
        size='small'
        sx={{mb: '8px'}}
      />
      <TextField
        label='Volume'
        value={newMetadata.v}
        onChange={(event) => handleMetadataPropertyChange(event, 'v')}
        onKeyPress={handleEnterPress}
        variant="standard"
        size='small'
        sx={{mb: '8px'}}
      />
      <Button
        variant="outlined" 
        endIcon={<DirectionsIcon />}
        onClick={handleApply}
        sx={{mt: '16px'}}
      >
        {t('pcaPage.metadataModal.apply')}
      </Button>
    </div>
  )
};

export default MetaDataChange;
