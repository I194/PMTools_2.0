import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import styles from './ToolsPMD.module.scss';
import DropdownSelect from '../../Sub/DropdownSelect/DropdownSelect';
import ButtonGroupWithLabel from '../../Sub/ButtonGroupWithLabel/ButtonGroupWithLabel';
import { Button, TextField } from '@mui/material';
import { Reference } from '../../../utils/graphs/types';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { setReference, setSelectedStepsIDs, setStatisticsMode, updateCurrentFileInterpretations, updateCurrentInterpretation } from '../../../services/reducers/pcaPage';
import { IPmdData } from '../../../utils/GlobalTypes';
import ModalWrapper from '../../Sub/Modal/ModalWrapper';
import ToolsPMDSkeleton from './ToolsPMDSkeleton';
import OutputDataTablePMD from '../DataTablesPMD/OutputDataTable/OutputDataTablePMD';
import StatModeButton from './StatModeButton';
import { setCurrentPMDid } from '../../../services/reducers/parsedData';

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

  const { treatmentData } = useAppSelector(state => state.parsedDataReducer);
  const { reference, selectedStepsIDs, statisticsMode } = useAppSelector(state => state.pcaPageReducer); 

  const [allDataPMD, setAllDataPMD] = useState<Array<IPmdData>>([]);
  const [coordinateSystem, setCoordinateSystem] = useState<Reference>('geographic');
  const [allFilesStatOpen, setAllFilesStatOpen] = useState<boolean>(false);
  const [showStepsInput, setShowStepsInput] = useState<boolean>(false);
  const [enteredSteps, setEnteredSteps] = useState<Array<number> | null>(null);

  useEffect(() => {
    if (treatmentData) {
      setAllDataPMD(treatmentData);
    };
  }, [treatmentData]);

  useEffect(() => {
    if (!selectedStepsIDs && statisticsMode) {
      setShowStepsInput(true);
    } else {
      setShowStepsInput(false);
    }
  }, [selectedStepsIDs, statisticsMode]);

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

  const handleStatisticsModeSelect = useCallback((e) => {
    const key = (e.key as string).toLowerCase();
    const { ctrlKey, shiftKey, altKey } = e; 
    if ((shiftKey || altKey) && key === 'd') dispatch(setStatisticsMode('pca'));
    if ((shiftKey || altKey) && key === 'o') dispatch(setStatisticsMode('pca0'));
    if ((shiftKey || altKey) && key === 'g') dispatch(setStatisticsMode('gc'));
    if ((shiftKey || altKey) && key === 'i') dispatch(setStatisticsMode('gcn'));
  }, []);

  if (!data) return <ToolsPMDSkeleton />;

  const handleFileSelect = (option: string) => {
    const pmdID = allDataPMD.findIndex(pmd => pmd.metadata.name === option);
    dispatch(setCurrentPMDid(pmdID));
    // cleaners
    dispatch(updateCurrentFileInterpretations(option));
    dispatch(updateCurrentInterpretation());
    dispatch(setSelectedStepsIDs(null));
    dispatch(setStatisticsMode(null));
  };

  return (
    <ToolsPMDSkeleton>
      <DropdownSelect 
        label={'Текущий файл'}
        options={allDataPMD.map(pmd => pmd.metadata.name)}
        defaultValue={allDataPMD[0].metadata.name}
        onOptionSelect={handleFileSelect}
      />
      <DropdownSelect 
        label={'Система координат'}
        options={['Образец', 'Географическая', 'Стратиграфическая']}
        defaultValue='Географическая'
        onOptionSelect={handleReferenceSelect}
      />
      <ButtonGroupWithLabel label='Статистический метод'>
        <StatModeButton mode='pca'/>
        <StatModeButton mode='pca0'/>
        <StatModeButton mode='gc'/>
        <StatModeButton mode='gcn'/>
      </ButtonGroupWithLabel>
      <ButtonGroupWithLabel label='Смотреть статистику'>
        <Button onClick={() => setAllFilesStatOpen(true)}>По всем файлам</Button>
      </ButtonGroupWithLabel>
      <ModalWrapper
        open={allFilesStatOpen}
        setOpen={setAllFilesStatOpen}
      >
        <OutputDataTablePMD />
      </ModalWrapper>
      <ModalWrapper
        open={showStepsInput}
        setOpen={setShowStepsInput}
        size={{width: '24vw', height: '20vh'}}
      >
        <TextField
          label="Введите шаги"
          helperText="Валидные примеры: 1-9 || 2,4,8,9 || 2-4,8,9 || 2-4,8,9-11"
          value={enteredSteps}
          onChange={() => null}
          variant="standard"
        />
      </ModalWrapper>
    </ToolsPMDSkeleton>
  )
}

export default ToolsPMD;