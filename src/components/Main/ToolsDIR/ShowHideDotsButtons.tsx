import React, { FC, useEffect, useState } from "react";
import styles from './ToolsDIR.module.scss';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { Button } from "@mui/material";
import ButtonGroupWithLabel from "../../Sub/Buttons/ButtonGroupWithLabel/ButtonGroupWithLabel";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IDirData } from "../../../utils/GlobalTypes";
import { addHiddenDirectionsIDs, sethiddenDirectionsIDs, setSelectedDirectionsIDs, setStatisticsMode } from "../../../services/reducers/dirPage";

interface IShowHideDotsButtons {
  setShowStepsInput: React.Dispatch<React.SetStateAction<boolean>>;
  dirData: IDirData;
};

const ShowHideDotsButtons: FC<IShowHideDotsButtons> = ({ setShowStepsInput, dirData }) => {

  const dispatch = useAppDispatch();
  const { selectedDirectionsIDs, hiddenDirectionsIDs } = useAppSelector(state => state.dirPageReducer); 
  const [hideDirs, setHideDirs] = useState<boolean>(false);

  const onShowClick = () => {
    dispatch(sethiddenDirectionsIDs([]));
  };

  const onHideClick = () => {
    if (!selectedDirectionsIDs || !selectedDirectionsIDs.length) {
      setShowStepsInput(true);
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