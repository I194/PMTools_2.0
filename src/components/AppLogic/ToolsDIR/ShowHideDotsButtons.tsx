import React, { FC, useCallback, useEffect, useState } from "react";
import styles from './ToolsDIR.module.scss';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { Button, Tooltip, Typography } from "@mui/material";
import ButtonGroupWithLabel from "../../Sub/Buttons/ButtonGroupWithLabel/ButtonGroupWithLabel";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { 
  addHiddenDirectionsIDs, 
  sethiddenDirectionsIDs, 
  setSelectedDirectionsIDs, 
  setStatisticsMode 
} from "../../../services/reducers/dirPage";
import { IDirData } from '../../../utils/GlobalTypes';
import ModalWrapper from "../../Sub/Modal/ModalWrapper";
import InputApply from "../../Sub/InputApply/InputApply";
import parseDotsIndexesInput from "../../../utils/parsers/parseDotsIndexesInput";
import { enteredIndexesToIDsDIR } from "../../../utils/parsers/enteredIndexesToIDs";

type Props = {
  data: IDirData;
}

const ShowHideDotsButtons = ({ data }: Props) => {

  const dispatch = useAppDispatch();
  
  const { hotkeys, hotkeysActive } = useAppSelector(state => state.appSettingsReducer);
  const { selectedDirectionsIDs, hiddenDirectionsIDs } = useAppSelector(state => state.dirPageReducer); 

  const [hideDirs, setHideDirs] = useState<boolean>(false);
  const [showIndexesInput, setShowIndexesInput] = useState<boolean>(false);

  const onShowClick = () => {
    dispatch(sethiddenDirectionsIDs([]));
  };

  const onHideClick = () => {
    setHideDirs(true);
  };

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

    if (keyCode === showHotkey.code) {
      event.preventDefault();
      onShowClick();
    };
    if (keyCode === hideHotkey.code) {
      event.preventDefault();
      onHideClick();
    };
  };

  const handleEnteredDotsIndexesApply = (steps: string) => {
    const parsedIndexes = parseDotsIndexesInput(steps || `1-${data?.interpretations.length}`);
    const IDs = enteredIndexesToIDsDIR(parsedIndexes, hiddenDirectionsIDs, data!);
    dispatch(setSelectedDirectionsIDs(IDs));
    setShowIndexesInput(false);
  };

  return (
    <>
      <ButtonGroupWithLabel label='Направления'>
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
            color={hiddenDirectionsIDs.length ? 'warning' : 'primary'}
            onClick={onShowClick}
          >
            <VisibilityIcon /> 
          </Button>
        </Tooltip>
      </ButtonGroupWithLabel>
      {
        showIndexesInput && 
        <ModalWrapper
          open={showIndexesInput}
          setOpen={setShowIndexesInput}
          size={{width: '26vw', height: '14vh'}}
          position={{left: '50%', top: '20%'}}
          onClose={() => {setHideDirs(false)}}
          isDraggable={true}
        >
          <InputApply 
            label={`Введите номера точек (hide dirs)`}
            helperText="Валидные примеры: 1-9 || 2,4,8,9 || 2-4;8,9 || 2-4;8,9;12-14"
            onApply={handleEnteredDotsIndexesApply}
            placeholder={`1-${data.interpretations.length}`}
          />
        </ModalWrapper>
      }
    </>
  );
};

export default ShowHideDotsButtons;