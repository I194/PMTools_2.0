import React, { FC, useCallback, useEffect, useState } from "react";
import styles from './ToolsDIR.module.scss';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { Button } from "@mui/material";
import ButtonGroupWithLabel from "../../Sub/Buttons/ButtonGroupWithLabel/ButtonGroupWithLabel";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { addHiddenDirectionsIDs, sethiddenDirectionsIDs, setSelectedDirectionsIDs, setStatisticsMode } from "../../../services/reducers/dirPage";

interface IShowHideDotsButtons {
  setShowIndexesInput: React.Dispatch<React.SetStateAction<boolean>>;
  showIndexesInput: boolean;
};

const ShowHideDotsButtons: FC<IShowHideDotsButtons> = ({ setShowIndexesInput, showIndexesInput }) => {

  const dispatch = useAppDispatch();
  
  const { hotkeys, hotkeysActive } = useAppSelector(state => state.appSettingsReducer);
  const { selectedDirectionsIDs, hiddenDirectionsIDs } = useAppSelector(state => state.dirPageReducer); 

  const [hideDirs, setHideDirs] = useState<boolean>(false);

  const onShowClick = () => {
    dispatch(sethiddenDirectionsIDs([]));
  };

  const onHideClick = () => {
    setHideDirs(true);
  };

  useEffect(() => {
    if ((!selectedDirectionsIDs || !selectedDirectionsIDs.length) && hideDirs) {
      setShowIndexesInput(true);
    }
    if (hideDirs && selectedDirectionsIDs && selectedDirectionsIDs.length) {
      console.log(selectedDirectionsIDs)
      dispatch(addHiddenDirectionsIDs(selectedDirectionsIDs));
      setHideDirs(false);
      dispatch(setSelectedDirectionsIDs(null));
      dispatch(setStatisticsMode(null));
    };
  }, [hideDirs, selectedDirectionsIDs]);

  useEffect(() => {
    console.log('what', hotkeysActive)
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
    <ButtonGroupWithLabel label='Направления'>
      <Button
        color={'primary'}
        onClick={onHideClick}
      >
        <VisibilityOffIcon />
      </Button>
      <Button
        color={hiddenDirectionsIDs.length ? 'warning' : 'primary'}
        onClick={onShowClick}
      >
        <VisibilityIcon /> 
      </Button>
    </ButtonGroupWithLabel>
  );
};

export default ShowHideDotsButtons;