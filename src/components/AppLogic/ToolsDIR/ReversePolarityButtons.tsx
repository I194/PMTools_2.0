import React, { FC, useCallback, useEffect, useState } from "react";
import styles from './ToolsDIR.module.scss';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { Button, Tooltip, Typography } from "@mui/material";
import ButtonGroupWithLabel from "../../Sub/Buttons/ButtonGroupWithLabel/ButtonGroupWithLabel";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { 
  setReversedDirectionsIDs,
  addReversedDirectionsIDs,
  setSelectedDirectionsIDs, 
  setStatisticsMode 
} from "../../../services/reducers/dirPage";
import { IDirData } from '../../../utils/GlobalTypes';
import ModalWrapper from "../../Sub/Modal/ModalWrapper";
import InputApply from "../../Sub/InputApply/InputApply";
import parseDotsIndexesInput from "../../../utils/parsers/parseDotsIndexesInput";
import { enteredIndexesToIDsDIR } from "../../../utils/parsers/enteredIndexesToIDs";
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { useTranslation } from "react-i18next";

type Props = {
  data: IDirData;
}

const ReversePolarityButtons = ({ data }: Props) => {

  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation('translation');
  
  const { hotkeys, hotkeysActive } = useAppSelector(state => state.appSettingsReducer);
  const { selectedDirectionsIDs, reversedDirectionsIDs, hiddenDirectionsIDs } = useAppSelector(state => state.dirPageReducer); 

  const [reverseDirs, setReverseDirs] = useState<boolean>(false);
  const [showIndexesInput, setShowIndexesInput] = useState<boolean>(false);

  const onUnreverseClick = () => {
    dispatch(setReversedDirectionsIDs([]));
  };

  const onReverseClick = () => {
    setReverseDirs(true);
  };

  // const [showHotkey, setShowHotkey] = useState<{key: string, code: string}>({key: 'S', code: 'KeyS'});
  // const [hideHotkey, setHideHotkey] = useState<{key: string, code: string}>({key: 'H', code: 'KeyH'});
  const [reverseHotkey, setReverseHotkey] = useState<{key: string, code: string}>({key: 'R', code: 'KeyR'});
  const [unreverseHotkey, setUnreverseHotkey] = useState<{key: string, code: string}>({key: 'T', code: 'KeyT'});

  useEffect(() => {
    const visibilityHotkeys = hotkeys.find(block => block.title === 'Обращение полярности')?.hotkeys;
    if (visibilityHotkeys) {
      setUnreverseHotkey(visibilityHotkeys.find(hotkey => hotkey.label === 'Прямая полярность')!.hotkey);
      setReverseHotkey(visibilityHotkeys.find(hotkey => hotkey.label === 'Обратная полярность')!.hotkey);
    };
  }, [hotkeys]);

  useEffect(() => {
    if ((!selectedDirectionsIDs || !selectedDirectionsIDs.length) && reverseDirs) {
      setShowIndexesInput(true);
    }
    if (reverseDirs && selectedDirectionsIDs && selectedDirectionsIDs.length) {
      console.log(selectedDirectionsIDs)
      dispatch(addReversedDirectionsIDs(selectedDirectionsIDs));
      setReverseDirs(false);
      dispatch(setSelectedDirectionsIDs(null));
      dispatch(setStatisticsMode(null));
    };
  }, [reverseDirs, selectedDirectionsIDs]);

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

    if (keyCode === reverseHotkey.code) {
      event.preventDefault();
      onReverseClick();
    };
    if (keyCode === unreverseHotkey.code) {
      event.preventDefault();
      onUnreverseClick();
    };
  };

  const handleEnteredDotsIndexesApply = (indexes: string) => {
    const parsedIndexes = parseDotsIndexesInput(indexes || `1-${data?.interpretations.length}`);
    const IDs = enteredIndexesToIDsDIR(parsedIndexes, hiddenDirectionsIDs, data!);
    dispatch(setSelectedDirectionsIDs(IDs));
    setShowIndexesInput(false);
  };

  return (
    <>
      <ButtonGroupWithLabel label={t('dirPage.tools.reverse.title')}>
        <Tooltip
          title={<Typography variant='body1'>{reverseHotkey.key}</Typography>}
          enterDelay={1000}
          arrow
        >
          <Button
            color={'primary'}
            onClick={onReverseClick}
          >
            <SwapVertRoundedIcon />
          </Button>
        </Tooltip>
        <Tooltip
          title={<Typography variant='body1'>{unreverseHotkey.key}</Typography>}
          enterDelay={1000}
          arrow
        >
          <Button
            color={reversedDirectionsIDs.length ? 'warning' : 'primary'}
            onClick={onUnreverseClick}
          >
            <SettingsBackupRestoreIcon /> 
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
          onClose={() => {setReverseDirs(false)}}
          isDraggable={true}
        >
          <InputApply 
            label={`${t('inputDirs.label')} (reverse dirs)`}
            helperText={`${t('inputDirs.helper')} 1-9 || 2,4,8,9 || 2-4;8,9 || 2-4;8,9;12-14`}
            onApply={handleEnteredDotsIndexesApply}
            placeholder={`1-${data.interpretations.length}`}
          />
        </ModalWrapper>
      }
    </>
  );
};

export default ReversePolarityButtons;