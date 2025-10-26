import React, { FC, useCallback, useEffect, useState } from "react";
import styles from './ToolsPMD.module.scss';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { addHiddenStepsIDs, setHiddenStepsIDs, setSelectedStepsIDs, setStatisticsMode } from "../../../services/reducers/pcaPage";
import { Button, Tooltip, Typography } from "@mui/material";
import ButtonGroupWithLabel from "../../Common/Buttons/ButtonGroupWithLabel/ButtonGroupWithLabel";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ModalWrapper from '../../Common/Modal/ModalWrapper';
import InputApply from '../../Common/InputApply/InputApply';
import parseDotsIndexesInput from "../../../utils/parsers/parseDotsIndexesInput";
import { enteredIndexesToIDsPMD } from "../../../utils/parsers/enteredIndexesToIDs";
import { IPmdData } from "../../../utils/GlobalTypes";
import { useTranslation } from "react-i18next";

type Props = {
  data: IPmdData;
}

const ShowHideDotsButtons = ({ data }: Props) => {

  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation('translation');

  const { hotkeys, hotkeysActive } = useAppSelector(state => state.appSettingsReducer);
  const { hiddenStepsIDs, selectedStepsIDs } = useAppSelector(state => state.pcaPageReducer); 

  const [hideSteps, setHideSteps] = useState<boolean>(false);
  const [showStepsInput, setShowStepsInput] = useState<boolean>(false);

  const onShowClick = useCallback(() => {
    dispatch(setHiddenStepsIDs([]));
  }, [dispatch]);

  const onHideClick = useCallback(() => {
    setHideSteps(true);
  }, []);

  const [showHotkey, setShowHotkey] = useState<{key: string, code: string}>({key: 'S', code: 'KeyS'});
  const [hideHotkey, setHideHotkey] = useState<{key: string, code: string}>({key: 'H', code: 'KeyH'});

  useEffect(() => {
    const visibilityHotkeys = hotkeys.find(block => block.title === 'Видимость точек')?.hotkeys;
    if (visibilityHotkeys) {
      setShowHotkey(visibilityHotkeys.find(hotkey => hotkey.label === 'Показать точки')!.hotkey);
      setHideHotkey(visibilityHotkeys.find(hotkey => hotkey.label === 'Скрыть точки')!.hotkey);
    };
  }, [hotkeys]);

  useEffect(() => {
    if ((!selectedStepsIDs || !selectedStepsIDs.length) && hideSteps) {
      setShowStepsInput(true);
    }
    if (hideSteps && selectedStepsIDs && selectedStepsIDs.length) {
      dispatch(addHiddenStepsIDs(selectedStepsIDs));
      dispatch(setSelectedStepsIDs(null));
      dispatch(setStatisticsMode(null));
      setHideSteps(false);
    };
  }, [hideSteps, selectedStepsIDs]);

  const handleHotkeys = useCallback((event: KeyboardEvent) => {
    const keyCode = event.code;

    if (keyCode === showHotkey.code) {
      event.preventDefault();
      onShowClick();
    };
    if (keyCode === hideHotkey.code) {
      event.preventDefault();
      onHideClick();
    };
  }, [showHotkey, hideHotkey, onShowClick, onHideClick]);

  useEffect(() => {
    if (!hotkeysActive) return;
    window.addEventListener("keydown", handleHotkeys);
    return () => {
      window.removeEventListener("keydown", handleHotkeys);
    };
  }, [hotkeysActive, handleHotkeys]);

  const handleEnteredStepsApply = (steps: string) => {
    const maxIndex = data.steps.length;
    const parsedIndexes = parseDotsIndexesInput(steps || `1-${maxIndex}`, maxIndex);
    const IDs = enteredIndexesToIDsPMD(parsedIndexes, hiddenStepsIDs, data!);
    dispatch(setSelectedStepsIDs(IDs));
    setShowStepsInput(false);
  };

  return (
    <>
      <ButtonGroupWithLabel label={t('pcaPage.tools.visibility.title')}>
        <Tooltip
          title={<Typography variant='body1'>{hideHotkey.key}</Typography>}
          enterDelay={1000}
          arrow
        >
          <Button
            color={'primary'}
            onClick={onHideClick}
          >
            <VisibilityOffIcon />
          </Button>
        </Tooltip>
        <Tooltip
          title={<Typography variant='body1'>{showHotkey.key}</Typography>}
          enterDelay={1000}
          arrow
        >
          <Button
            color={hiddenStepsIDs.length ? 'warning' : 'primary'}
            onClick={onShowClick}
          >
            <VisibilityIcon /> 
          </Button>
        </Tooltip>
      </ButtonGroupWithLabel>
      {
        showStepsInput && 
        <ModalWrapper
          open={showStepsInput}
          setOpen={setShowStepsInput}
          size={{width: '26vw', height: '14vh'}}
          position={{left: '50%', top: '20%'}}
          onClose={() => {setHideSteps(false)}}
          isDraggable={true}
        >
          <InputApply 
            label={`${t('inputDirs.label')} (hide steps)`}
            helperText={`${t('inputDirs.helper')} 1-9 || 2,4,8,9 || 2-4;8,9 || 2-4;8,9;12-14`}
            onApply={handleEnteredStepsApply}
            placeholder={`1-${data.steps.length}`}
          />
        </ModalWrapper>
      }
    </>
  );
};

export default ShowHideDotsButtons;