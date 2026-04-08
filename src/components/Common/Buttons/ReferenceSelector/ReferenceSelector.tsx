import React, { FC } from 'react';
import { Button } from '@mui/material';
import ButtonGroupWithLabel from '../ButtonGroupWithLabel/ButtonGroupWithLabel';
import { useAppDispatch, useAppSelector } from '../../../../services/store/hooks';
import { setReference } from '../../../../services/reducers/dirPage';
import { referenceToLabel } from '../../../../utils/parsers/labelToReference';
import { Reference } from '../../../../utils/graphs/types';
import { useTranslation } from 'react-i18next';

interface ReferenceSelectorProps {
  availableReferences?: Reference[];
  onChange?: (ref: Reference) => void;
}

const ReferenceSelector: FC<ReferenceSelectorProps> = ({
  availableReferences = ['geographic', 'stratigraphic'],
  onChange,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('translation');
  const { reference } = useAppSelector((state) => state.dirPageReducer);

  const handleSelect = (selectedReference: Reference) => {
    dispatch(setReference(selectedReference));
    if (onChange) {
      onChange(selectedReference);
    }
  };

  return (
    <ButtonGroupWithLabel label={t('dirPage.tools.coordinateSystem.title')}>
      {availableReferences.map((availRef) => (
        <Button
          key={availRef}
          color={reference === availRef ? 'secondary' : 'primary'}
          onClick={() => handleSelect(availRef)}
          sx={{
            width: '80px',
            borderRadius: '16px',
            fontWeight: reference === availRef ? 600 : 400,
          }}
        >
          {referenceToLabel(availRef)}
        </Button>
      ))}
    </ButtonGroupWithLabel>
  );
};

export default ReferenceSelector;
