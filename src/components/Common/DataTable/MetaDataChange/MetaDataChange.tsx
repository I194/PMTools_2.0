import React, { FC, useState } from 'react';
import styles from './MetaDataChange.module.scss';
import { Button, TextField } from '@mui/material';
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

const formatNumericValue = (value: number): string => {
  return parseFloat(value.toPrecision(12)).toString();
};

type MetadataProperty = 'a' | 'b' | 's' | 'd' | 'v';

const MetaDataChange: FC<IMetaDataChange> = ({ oldMetadata, onApply }) => {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation('translation');
  const { treatmentData } = useAppSelector((state) => state.parsedDataReducer);
  const [inputValues, setInputValues] = useState<Record<MetadataProperty, string>>({
    a: formatNumericValue(oldMetadata.a),
    b: formatNumericValue(oldMetadata.b),
    s: formatNumericValue(oldMetadata.s),
    d: formatNumericValue(oldMetadata.d),
    v: formatNumericValue(oldMetadata.v),
  });

  if (!treatmentData) return null;

  const parseInputValues = (): IPmdData['metadata'] | null => {
    const parsed = { ...oldMetadata };
    for (const key of ['a', 'b', 's', 'd', 'v'] as const) {
      const raw = inputValues[key].replace(',', '.');
      const num = Number(raw);
      if (raw !== '' && isNaN(num)) return null;
      parsed[key] = raw === '' ? 0 : num;
    }
    return parsed;
  };

  const handleApply = () => {
    const newMetadata = parseInputValues();
    if (!newMetadata) return;

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

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    property: MetadataProperty,
  ) => {
    setInputValues((prev) => ({ ...prev, [property]: event.target.value }));
  };

  return (
    <div className={styles.metadataInputs}>
      <TextField
        label="Core Azimuth"
        value={inputValues.a}
        onChange={(event) => handleInputChange(event, 'a')}
        onKeyPress={handleEnterPress}
        variant="standard"
        size="small"
        sx={{ mb: '8px' }}
      />
      <TextField
        label="Core Dip"
        value={inputValues.b}
        onChange={(event) => handleInputChange(event, 'b')}
        onKeyPress={handleEnterPress}
        variant="standard"
        size="small"
        sx={{ mb: '8px' }}
      />
      <TextField
        label="Bedding Strike"
        value={inputValues.s}
        onChange={(event) => handleInputChange(event, 's')}
        onKeyPress={handleEnterPress}
        variant="standard"
        size="small"
        sx={{ mb: '8px' }}
      />
      <TextField
        label="Bedding Dip"
        value={inputValues.d}
        onChange={(event) => handleInputChange(event, 'd')}
        onKeyPress={handleEnterPress}
        variant="standard"
        size="small"
        sx={{ mb: '8px' }}
      />
      <TextField
        label="Volume"
        value={inputValues.v}
        onChange={(event) => handleInputChange(event, 'v')}
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
