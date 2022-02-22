import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './ToolsPMD.module.scss';
import DropdownSelect from '../../Sub/DropdownSelect/DropdownSelect';
import InputSelect from '../../Sub/InputSelect/InputSelect';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { Skeleton, Typography } from '@mui/material';
import { Reference } from '../../../utils/graphs/types';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { setReference, setSelectedStepsIDs, setStatisticsMode } from '../../../services/reducers/pcaPage';
import { IPmdData } from '../../../utils/files/fileManipulations';
import ToolsPMDSkeleton from './ToolsPMDSkeleton';

const labelToReference = (label: string) => {
  if (label === 'Образец') return 'specimen';
  if (label === 'Стратиграфическая') return 'stratigraphic';
  return 'geographic';
};

const referenceToLabel = (reference: Reference) => {
  if (reference === 'specimen') return 'Образец';
  if (reference === 'stratigraphic') return 'Стратиграфическая';
  return 'Географическая';
};

interface IToolsPMD {
  data: IPmdData | null;
};

const ToolsPMD: FC<IToolsPMD> = ({ data }) => {

  const dispatch = useAppDispatch();

  const { reference } = useAppSelector(state => state.pcaPageReducer); 

  const [coordinateSystem, setCoordinateSystem] = useState<Reference>('geographic');
  const [stepsInput, setStepsInput] = useState<string>('');

  const handleReferenceSelect = (option: string) => {
    dispatch(setReference(labelToReference(option)));
  };

  const handleStepsSelect = (statisticsMode: 'pca' | 'pca0' | 'gc' | 'gcn') => {
    let stepsIDs = [];
    if (stepsInput.includes(',')) stepsIDs = stepsInput.split(',').map(id => +id);
    else if (stepsInput.includes('-')) {
      const [startID, endID] = stepsInput.split('-');
      for (let i = +startID; i <= +endID; i++) {
        stepsIDs.push(i);
      };
    };
    dispatch(setSelectedStepsIDs(stepsIDs));
    dispatch(setStatisticsMode(statisticsMode));
  };

  useEffect(() => {
    setCoordinateSystem(reference);
  }, [reference]);

  if (!data) return <ToolsPMDSkeleton />;

  return (
    <ToolsPMDSkeleton>
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
          {icon: <Typography>PCA</Typography>, onClick: () => handleStepsSelect('pca')},
          {icon: <Typography>PCA<sub>0</sub></Typography>, onClick: () => handleStepsSelect('pca0')},
          {icon: <Typography>GC</Typography>, onClick: () => handleStepsSelect('gc')},
          {icon: <Typography>GCn</Typography>, onClick: () => handleStepsSelect('gcn')},
        ]}
        inputText={stepsInput}
        setInputText={setStepsInput}
      />
    </ToolsPMDSkeleton>
  )
}

export default ToolsPMD;