import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './ToolsPMD.module.scss';
import DropdownSelect from '../../Sub/DropdownSelect/DropdownSelect';
import InputSelect from '../../Sub/InputSelect/InputSelect';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { Typography } from '@mui/material';
import { Reference } from '../../../utils/graphs/types';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { setReference } from '../../../services/reducers/pcaPage';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
  bgColorBlocks,
  boxShadowStyle
} from '../../../utils/ThemeConstants';

const labelToReference = (label: string) => {
  if (label === 'Образец') return 'specimen';
  if (label === 'Стратиграфическая') return 'stratigraphic';
  return 'geographic';
};

const referenceToLabel = (reference: Reference) => {
  if (reference === 'specimen') return 'Образец';
  if (reference === 'stratigraphic') return 'Стратиграфическая';
  return 'Географическая';
}

const ToolsPMD: FC = ({}) => {

  const dispatch = useAppDispatch();

  const theme = useTheme();

  const { reference } = useAppSelector(state => state.pcaPageReducer); 

  const [coordinateSystem, setCoordinateSystem] = useState<Reference>('geographic');
  const [stepsFilter, setStepsFilter] = useState(null);

  const handleReferenceSelect = (option: string) => {
    dispatch(setReference(labelToReference(option)));
  };

  useEffect(() => {
    setCoordinateSystem(reference);
  }, [reference]);

  return (
    <div 
      className={styles.instruments}
      style={{backgroundColor: bgColorMain(theme.palette.mode)}}
    >
      <div 
        className={styles.dataSettings}
        style={{
          backgroundColor: bgColorBlocks(theme.palette.mode),
          WebkitBoxShadow: boxShadowStyle(theme.palette.mode),
          MozBoxShadow: boxShadowStyle(theme.palette.mode),
          boxShadow: boxShadowStyle(theme.palette.mode),
        }}
      >
        <DropdownSelect 
          label={'Система координат'}
          options={['Образец', 'Географическая', 'Стратиграфическая']}
          defaultValue='Географическая'
          onOptionSelect={handleReferenceSelect}
        />
        <InputSelect 
          placeholder={'Введите шаги'}
          leftIconButton={{icon: <FilterAltOutlinedIcon />, onClick: () => null}}
          rightIconButtons={[
            {icon: <Typography>PCA</Typography>, onClick: () => null},
            {icon: <Typography>PCA<sub>0</sub></Typography>, onClick: () => null},
            {icon: <Typography>GC</Typography>, onClick: () => null},
            {icon: <Typography>GCn</Typography>, onClick: () => null},
          ]}
        />
      </div>
    </div>
  )
}

export default ToolsPMD;