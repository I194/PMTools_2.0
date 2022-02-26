import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import styles from './ToolsPMD.module.scss';
import DropdownSelect from '../../Sub/DropdownSelect/DropdownSelect';
import ButtonGroupWithLabel from '../../Sub/ButtonGroupWithLabel/ButtonGroupWithLabel';
import { Button, ButtonGroup, FormControl, InputLabel } from '@mui/material';
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

  // useEffect(() => {
  //   // selected steps ids update here
  //   let stepsIDs: Array<number> | null = [];
  //   if (stepsInput.includes(',')) stepsIDs = stepsInput.split(',').map(id => +id);
  //   else if (stepsInput.includes('-')) {
  //     const [startID, endID] = stepsInput.split('-');
  //     for (let i = +startID; i <= +endID; i++) {
  //       stepsIDs.push(i);
  //     };
  //   }
  //   else if (stepsInput.length === 1) stepsIDs.push(+stepsInput[0]);
  //   else stepsIDs = null;
  //   if (stepsIDs && stepsIDs.includes(NaN)) stepsIDs = null;
  //   dispatch(setSelectedStepsIDs(stepsIDs));
  // }, [stepsInput]);

  useEffect(() => {
    window.addEventListener("keydown", handleStatisticsModeSelect);
    return () => {
      window.removeEventListener("keydown", handleStatisticsModeSelect);
    };
  }, []);
  
  useEffect(() => {
    setCoordinateSystem(reference);
  }, [reference]);

  const handleReferenceSelect = (option: string) => {
    dispatch(setReference(labelToReference(option)));
  };

  const onStatisticsModeApply = (statisticsMode: 'pca' | 'pca0' | 'gc' | 'gcn') => {
    alert(`--->>> ${statisticsMode}`);
    dispatch(setStatisticsMode(statisticsMode));
  };

  const handleStatisticsModeSelect = useCallback((e) => {
    const key = (e.key as string).toLowerCase();
    if (key === 'd') onStatisticsModeApply('pca');
    if (key === 'o') onStatisticsModeApply('pca0');
    if (key === 'g') onStatisticsModeApply('gc');
    if (key === 'i') onStatisticsModeApply('gcn');
  }, []);

  if (!data) return <ToolsPMDSkeleton />;

  return (
    <ToolsPMDSkeleton>
      <DropdownSelect 
        label={'Система координат'}
        options={['Образец', 'Географическая', 'Стратиграфическая']}
        defaultValue='Географическая'
        onOptionSelect={handleReferenceSelect}
      />
      <ButtonGroupWithLabel label='Статистический метод'>
        <Button onClick={() => onStatisticsModeApply('pca')}>PCA</Button>
        <Button onClick={() => onStatisticsModeApply('pca0')}>PCA₀</Button>
        <Button onClick={() => onStatisticsModeApply('gc')}>GC</Button>
        <Button onClick={() => onStatisticsModeApply('gcn')}>GCN</Button>
      </ButtonGroupWithLabel>
    </ToolsPMDSkeleton>
  )
}

export default ToolsPMD;