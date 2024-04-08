import React, { FC, useEffect, useState } from 'react';
import ButtonGroupWithLabel from '../../Common/Buttons/ButtonGroupWithLabel/ButtonGroupWithLabel';
import { Button, Tooltip, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { IDirData } from '../../../utils/GlobalTypes';
import ModalWrapper from '../../Common/Modal/ModalWrapper';
import ToolsPMDSkeleton from './ToolsDIRSkeleton';
import StatModeButton from './StatModeButton';
import InputApply from '../../Common/InputApply/InputApply';
import parseDotsIndexesInput from '../../../utils/parsers/parseDotsIndexesInput';
import ShowHideDotsButtons from './ShowHideDotsButtons';
import { referenceToLabel } from '../../../utils/parsers/labelToReference';
import { enteredIndexesToIDsDIR } from '../../../utils/parsers/enteredIndexesToIDs';
import { 
  setReference, 
  setSelectedDirectionsIDs, 
  setStatisticsMode,
} from '../../../services/reducers/dirPage';
import { Reference } from '../../../utils/graphs/types';
import VGPModalContent from '../VGP/VGPmodalContent';
import FoldTestContainer from './PMTests/FoldTestContainer';
import PMTestsModalContent from './PMTests/PMTestsModalContent';
import ReversePolarityButtons from './ReversePolarityButtons';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from 'react-i18next';
import CurrentDIRFileSelector from './CurrentDIRFileSelector';
import CommentsToggleButton from './CommentsToggleButton';

interface IToolsDIR {
  data: IDirData | null;
};

const ToolsDIR: FC<IToolsDIR> = ({ data }) => {

  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation('translation');
  const widthLessThan1400 = useMediaQuery({ query: '(max-width: 1400px)' });
  
  const { hotkeys, hotkeysActive } = useAppSelector(state => state.appSettingsReducer);
  const { selectedDirectionsIDs, hiddenDirectionsIDs, statisticsMode, reference } = useAppSelector(state => state.dirPageReducer); 

  const [showIndexesInput, setShowIndexesInput] = useState<boolean>(false);
  const [showVGP, setShowVGP] = useState<boolean>(false);
  const [showPMTests, setShowPMTests] = useState<boolean>(false);

  const availableReferences: Array<Reference> = ['geographic', 'stratigraphic'];

  const [coordinateSystemHotkey, setCoordinateSystemHotkey] = useState<{key: string, code: string}>({key: 'Q', code: 'KeyQ'});
  const [fisherHotkey, setFisherHotkey] = useState<{key: string, code: string}>({key: 'F', code: 'KeyF'});
  const [mcFaddenHotkey, setMcFaddenHotkey] = useState<{key: string, code: string}>({key: 'M', code: 'KeyM'});
  const [gcHotkey, setGcHotkey] = useState<{key: string, code: string}>({key: 'G', code: 'KeyG'});
  const [gcnHotkey, setGcnHotkey] = useState<{key: string, code: string}>({key: 'I', code: 'KeyI'});
  const [unselectHotkey, setUnselectHotkey] = useState<{key: string, code: string}>({key: 'U', code: 'KeyU'});

  useEffect(() => {
    const coordinateSystemHotkeys = hotkeys.find(block => block.title === 'Система координат')?.hotkeys;
    const statHotkeys = hotkeys.find(block => block.title === 'Статистические методы')?.hotkeys;
    const selectionHotkeys = hotkeys.find(block => block.title === 'Выделение точек')?.hotkeys;

    if (coordinateSystemHotkeys && statHotkeys && selectionHotkeys) {
      setCoordinateSystemHotkey(coordinateSystemHotkeys.find(hotkey => hotkey.label === 'Прокручивание систем координат')!.hotkey);
      setFisherHotkey(statHotkeys.find(hotkey => hotkey.label === 'Fisher')!.hotkey);
      setMcFaddenHotkey(statHotkeys.find(hotkey => hotkey.label === 'McFadden')!.hotkey);
      setGcHotkey(statHotkeys.find(hotkey => hotkey.label === 'GC')!.hotkey);
      setGcnHotkey(statHotkeys.find(hotkey => hotkey.label === 'GCN')!.hotkey);
      setUnselectHotkey(selectionHotkeys.find(hotkey => hotkey.label === 'Убрать выделение')!.hotkey);
    }
  }, [hotkeys]);

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
  }, [hotkeysActive, hotkeys, reference]);

  // обработчик нажатий на клавиатуру
  const handleHotkeys = (event: KeyboardEvent) => {
    const keyCode = event.code;

    if (keyCode === coordinateSystemHotkey.code) {
      event.preventDefault();
      const currReferenceIndex = availableReferences.findIndex(coordRef => coordRef === reference);
      const nextReferenceIndex = (currReferenceIndex + 1) % 2;
      dispatch(setReference(availableReferences[nextReferenceIndex]));
    };
    if (keyCode === fisherHotkey.code) {
      event.preventDefault();
      dispatch(setStatisticsMode('fisher'))
    };
    if (keyCode === mcFaddenHotkey.code) {
      event.preventDefault();
      dispatch(setStatisticsMode('mcFad'))
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
    const maxIndex = data?.interpretations.length || 0;
    const parsedIndexes = parseDotsIndexesInput(steps || `1-${maxIndex}`, maxIndex);
    const IDs = enteredIndexesToIDsDIR(parsedIndexes, hiddenDirectionsIDs, data!);
    dispatch(setSelectedDirectionsIDs(IDs));
    setShowIndexesInput(false);
  };
  
  if (!data) return <ToolsPMDSkeleton />;

  return (
    <ToolsPMDSkeleton>
      <ButtonGroupWithLabel label={t('dirPage.tools.coordinateSystem.title')}>
        {
          availableReferences.map(availRef => (
            <Tooltip
              title={<Typography variant='body1'>{coordinateSystemHotkey.key}</Typography>}
              enterDelay={250}
              arrow
            >
              <Button 
                color={reference === availRef ? 'secondary' : 'primary'}
                onClick={() => handleReferenceSelect(availRef)}
                sx={{
                  width: '80px',
                  borderRadius: '16px',
                  fontWeight: reference === availRef ? 600 : 400,
                }}
              >
                { referenceToLabel(availRef) }
              </Button>
            </Tooltip>
          ))
        }
      </ButtonGroupWithLabel>
      <ButtonGroupWithLabel label={t('dirPage.tools.statMethod.title')}>
        <StatModeButton mode='fisher' hotkey={fisherHotkey.key}/>
        <StatModeButton mode='mcFad' hotkey={mcFaddenHotkey.key}/>
        <StatModeButton mode='gc' hotkey={gcHotkey.key}/>
      </ButtonGroupWithLabel>
      <ShowHideDotsButtons data={data} />
      <ReversePolarityButtons data={data} />
      <ButtonGroupWithLabel label={t('dirPage.tools.vgp.title')}>
        <Button onClick={() => setShowVGP(true)}>
          {t('dirPage.tools.vgp.label')}
        </Button>
      </ButtonGroupWithLabel>
      <ButtonGroupWithLabel label={t('dirPage.tools.tests.title')}>
        <Button onClick={() => setShowPMTests(true)}>
          {t('dirPage.tools.tests.label')}
        </Button>
      </ButtonGroupWithLabel>
      <CommentsToggleButton />
      <ModalWrapper
        open={showVGP}
        setOpen={setShowVGP}
        size={{
          width: widthLessThan1400 ? '94vw' : '88vw', 
          height: widthLessThan1400 ? '88vh' : '80vh'
        }}
        position={{left: '50%', top: '50%'}}
        isDraggable={false}
      >
        <VGPModalContent data={data}/>
      </ModalWrapper>
      <ModalWrapper
        open={showPMTests}
        setOpen={setShowPMTests}
        size={{
          width: widthLessThan1400 ? '94vw' : '88vw', 
          height: widthLessThan1400 ? '88vh' : '80vh'
        }}
        position={{left: '50%', top: '50%'}}
        isDraggable={false}
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
            label={`${t('inputDirs.label')} (${statisticsMode})`}
            helperText={`${t('inputDirs.helper')} 1-9 || 2,4,8,9 || 2-4;8,9 || 2-4;8,9;12-14`}
            onApply={handleEnteredDotsIndexesApply}
            placeholder={`1-${data.interpretations.length}`}
          />
        </ModalWrapper>
      }
    </ToolsPMDSkeleton>
  )
}

export default ToolsDIR;