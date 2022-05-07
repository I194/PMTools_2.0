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
  const { selectedDirectionsIDs, hiddenDirectionsIDs } = useAppSelector(state => state.dirPageReducer); 
  const [hideDirs, setHideDirs] = useState<boolean>(false);

  const onShowClick = () => {
    dispatch(sethiddenDirectionsIDs([]));
  };

  const onHideClick = () => {
    if (!selectedDirectionsIDs || !selectedDirectionsIDs.length) {
      setShowIndexesInput(true);
    };
    setHideDirs(true);
  };

  useEffect(() => {
    console.log(hideDirs, selectedDirectionsIDs)
    if (hideDirs && selectedDirectionsIDs && selectedDirectionsIDs.length) {
      console.log(selectedDirectionsIDs)
      dispatch(addHiddenDirectionsIDs(selectedDirectionsIDs));
      setHideDirs(false);
      dispatch(setSelectedDirectionsIDs(null));
      dispatch(setStatisticsMode(null));
    };
  }, [hideDirs, selectedDirectionsIDs]);

  useEffect(() => {
    if (showIndexesInput) window.removeEventListener("keydown", handleShowHideClick);
    else window.addEventListener("keydown", handleShowHideClick);
    return () => {
      window.removeEventListener("keydown", handleShowHideClick);
    };
  }, [showIndexesInput]);

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