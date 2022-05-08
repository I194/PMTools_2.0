import React, { FC, useCallback, useEffect, useState } from "react";
import styles from './ToolsPMD.module.scss';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { addHiddenStepsIDs, setHiddenStepsIDs, setSelectedStepsIDs, setStatisticsMode } from "../../../services/reducers/pcaPage";
import { Button } from "@mui/material";
import ButtonGroupWithLabel from "../../Sub/Buttons/ButtonGroupWithLabel/ButtonGroupWithLabel";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IPmdData } from "../../../utils/GlobalTypes";

interface IShowHideDotsButtons {
  setShowStepsInput: React.Dispatch<React.SetStateAction<boolean>>;
  showStepsInput: boolean;
};

const ShowHideDotsButtons: FC<IShowHideDotsButtons> = ({ setShowStepsInput, showStepsInput }) => {

  const dispatch = useAppDispatch();

  const { hotkeys, hotkeysActive } = useAppSelector(state => state.appSettingsReducer);
  const { hiddenStepsIDs, selectedStepsIDs } = useAppSelector(state => state.pcaPageReducer); 

  const [hideSteps, setHideSteps] = useState<boolean>(false);

  const onShowClick = () => {
    dispatch(setHiddenStepsIDs([]));
  };

  const onHideClick = () => {
    setHideSteps(true);
  };

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
    const visibilityHotkeys = hotkeys.find(block => block.title === 'Видимость точек')?.hotkeys;
    if (!visibilityHotkeys) return;

    const showHotkey = visibilityHotkeys.find(hotkey => hotkey.label === 'Показать точки')?.hotkey.code;
    const hideHotkey = visibilityHotkeys.find(hotkey => hotkey.label === 'Скрыть точки')?.hotkey.code;

    if (keyCode === showHotkey) {
      event.preventDefault();
      onShowClick();
    };
    if (keyCode === hideHotkey) {
      event.preventDefault();
      onHideClick();
    };
  };

  return (
    <ButtonGroupWithLabel label='Шаги'>
      <Button
        color={'primary'}
        onClick={onHideClick}
      >
        <VisibilityOffIcon />
      </Button>
      <Button
        color={hiddenStepsIDs.length ? 'warning' : 'primary'}
        onClick={onShowClick}
      >
        <VisibilityIcon /> 
      </Button>
    </ButtonGroupWithLabel>
  );
};

export default ShowHideDotsButtons;