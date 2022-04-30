import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import styles from './ToolsPMD.module.scss';
import DropdownSelect from '../../Sub/DropdownSelect/DropdownSelect';
import { ButtonGroupWithLabel } from '../../Sub/Buttons';
import { Button } from '@mui/material';
import { Reference } from '../../../utils/graphs/types';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { deleteInterepretationByParentFile, setReference, setSelectedStepsIDs, setStatisticsMode, updateCurrentFileInterpretations, updateCurrentInterpretation } from '../../../services/reducers/pcaPage';
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

  const { treatmentFiles } = useAppSelector(state => state.filesReducer)
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

  useEffect(() => {
    if (currentDataPMDid !== null) {
      const filename = allDataPMD[currentDataPMDid].metadata.name;
      if (filename) {
        setCurrentFileName(filename);
        dispatch(updateCurrentFileInterpretations(filename));
        dispatch(updateCurrentInterpretation());
        dispatch(setSelectedStepsIDs(null));
        dispatch(setStatisticsMode(null));
      } else dispatch(setCurrentPMDid(0));
    }
  }, [currentDataPMDid, allDataPMD]);

  const handleReferenceSelect = (selectedReference: Reference) => {
    dispatch(setReference(selectedReference));
  };

  const handleStatisticsModeSelect = useCallback((e) => {
    const key = (e.code as string);
    const { ctrlKey, shiftKey, altKey } = e; 
    if ((shiftKey || altKey) && key === 'KeyD') {
      e.preventDefault();
      dispatch(setStatisticsMode('pca'))
    };
    if ((shiftKey || altKey) && key === 'KeyO') {
      e.preventDefault();
      dispatch(setStatisticsMode('pca0'))
    };
    if ((shiftKey || altKey) && key === 'KeyG') {
      e.preventDefault();
      dispatch(setStatisticsMode('gc'))
    };
    if ((shiftKey || altKey) && key === 'KeyI') {
      e.preventDefault();
      dispatch(setStatisticsMode('gcn'))
    };
  }, []);

  const handleEnteredStepsApply = (steps: string) => {
    const parsedIndexes = parseDotsIndexesInput(steps);
    const IDs = enteredIndexesToIDsPMD(parsedIndexes, hiddenStepsIDs, data!);
    dispatch(setSelectedStepsIDs(IDs));
    setShowStepsInput(false);
  };

  if (!data) return <ToolsPMDSkeleton />;

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
      <ShowHideDotsButtons setShowStepsInput={setShowStepsInput} pmdData={data}/>
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
          size={{width: '26vw', height: '20vh'}}
          position={{left: '50%', top: '20%'}}
          onClose={() => {dispatch(setStatisticsMode(null))}}
          isDraggable={true}
        >
          <InputApply 
            label={`Введите номера шагов (${statisticsMode})`}
            helperText="Валидные примеры: 1-9 || 2,4,8,9 || 2-4;8,9 || 2-4;8,9;12-14"
            onApply={handleEnteredStepsApply}
          />
        </ModalWrapper>
      }
    </ToolsPMDSkeleton>
  )
}

export default ToolsPMD;