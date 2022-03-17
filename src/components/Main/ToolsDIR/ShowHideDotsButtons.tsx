import React, { FC, useEffect, useState } from "react";
import styles from './ToolsDIR.module.scss';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { addHiddenStepsIDs, setHiddenStepsIDs, setSelectedStepsIDs, setStatisticsMode } from "../../../services/reducers/pcaPage";
import { Button } from "@mui/material";
import ButtonGroupWithLabel from "../../Sub/ButtonGroupWithLabel/ButtonGroupWithLabel";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IDirData } from "../../../utils/GlobalTypes";

interface IShowHideDotsButtons {
  setShowStepsInput: React.Dispatch<React.SetStateAction<boolean>>;
  dirData: IDirData;
};

const ShowHideDotsButtons: FC<IShowHideDotsButtons> = ({ setShowStepsInput, dirData }) => {

  const dispatch = useAppDispatch();
  const { selectedDirectionsIDs, hiddenDirectionsIDs } = useAppSelector(state => state.dirPageReducer); 
  const [hideDirs, setHideDirs] = useState<boolean>(false);

  const onShowClick = () => {
    dispatch(setHiddenStepsIDs([]));
  };

  const onHideClick = () => {
    if (!selectedDirectionsIDs || !selectedDirectionsIDs.length) {
      setShowStepsInput(true);
    };
    setHideDirs(true);
  };

  useEffect(() => {
    if (hideDirs && selectedDirectionsIDs && selectedDirectionsIDs.length) {
      dispatch(addHiddenStepsIDs(selectedDirectionsIDs));
      setHideDirs(false);
      dispatch(setSelectedStepsIDs(null));
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