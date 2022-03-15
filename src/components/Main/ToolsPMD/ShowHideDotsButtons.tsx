import React, { FC, useEffect, useState } from "react";
import styles from './ToolsPMD.module.scss';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { setHiddenStepsIDs, setSelectedStepsIDs, setStatisticsMode } from "../../../services/reducers/pcaPage";
import { Button } from "@mui/material";
import ButtonGroupWithLabel from "../../Sub/ButtonGroupWithLabel/ButtonGroupWithLabel";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface IShowHideDotsButtons {
  setShowStepsInput: React.Dispatch<React.SetStateAction<boolean>>;
};

const ShowHideDotsButtons: FC<IShowHideDotsButtons> = ({ setShowStepsInput }) => {

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
    console.log(hideSteps, selectedStepsIDs);
    if (hideSteps && selectedStepsIDs && selectedStepsIDs.length) {
      dispatch(setHiddenStepsIDs(selectedStepsIDs));
      setHideSteps(false);
      dispatch(setSelectedStepsIDs(null));
      dispatch(setStatisticsMode(null));
    };
  }, [hideSteps, selectedStepsIDs]);

  console.log('here', selectedStepsIDs);

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