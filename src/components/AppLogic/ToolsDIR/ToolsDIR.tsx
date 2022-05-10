import React, { FC, useCallback, useEffect, useState } from 'react';
import styles from './ToolsDIR.module.scss';
import DropdownSelect from '../../Sub/DropdownSelect/DropdownSelect';
import ButtonGroupWithLabel from '../../Sub/Buttons/ButtonGroupWithLabel/ButtonGroupWithLabel';
import { Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { IDirData } from '../../../utils/GlobalTypes';
import ModalWrapper from '../../Sub/Modal/ModalWrapper';
import ToolsPMDSkeleton from './ToolsDIRSkeleton';
import StatModeButton from './StatModeButton';
import { setCurrentDIRid } from '../../../services/reducers/parsedData';
import InputApply from '../../Sub/InputApply/InputApply';
import parseDotsIndexesInput from '../../../utils/parsers/parseDotsIndexesInput';
import DropdownSelectWithButtons from '../../Sub/DropdownSelect/DropdownSelectWithButtons';
import ShowHideDotsButtons from './ShowHideDotsButtons';
import { referenceToLabel } from '../../../utils/parsers/labelToReference';
import { enteredIndexesToIDsDIR } from '../../../utils/parsers/enteredIndexesToIDs';
import { 
  setReference, 
  setSelectedDirectionsIDs, 
  setStatisticsMode, 
  updateCurrentInterpretation, 
  updateCurrentFileInterpretations, 
  deleteInterepretationByParentFile,
  sethiddenDirectionsIDs,
} from '../../../services/reducers/dirPage';
import { Reference } from '../../../utils/graphs/types';
import OutputDataTableDIR from '../DataTablesDIR/OutputDataTable/OutputDataTableDIR';
import VGPModalContent from '../VGP/VGPmodalContent';
import { setDirStatFiles } from '../../../services/reducers/files';
import FoldTestContainer from './PMTests/FoldTestContainer';
import PMTestsModalContent from './PMTests/PMTestsModalContent';

interface IToolsDIR {
  data: IDirData | null;
};

const ToolsDIR: FC<IToolsDIR> = ({ data }) => {

  const dispatch = useAppDispatch();
  
  const { hotkeys, hotkeysActive } = useAppSelector(state => state.appSettingsReducer);
  const { dirStatFiles } = useAppSelector(state => state.filesReducer);
  const { dirStatData, currentDataDIRid } = useAppSelector(state => state.parsedDataReducer);
  const { selectedDirectionsIDs, hiddenDirectionsIDs, statisticsMode, reference } = useAppSelector(state => state.dirPageReducer); 

  const [allDirData, setAllDirData] = useState<Array<IDirData>>([]);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [allFilesStatOpen, setAllFilesStatOpen] = useState<boolean>(false);
  const [showIndexesInput, setShowIndexesInput] = useState<boolean>(false);
  const [showVGP, setShowVGP] = useState<boolean>(false);
  const [showPMTests, setShowPMTests] = useState<boolean>(false);

  const availableReferences: Array<Reference> = ['geographic', 'stratigraphic'];

  const [fisherHotkey, setFisherHotkey] = useState<{key: string, code: string}>({key: 'F', code: 'KeyF'});
  const [mcFaddenHotkey, setMcFaddenHotkey] = useState<{key: string, code: string}>({key: 'M', code: 'KeyM'});
  const [gcHotkey, setGcHotkey] = useState<{key: string, code: string}>({key: 'G', code: 'KeyG'});
  const [gcnHotkey, setGcnHotkey] = useState<{key: string, code: string}>({key: 'I', code: 'KeyI'});
  const [unselectHotkey, setUnselectHotkey] = useState<{key: string, code: string}>({key: 'U', code: 'KeyU'});

  useEffect(() => {
    const statHotkeys = hotkeys.find(block => block.title === 'Статистические методы')?.hotkeys;
    const selectionHotkeys = hotkeys.find(block => block.title === 'Выделение точек')?.hotkeys;
    if (statHotkeys && selectionHotkeys) {
      setFisherHotkey(statHotkeys.find(hotkey => hotkey.label === 'Fisher')!.hotkey);
      setMcFaddenHotkey(statHotkeys.find(hotkey => hotkey.label === 'McFadden')!.hotkey);
      setGcHotkey(statHotkeys.find(hotkey => hotkey.label === 'GC')!.hotkey);
      setGcnHotkey(statHotkeys.find(hotkey => hotkey.label === 'GCN')!.hotkey);
      setUnselectHotkey(selectionHotkeys.find(hotkey => hotkey.label === 'Убрать выделение')!.hotkey);
    }
  }, [hotkeys]);

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
    if (hotkeysActive) window.addEventListener("keydown", handleHotkeys);
    else window.removeEventListener("keydown", handleHotkeys);
    return () => {
      window.removeEventListener("keydown", handleHotkeys);
    };
  }, [hotkeysActive, hotkeys]);

  // обработчик нажатий на клавиатуру
  const handleHotkeys = (event: KeyboardEvent) => {
    const keyCode = event.code;

    if (keyCode === fisherHotkey.code) {
      event.preventDefault();
      dispatch(setStatisticsMode('fisher'))
    };
    if (keyCode === mcFaddenHotkey.code) {
      event.preventDefault();
      dispatch(setStatisticsMode('mcFadden'))
    };
    if (keyCode === gcHotkey.code) {
      event.preventDefault();
      dispatch(setStatisticsMode('gc'))
    };
    if (keyCode === gcnHotkey.code) {
      event.preventDefault();
      dispatch(setStatisticsMode('gcn'))
    };
    if (keyCode === unselectHotkey.code) {
      event.preventDefault();
      dispatch(setSelectedDirectionsIDs([]));
    };
  };

  // обработчик выбранной системы координат 
  const handleReferenceSelect = (selectedReference: Reference) => {
    dispatch(setReference(selectedReference));
  };

  // обработчик введённых номеров точек
  const handleEnteredDotsIndexesApply = (steps: string) => {
    const parsedIndexes = parseDotsIndexesInput(steps || `1-${data?.interpretations.length}`);
    const IDs = enteredIndexesToIDsDIR(parsedIndexes, hiddenDirectionsIDs, data!);
    dispatch(setSelectedDirectionsIDs(IDs));
    setShowIndexesInput(false);
  };

  // при смене текущего файла обновляет данные для отображения
  useEffect(() => {
    if (currentDataDIRid !== null && allDirData.length) {
      const filename = allDirData[currentDataDIRid]?.name;
      if (filename) {
        setCurrentFileName(filename);
        dispatch(updateCurrentFileInterpretations(filename));
        dispatch(updateCurrentInterpretation());
        dispatch(setSelectedDirectionsIDs(null));
        dispatch(sethiddenDirectionsIDs([]));
        dispatch(setStatisticsMode(null));
      } else dispatch(setCurrentDIRid(0));
    }
  }, [currentDataDIRid, allDirData]);
  
  if (!data) return <ToolsPMDSkeleton />;

  const handleFileSelect = (option: string) => {
    const dirID = allDirData.findIndex(dir => dir.name === option);
    dispatch(setCurrentDIRid(dirID));
  };

  const handleFileDelete = (option: string) => {
    if (dirStatFiles) {
      const updatedFiles = dirStatFiles.filter(file => file.name !== option);
      dispatch(setDirStatFiles(updatedFiles));
      dispatch(deleteInterepretationByParentFile(option));
    };
  };

  return (
    <ToolsPMDSkeleton>
      <DropdownSelectWithButtons 
        label={'Текущий файл'}
        options={allDirData.map(dir => dir.name)}
        defaultValue={allDirData[0].name}
        onOptionSelect={handleFileSelect}
        minWidth={'120px'}
        useArrowListeners={true}
        showDelete
        onDelete={handleFileDelete}
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
        <StatModeButton mode='fisher' hotkey={fisherHotkey.key}/>
        <StatModeButton mode='mcFadden' hotkey={mcFaddenHotkey.key}/>
        <StatModeButton mode='gc' hotkey={gcHotkey.key}/>
        <StatModeButton mode='gcn' hotkey={gcnHotkey.key}/>
      </ButtonGroupWithLabel>
      <ButtonGroupWithLabel label='Смотреть статистику'>
        <Button onClick={() => setAllFilesStatOpen(true)}>По всем файлам</Button>
      </ButtonGroupWithLabel>
      <ShowHideDotsButtons data={data} />
      <ButtonGroupWithLabel label='По всем сайтам'>
        <Button onClick={() => setShowVGP(true)}>Построить VGP</Button>
      </ButtonGroupWithLabel>
      <ButtonGroupWithLabel label='Проверка гипотез'>
        <Button onClick={() => setShowPMTests(true)}>Палеомагнтные тесты</Button>
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
        size={{width: '80vw', height: '64vh'}}
        position={{left: '50%', top: '50%'}}
        isDraggable={true}
      >
        <VGPModalContent data={data}/>
      </ModalWrapper>
      <ModalWrapper
        open={showPMTests}
        setOpen={setShowPMTests}
        size={{width: '80vw', height: '64vh'}}
        position={{left: '50%', top: '50%'}}
        isDraggable={true}
      >
        <PMTestsModalContent data={data}/>
      </ModalWrapper>
      {
        showIndexesInput && 
        <ModalWrapper
          open={showIndexesInput}
          setOpen={setShowIndexesInput}
          size={{width: '26vw', height: '14vh'}}
          position={{left: '50%', top: '20%'}}
          onClose={() => {dispatch(setStatisticsMode(null))}}
          isDraggable={true}
        >
          <InputApply 
            label={`Введите номера точек (${statisticsMode})`}
            helperText="Валидные примеры: 1-9 || 2,4,8,9 || 2-4;8,9 || 2-4;8,9;12-14"
            onApply={handleEnteredDotsIndexesApply}
            placeholder={`1-${data.interpretations.length}`}
          />
        </ModalWrapper>
      }
    </ToolsPMDSkeleton>
  )
}

export default ToolsDIR;