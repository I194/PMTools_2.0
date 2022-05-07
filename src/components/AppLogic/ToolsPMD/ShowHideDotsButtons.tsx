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
  const { hiddenStepsIDs, selectedStepsIDs } = useAppSelector(state => state.pcaPageReducer); 
  const [hideSteps, setHideSteps] = useState<boolean>(false);

  const onShowClick = () => {
    dispatch(setHiddenStepsIDs([]));
  };

  const onHideClick = () => {
    if (!selectedStepsIDs || !selectedStepsIDs.length) {
      setShowStepsInput(true);
    };
    setHideSteps(true);
  };

  useEffect(() => {
    if (hideSteps && selectedStepsIDs && selectedStepsIDs.length) {
      dispatch(addHiddenStepsIDs(selectedStepsIDs));
      dispatch(setSelectedStepsIDs(null));
      dispatch(setStatisticsMode(null));
      setHideSteps(false);
    };
  }, [hideSteps, selectedStepsIDs]);

  useEffect(() => {
    if (showStepsInput) window.removeEventListener("keydown", handleShowHideClick);
    else window.addEventListener("keydown", handleShowHideClick);
    return () => {
      window.removeEventListener("keydown", handleShowHideClick);
    };
  }, [showStepsInput]);

  const handleShowHideClick = useCallback((e) => {
    const key = (e.code as string);
    if (key === 'KeyS') {
      e.preventDefault();
      onShowClick();
    };
    if (key === 'KeyH') {
      e.preventDefault();
      onHideClick();
    };
  }, []);

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