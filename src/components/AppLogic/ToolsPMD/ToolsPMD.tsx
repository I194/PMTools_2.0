import React, { FC, useEffect, useState } from 'react';
import { ButtonGroupWithLabel } from '../../Common/Buttons';
import { Button, Tooltip, Typography } from '@mui/material';
import { Reference } from '../../../utils/graphs/types';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { 
  setReference, 
  setSelectedStepsIDs,
  setStatisticsMode,
} from '../../../services/reducers/pcaPage';
import { IPmdData } from '../../../utils/GlobalTypes';
import ModalWrapper from '../../Common/Modal/ModalWrapper';
import InputApply from '../../Common/InputApply/InputApply';
import ToolsPMDSkeleton from './ToolsPMDSkeleton';
import StatModeButton from './StatModeButton';
import parseDotsIndexesInput from '../../../utils/parsers/parseDotsIndexesInput';
import ShowHideDotsButtons from './ShowHideDotsButtons';
import { referenceToLabel } from '../../../utils/parsers/labelToReference';
import { enteredIndexesToIDsPMD } from '../../../utils/parsers/enteredIndexesToIDs';
import { useTranslation } from 'react-i18next';
import CommentsToggleButton from './CommentsToggleButton';

interface IToolsPMD {
  data: IPmdData | null;
};

const ToolsPMD: FC<IToolsPMD> = ({ data }) => {

  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation('translation');

  const { hotkeys, hotkeysActive } = useAppSelector(state => state.appSettingsReducer);
  const { 
    reference, selectedStepsIDs, statisticsMode, hiddenStepsIDs
  } = useAppSelector(state => state.pcaPageReducer); 

  const [coordinateSystem, setCoordinateSystem] = useState<Reference>('geographic');
  const [showStepsInput, setShowStepsInput] = useState<boolean>(false);

  const availableReferences: Array<Reference> = ['specimen', 'geographic', 'stratigraphic'];

  const [coordinateSystemHotkey, setCoordinateSystemHotkey] = useState<{key: string, code: string}>({key: 'Q', code: 'KeyQ'});
  const [pcaHotkey, setPcaHotkey] = useState<{key: string, code: string}>({key: 'D', code: 'KeyD'});
  const [pca0Hotkey, setPca0Hotkey] = useState<{key: string, code: string}>({key: 'O', code: 'KeyO'});
  const [gcHotkey, setGcHotkey] = useState<{key: string, code: string}>({key: 'G', code: 'KeyG'});
  const [gcnHotkey, setGcnHotkey] = useState<{key: string, code: string}>({key: 'I', code: 'KeyI'});
  const [unselectHotkey, setUnselectHotkey] = useState<{key: string, code: string}>({key: 'U', code: 'KeyU'});

  useEffect(() => {
    const coordinateSystemHotkeys = hotkeys.find(block => block.title === 'Система координат')?.hotkeys;
    const statHotkeys = hotkeys.find(block => block.title === 'Статистические методы')?.hotkeys;
    const selectionHotkeys = hotkeys.find(block => block.title === 'Выделение точек')?.hotkeys;

    if (coordinateSystemHotkeys && statHotkeys && selectionHotkeys) {
      setCoordinateSystemHotkey(coordinateSystemHotkeys.find(hotkey => hotkey.label === 'Прокручивание систем координат')!.hotkey);
      setPcaHotkey(statHotkeys.find(hotkey => hotkey.label === 'PCA')!.hotkey);
      setPca0Hotkey(statHotkeys.find(hotkey => hotkey.label === 'PCA0')!.hotkey);
      setGcHotkey(statHotkeys.find(hotkey => hotkey.label === 'GC')!.hotkey);
      setGcnHotkey(statHotkeys.find(hotkey => hotkey.label === 'GCN')!.hotkey);
      setUnselectHotkey(selectionHotkeys.find(hotkey => hotkey.label === 'Убрать выделение')!.hotkey);
    }
  }, [hotkeys]);

  useEffect(() => {
    if ((!selectedStepsIDs || !selectedStepsIDs.length) && statisticsMode) {
      setShowStepsInput(true);
    } else {
      setShowStepsInput(false);
    }
  }, [selectedStepsIDs, statisticsMode]);

  useEffect(() => {
    if (hotkeysActive) window.addEventListener("keydown", handleHotkeys);
    else window.removeEventListener("keydown", handleHotkeys);
    return () => {
      window.removeEventListener("keydown", handleHotkeys);
    };
  }, [hotkeysActive, hotkeys, reference]);
  
  useEffect(() => {
    setCoordinateSystem(reference);
  }, [reference]);

  const handleReferenceSelect = (selectedReference: Reference) => {
    dispatch(setReference(selectedReference));
  };

  const handleHotkeys = (event: KeyboardEvent) => {
    const keyCode = event.code;

    if (keyCode === coordinateSystemHotkey.code) {
      event.preventDefault();
      const currReferenceIndex = availableReferences.findIndex(coordRef => coordRef === reference);
      const nextReferenceIndex = (currReferenceIndex + 1) % 3;
      dispatch(setReference(availableReferences[nextReferenceIndex]));
    }
    if (keyCode === pcaHotkey.code) {
      event.preventDefault();
      dispatch(setStatisticsMode('pca'))
    };
    if (keyCode === pca0Hotkey.code) {
      event.preventDefault();
      dispatch(setStatisticsMode('pca0'))
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
      dispatch(setSelectedStepsIDs(null));
    };
  };

  if (!data) return <ToolsPMDSkeleton />;

  const handleEnteredStepsApply = (steps: string) => {
    const maxIndex = data.steps.length;
    const parsedIndexes = parseDotsIndexesInput(steps || `1-${maxIndex}`, maxIndex);
    const IDs = enteredIndexesToIDsPMD(parsedIndexes, hiddenStepsIDs, data!);
    dispatch(setSelectedStepsIDs(IDs));
    setShowStepsInput(false);
  };

  return (
    <ToolsPMDSkeleton>
      <ButtonGroupWithLabel label={t('pcaPage.tools.coordinateSystem.title')}>
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
      <ButtonGroupWithLabel label={t('pcaPage.tools.statMethod.title')}>
        <StatModeButton mode='pca' hotkey={pcaHotkey.key}/>
        <StatModeButton mode='pca0' hotkey={pca0Hotkey.key}/>
        <StatModeButton mode='gc' hotkey={gcHotkey.key}/>
        <StatModeButton mode='gcn' hotkey={gcnHotkey.key}/>
      </ButtonGroupWithLabel>
      {/* <ShowHideDotsButtons setShowStepsInput={setShowStepsInput} showStepsInput={showStepsInput}/> */}
      <ShowHideDotsButtons data={data} />
      <CommentsToggleButton />
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
            label={`${t('inputDirs.label')} (${statisticsMode || 'hide steps'})`}
            helperText={`${t('inputDirs.helper')} 1-9 || 2,4,8,9 || 2-4;8,9 || 2-4;8,9;12-14`}
            onApply={handleEnteredStepsApply}
            placeholder={`1-${data.steps.length}`}
          />
        </ModalWrapper>
      }
    </ToolsPMDSkeleton>
  )
}

export default ToolsPMD;