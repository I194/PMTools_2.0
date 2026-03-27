import React, { FC, useState } from 'react';
import styles from './MetaDataChange.module.scss';
import { Button, IconButton, TextField } from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import { IPmdData } from '../../../../utils/GlobalTypes';
import { useAppDispatch, useAppSelector } from '../../../../services/store/hooks';
import equal from 'deep-equal';
import { setTreatmentData } from '../../../../services/reducers/parsedData';
import { useTranslation } from 'react-i18next';
import Coordinates from '../../../../utils/graphs/classes/Coordinates';
import toReferenceCoordinates from '../../../../utils/graphs/formatters/toReferenceCoordinates';

interface IMetaDataChange {
  oldMetadata: IPmdData['metadata'];
  onApply: () => void;
}

const MetaDataChange: FC<IMetaDataChange> = ({ oldMetadata, onApply }) => {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation('translation');
  const { treatmentData } = useAppSelector((state) => state.parsedDataReducer);
  const [newMetadata, setNewMetadata] = useState<IPmdData['metadata']>(oldMetadata);

  if (!treatmentData) return null;

  const handleApply = () => {
    const newTreatmentData = treatmentData.map((pmdData) => {
      if (pmdData.metadata.name === oldMetadata.name) {
        const updatedSteps = pmdData.steps.map((step) => {
          const coords = new Coordinates(step.x, step.y, step.z);
          if (coords.isNull) {
            return { ...step, Dgeo: 0, Igeo: 0, Dstrat: 0, Istrat: 0 };
          }

          const [Dgeo, Igeo] = toReferenceCoordinates('geographic', newMetadata, coords)
            .toDirection()
            .toArray();

          const [Dstrat, Istrat] = toReferenceCoordinates('stratigraphic', newMetadata, coords)
            .toDirection()
            .toArray();

          return {
            ...step,
            Dgeo: +Dgeo.toFixed(1),
            Igeo: +Igeo.toFixed(1),
            Dstrat: +Dstrat.toFixed(1),
            Istrat: +Istrat.toFixed(1),
          };
        });

        return {
          ...pmdData,
          metadata: newMetadata,
          steps: updatedSteps,
        };
      }
      return pmdData;
    });
    if (!equal(newTreatmentData, treatmentData)) dispatch(setTreatmentData(newTreatmentData));
    onApply();
  };

  const handleEnterPress = (event: any) => {
    if (event.key === 'Enter') {
      handleApply();
    }
  };

  const handleMetadataPropertyChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    property: 'a' | 'b' | 's' | 'd' | 'v',
  ) => {
    setNewMetadata({
      ...newMetadata,
      [property]: +event.target.value,
    });
  };

  return (
    <div className={styles.metadataInputs}>
      <TextField
        label="Core Azimuth"
        value={newMetadata.a}
        onChange={(event) => handleMetadataPropertyChange(event, 'a')}
        onKeyPress={handleEnterPress}
        variant="standard"
        size="small"
        sx={{ mb: '8px' }}
      />
      <TextField
        label="Core Dip"
        value={newMetadata.b}
        onChange={(event) => handleMetadataPropertyChange(event, 'b')}
        onKeyPress={handleEnterPress}
        variant="standard"
        size="small"
        sx={{ mb: '8px' }}
      />
      <TextField
        label="Bedding Strike"
        value={newMetadata.s}
        onChange={(event) => handleMetadataPropertyChange(event, 's')}
        onKeyPress={handleEnterPress}
        variant="standard"
        size="small"
        sx={{ mb: '8px' }}
      />
      <TextField
        label="Bedding Dip"
        value={newMetadata.d}
        onChange={(event) => handleMetadataPropertyChange(event, 'd')}
        onKeyPress={handleEnterPress}
        variant="standard"
        size="small"
        sx={{ mb: '8px' }}
      />
      <TextField
        label="Volume"
        value={newMetadata.v}
        onChange={(event) => handleMetadataPropertyChange(event, 'v')}
        onKeyPress={handleEnterPress}
        variant="standard"
        size="small"
        sx={{ mb: '8px' }}
      />
      <Button
        variant="outlined"
        endIcon={<DirectionsIcon />}
        onClick={handleApply}
        sx={{ mt: '16px' }}
      >
        {t('pcaPage.metadataModal.apply')}
      </Button>
    </div>
  );
};

export default MetaDataChange;
