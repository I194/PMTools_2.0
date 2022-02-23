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

  const { reference, selectedStepsIDs } = useAppSelector(state => state.pcaPageReducer); 

  const [coordinateSystem, setCoordinateSystem] = useState<Reference>('geographic');
  const [stepsInput, setStepsInput] = useState<string>('');
  const [disabledStatistics, setDisabledStatistics] = useState<boolean>(!selectedStepsIDs);

  useEffect(() => {
    console.log(selectedStepsIDs);
    if (selectedStepsIDs) {
      // setStepsInput(selectedStepsIDs.join(','));
    }
    else {
      // setStepsInput('')
    }
    setDisabledStatistics(!selectedStepsIDs);
  }, [selectedStepsIDs]);

  useEffect(() => {
    // selected steps ids update here
    let stepsIDs: Array<number> | null = [];
    if (stepsInput.includes(',')) stepsIDs = stepsInput.split(',').map(id => +id);
    else if (stepsInput.includes('-')) {
      const [startID, endID] = stepsInput.split('-');
      for (let i = +startID; i <= +endID; i++) {
        stepsIDs.push(i);
      };
    }
    else if (stepsInput.length === 1) stepsIDs.push(+stepsInput[0]);
    else stepsIDs = null;
    if (stepsIDs && stepsIDs.includes(NaN)) stepsIDs = null;
    dispatch(setSelectedStepsIDs(stepsIDs));
  }, [stepsInput]);

  const handleReferenceSelect = (option: string) => {
    dispatch(setReference(labelToReference(option)));
  };

  const onStatisticsModeApply = (statisticsMode: 'pca' | 'pca0' | 'gc' | 'gcn') => {
    dispatch(setStatisticsMode(statisticsMode));
    console.log('a')
  }

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
          {icon: <Typography>PCA</Typography>, onClick: () => onStatisticsModeApply('pca'), disabled: disabledStatistics},
          {icon: <Typography>PCA<sub>0</sub></Typography>, onClick: () => onStatisticsModeApply('pca0'), disabled: disabledStatistics},
          {icon: <Typography>GC</Typography>, onClick: () => onStatisticsModeApply('gc'), disabled: disabledStatistics},
          {icon: <Typography>GCn</Typography>, onClick: () => onStatisticsModeApply('gcn'), disabled: disabledStatistics},
        ]}
        inputText={stepsInput}
        setInputText={setStepsInput}
      />
    </ToolsPMDSkeleton>
  )
}

export default ToolsPMD;