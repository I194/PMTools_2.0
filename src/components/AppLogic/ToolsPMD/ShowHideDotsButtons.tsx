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

  const onShowClick = () => {
    dispatch(setHiddenStepsIDs([]));
  };

  const onHideClick = () => {
    setHideSteps(true);
  };

  const [showHotkey, setShowHotkey] = useState<{key: string, code: string}>({key: 'S', code: 'KeyS'});
  const [hideHotkey, setHideHotkey] = useState<{key: string, code: string}>({key: 'H', code: 'KeyH'});

  useEffect(() => {
    const visibilityHotkeys = hotkeys.find(block => block.titleKey === 'visibility' || block.title === 'Видимость точек' || block.title === 'Dots visibility')?.hotkeys;
    if (visibilityHotkeys) {
      const show = visibilityHotkeys.find(h => h.labelKey === 'visibility.show')
        || visibilityHotkeys.find(h => h.label === 'Показать точки')
        || visibilityHotkeys.find(h => h.label === 'Show dots');
      const hide = visibilityHotkeys.find(h => h.labelKey === 'visibility.hide')
        || visibilityHotkeys.find(h => h.label === 'Скрыть точки')
        || visibilityHotkeys.find(h => h.label === 'Hide dots');
      if (show) setShowHotkey(show.hotkey);
      if (hide) setHideHotkey(hide.hotkey);
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

  useEffect(() => {
    if (hotkeysActive) window.addEventListener("keydown", handleHotkeys);
    else window.removeEventListener("keydown", handleHotkeys);
    return () => {
      window.removeEventListener("keydown", handleHotkeys);
    };
  }, [hotkeysActive, hotkeys]);

  const handleHotkeys = (event: KeyboardEvent) => {
    const keyCode = event.code;

    if (keyCode === showHotkey.code) {
      event.preventDefault();
      onShowClick();
    };
    if (keyCode === hideHotkey.code) {
      event.preventDefault();
      onHideClick();
    };
  };

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