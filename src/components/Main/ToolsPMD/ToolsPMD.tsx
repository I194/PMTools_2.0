import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import styles from './ToolsPMD.module.scss';
import DropdownSelect from '../../Sub/DropdownSelect/DropdownSelect';
import { ButtonGroupWithLabel } from '../../Sub/Buttons';
import { Button } from '@mui/material';
import { Reference } from '../../../utils/graphs/types';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { deleteInterepretationByParentFile, setHiddenStepsIDs, setReference, setSelectedStepsIDs, setStatisticsMode, updateCurrentFileInterpretations, updateCurrentInterpretation } from '../../../services/reducers/pcaPage';
import { IPmdData } from '../../../utils/GlobalTypes';
import ModalWrapper from '../../Sub/Modal/ModalWrapper';
import ToolsPMDSkeleton from './ToolsPMDSkeleton';
import OutputDataTablePMD from '../DataTablesPMD/OutputDataTable/OutputDataTablePMD';
import StatModeButton from './StatModeButton';
import { setCurrentPMDid } from '../../../services/reducers/parsedData';
import InputApply from '../../Sub/InputApply/InputApply';
import parseDotsIndexesInput from '../../../utils/parsers/parseDotsIndexesInput';
import DropdownSelectWithButtons from '../../Sub/DropdownSelect/DropdownSelectWithButtons';
import ShowHideDotsButtons from './ShowHideDotsButtons';
import { referenceToLabel } from '../../../utils/parsers/labelToReference';
import { enteredIndexesToIDsPMD } from '../../../utils/parsers/enteredIndexesToIDs';
import { setTreatmentFiles } from '../../../services/reducers/files';

interface IToolsPMD {
  data: IPmdData | null;
};

const ToolsPMD: FC<IToolsPMD> = ({ data }) => {

  const dispatch = useAppDispatch();

  const { hotkeys, hotkeysActive } = useAppSelector(state => state.appSettingsReducer);
  const { treatmentFiles } = useAppSelector(state => state.filesReducer);
  const { treatmentData, currentDataPMDid } = useAppSelector(state => state.parsedDataReducer);
  const { reference, selectedStepsIDs, statisticsMode, hiddenStepsIDs } = useAppSelector(state => state.pcaPageReducer); 

  const [allDataPMD, setAllDataPMD] = useState<Array<IPmdData>>([]);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [coordinateSystem, setCoordinateSystem] = useState<Reference>('geographic');
  const [allFilesStatOpen, setAllFilesStatOpen] = useState<boolean>(false);
  const [showStepsInput, setShowStepsInput] = useState<boolean>(false);

  const availableReferences: Array<Reference> = ['specimen', 'geographic', 'stratigraphic'];

  useEffect(() => {
    if (treatmentData) {
      setAllDataPMD(treatmentData);
    };
  }, [treatmentData]);

  useEffect(() => {
    if ((!selectedStepsIDs || !selectedStepsIDs.length) && statisticsMode) {
      console.log('what', selectedStepsIDs, statisticsMode);
      setShowStepsInput(true);
    } else {
      setShowStepsInput(false);
    }
  }, [selectedStepsIDs, statisticsMode]);

  useEffect(() => {
    console.log('what', hotkeysActive)
    if (hotkeysActive) window.addEventListener("keydown", handleHotkeys);
    else window.removeEventListener("keydown", handleHotkeys);
    return () => {
      window.removeEventListener("keydown", handleHotkeys);
    };
  }, [hotkeysActive, hotkeys]);
  
  useEffect(() => {
    setCoordinateSystem(reference);
  }, [reference]);

  useEffect(() => {
    if (currentDataPMDid !== null) {
      const filename = allDataPMD[currentDataPMDid].metadata.name;
      if (filename) {
        setCurrentFileName(filename);
        dispatch(updateCurrentFileInterpretations(filename));
        dispatch(updateCurrentInterpretation());
        dispatch(setSelectedStepsIDs(null));
        dispatch(setHiddenStepsIDs([]));
        dispatch(setStatisticsMode(null));
      } else dispatch(setCurrentPMDid(0));
    }
  }, [currentDataPMDid, allDataPMD]);

  const handleReferenceSelect = (selectedReference: Reference) => {
    dispatch(setReference(selectedReference));
  };

  const handleHotkeys = (event: KeyboardEvent) => {
    const keyCode = event.code;
    const statHotkeys = hotkeys.find(block => block.title === 'Статистические методы')?.hotkeys;
    const selectionHotkeys = hotkeys.find(block => block.title === 'Выделение точек')?.hotkeys;
    if (!statHotkeys || !selectionHotkeys) return;

    const pcaHotkey = statHotkeys.find(hotkey => hotkey.label === 'PCA')?.hotkey.code;
    const pca0Hotkey = statHotkeys.find(hotkey => hotkey.label === 'PCA0')?.hotkey.code;
    const gcHotkey = statHotkeys.find(hotkey => hotkey.label === 'GC')?.hotkey.code;
    const gcnHotkey = statHotkeys.find(hotkey => hotkey.label === 'GCN')?.hotkey.code;
    const unselectHotkey = selectionHotkeys.find(hotkey => hotkey.label === 'Убрать выделение')?.hotkey.code;

    if (keyCode === pcaHotkey) {
      event.preventDefault();
      dispatch(setStatisticsMode('pca'))
    };
    if (keyCode === pca0Hotkey) {
      event.preventDefault();
      dispatch(setStatisticsMode('pca0'))
    };
    if (keyCode === gcHotkey) {
      event.preventDefault();
      dispatch(setStatisticsMode('gc'))
    };
    if (keyCode === gcnHotkey) {
      event.preventDefault();
      dispatch(setStatisticsMode('gcn'))
    };
    if (keyCode === unselectHotkey) {
      event.preventDefault();
      dispatch(setSelectedStepsIDs(null));
    };
  };

  if (!data) return <ToolsPMDSkeleton />;

  const handleEnteredStepsApply = (steps: string) => {
    const parsedIndexes = parseDotsIndexesInput(steps || `1-${data.steps.length}`);
    const IDs = enteredIndexesToIDsPMD(parsedIndexes, hiddenStepsIDs, data!);
    dispatch(setSelectedStepsIDs(IDs));
    setShowStepsInput(false);
  };

  const handleFileSelect = (option: string) => {
    const pmdID = allDataPMD.findIndex(pmd => pmd.metadata.name === option);
    dispatch(setCurrentPMDid(pmdID));
  };

  const handleFileDelete = (option: string) => {
    if (treatmentFiles) {
      const updatedFiles = treatmentFiles.filter(file => file.name !== option);
      dispatch(setTreatmentFiles(updatedFiles));
      dispatch(deleteInterepretationByParentFile(option));
    };
  };

  return (
    <ToolsPMDSkeleton>
      <DropdownSelectWithButtons 
        label={'Текущий файл'}
        options={allDataPMD.map(pmd => pmd.metadata.name)}
        defaultValue={currentFileName}
        onOptionSelect={handleFileSelect}
        minWidth={'120px'}
        useArrowListeners={true}
        showDelete={true}
        onDelete={handleFileDelete}
      />
      <ButtonGroupWithLabel label='Система координат'>
        {
          availableReferences.map(availRef => (
            <Button 
              color={reference === availRef ? 'secondary' : 'primary'}
              onClick={() => handleReferenceSelect(availRef)}
            >
              { referenceToLabel(availRef) }
            </Button>
          ))
        }
      </ButtonGroupWithLabel>
      <ButtonGroupWithLabel label='Статистический метод'>
        <StatModeButton mode='pca'/>
        <StatModeButton mode='pca0'/>
        <StatModeButton mode='gc'/>
        <StatModeButton mode='gcn'/>
      </ButtonGroupWithLabel>
      <ButtonGroupWithLabel label='Смотреть статистику'>
        <Button onClick={() => setAllFilesStatOpen(true)}>По всем файлам</Button>
      </ButtonGroupWithLabel>
      <ShowHideDotsButtons setShowStepsInput={setShowStepsInput} showStepsInput={showStepsInput}/>
      <ModalWrapper
        open={allFilesStatOpen}
        setOpen={setAllFilesStatOpen}
        size={{width: '60vw', height: '60vh'}}
      >
        <OutputDataTablePMD />
      </ModalWrapper>
      {
        showStepsInput && 
        <ModalWrapper
          open={showStepsInput}
          setOpen={setShowStepsInput}
          size={{width: '26vw', height: '14vh'}}
          position={{left: '50%', top: '20%'}}
          onClose={() => {dispatch(setStatisticsMode(null))}}
          isDraggable={true}
        >
          <InputApply 
            label={`Введите номера шагов (${statisticsMode || 'hide steps'})`}
            helperText="Валидные примеры: 1-9 || 2,4,8,9 || 2-4;8,9 || 2-4;8,9;12-14"
            onApply={handleEnteredStepsApply}
            placeholder={`1-${data.steps.length}`}
          />
        </ModalWrapper>
      }
    </ToolsPMDSkeleton>
  )
}

export default ToolsPMD;