import React, { FC, useCallback, useEffect, useState } from 'react';
import styles from './ToolsDIR.module.scss';
import DropdownSelect from '../../Sub/DropdownSelect/DropdownSelect';
import ButtonGroupWithLabel from '../../Sub/ButtonGroupWithLabel/ButtonGroupWithLabel';
import { Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { IDirData } from '../../../utils/GlobalTypes';
import ModalWrapper from '../../Sub/Modal/ModalWrapper';
import ToolsPMDSkeleton from './ToolsDIRSkeleton';
import OutputDataTablePMD from '../DataTablesPMD/OutputDataTable/OutputDataTablePMD';
import StatModeButton from './StatModeButton';
import { setCurrentDIRid } from '../../../services/reducers/parsedData';
import InputApply from '../../Sub/InputApply/InputApply';
import parseDotsIndexesInput from '../../../utils/parsers/parseDotsIndexesInput';
import DropdownSelectWithButtons from '../../Sub/DropdownSelect/DropdownSelectWithButtons';
import ShowHideDotsButtons from './ShowHideDotsButtons';
import { referenceToLabel } from '../../../utils/parsers/labelToReference';
import { enteredIndexesToIDsDIR } from '../../../utils/parsers/enteredIndexesToIDs';
import { setReference, setSelectedDirectionsIDs, setStatisticsMode, updateCurrentInterpretation, updateCurrentFileInterpretations } from '../../../services/reducers/dirPage';
import { Reference } from '../../../utils/graphs/types';
import OutputDataTableDIR from '../DataTablesDIR/OutputDataTable/OutputDataTableDIR';

interface IToolsDIR {
  data: IDirData | null;
};

const ToolsDIR: FC<IToolsDIR> = ({ data }) => {

  const dispatch = useAppDispatch();

  const { dirStatData } = useAppSelector(state => state.parsedDataReducer);
  const { selectedDirectionsIDs, hiddenDirectionsIDs, statisticsMode, reference } = useAppSelector(state => state.dirPageReducer); 

  const [allDirData, setAllDirData] = useState<Array<IDirData>>([]);
  const [allFilesStatOpen, setAllFilesStatOpen] = useState<boolean>(false);
  const [showIndexesInput, setShowIndexesInput] = useState<boolean>(false);
  const [showVGP, setShowVGP] = useState<boolean>(false);

  const availableReferences: Array<Reference> = ['geographic', 'stratigraphic'];

  // для списка всех файлов
  useEffect(() => {
    if (dirStatData) {
      setAllDirData(dirStatData);
    };
  }, [dirStatData]);

  // открывает окно ввода номеров точек (точки, номера которых будут введены, будут выбраны)
  useEffect(() => {
    if ((!selectedDirectionsIDs || !selectedDirectionsIDs.length) && statisticsMode) {
      setShowIndexesInput(true);
    } else {
      setShowIndexesInput(false);
    }
  }, [selectedDirectionsIDs, statisticsMode]);

  // добавляет слушатель нажатий на клавиатуру (для использования сочетаний клавиш)
  useEffect(() => {
    window.addEventListener("keydown", handleHotkeys);
    return () => {
      window.removeEventListener("keydown", handleHotkeys);
    };
  }, []);

  // обработчик нажатий на клавиатуру
  const handleHotkeys = useCallback((e) => {
    const key = (e.code as string);
    const { ctrlKey, shiftKey, altKey } = e; 
    if ((shiftKey || altKey) && key === 'KeyF') {
      e.preventDefault();
      dispatch(setStatisticsMode('fisher'))
    };
    if ((shiftKey || altKey) && key === 'KeyM') {
      e.preventDefault();
      dispatch(setStatisticsMode('mcFadden'))
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

  // обработчик выбранной системы координат 
  const handleReferenceSelect = (selectedReference: Reference) => {
    dispatch(setReference(selectedReference));
  };

  // обработчик введённых номеров точек
  const handleEnteredDotsIndexesApply = (steps: string) => {
    const parsedIndexes = parseDotsIndexesInput(steps);
    const IDs = enteredIndexesToIDsDIR(parsedIndexes, hiddenDirectionsIDs, data!);
    dispatch(setSelectedDirectionsIDs(IDs));
    setShowIndexesInput(false);
  };

  // обработчик выбранного файла
  const handleFileSelect = (option: string) => {
    const dirID = allDirData.findIndex(dir => dir.name === option);
    dispatch(setCurrentDIRid(dirID));
    // cleaners
    dispatch(updateCurrentFileInterpretations(option));
    dispatch(updateCurrentInterpretation());
    dispatch(setSelectedDirectionsIDs(null));
    dispatch(setStatisticsMode(null));
  };
  
  if (!data) return <ToolsPMDSkeleton />;

  return (
    <ToolsPMDSkeleton>
      <DropdownSelectWithButtons 
        label={'Текущий файл'}
        options={allDirData.map(dir => dir.name)}
        defaultValue={allDirData[0].name}
        onOptionSelect={handleFileSelect}
        minWidth={'120px'}
        useArrowListeners={true}
      />
      <ButtonGroupWithLabel label='Система координат'>
        {
          availableReferences.map(availRef => (
            <Button 
              color={reference === availRef ? 'secondary' : 'primary'}
              onClick={() => handleReferenceSelect(availRef)}
              sx={{width: '80px'}}
            >
              { referenceToLabel(availRef) }
            </Button>
          ))
        }
      </ButtonGroupWithLabel>
      <ButtonGroupWithLabel label='Статистический метод'>
        <StatModeButton mode='fisher'/>
        <StatModeButton mode='mcFadden'/>
        <StatModeButton mode='gc'/>
        <StatModeButton mode='gcn'/>
      </ButtonGroupWithLabel>
      <ButtonGroupWithLabel label='Смотреть статистику'>
        <Button onClick={() => setAllFilesStatOpen(true)}>По всем файлам</Button>
      </ButtonGroupWithLabel>
      <ShowHideDotsButtons setShowStepsInput={setShowIndexesInput} dirData={data}/>
      <ButtonGroupWithLabel label='По всем сайтам'>
        <Button onClick={() => setShowVGP(true)}>Построить VGP</Button>
      </ButtonGroupWithLabel>
      <ModalWrapper
        open={allFilesStatOpen}
        setOpen={setAllFilesStatOpen}
        size={{width: '60vw', height: '60vh'}}
      >
        <OutputDataTableDIR />
      </ModalWrapper>
      <ModalWrapper
        open={showVGP}
        setOpen={setShowVGP}
        size={{width: '80vw', height: '60vh'}}
        position={{left: '50%', top: '50%'}}
        isDraggable={true}
      >
        {/* <OutputDataTableDIR /> */}
      </ModalWrapper>
      {
        showIndexesInput && 
        <ModalWrapper
          open={showIndexesInput}
          setOpen={setShowIndexesInput}
          size={{width: '26vw', height: '20vh'}}
          position={{left: '50%', top: '20%'}}
          onClose={() => {dispatch(setStatisticsMode(null))}}
          isDraggable={true}
        >
          <InputApply 
            label={`Введите номера точек (${statisticsMode})`}
            helperText="Валидные примеры: 1-9 || 2,4,8,9 || 2-4;8,9 || 2-4;8,9;12-14"
            onApply={handleEnteredDotsIndexesApply}
          />
        </ModalWrapper>
      }
    </ToolsPMDSkeleton>
  )
}

export default ToolsDIR;