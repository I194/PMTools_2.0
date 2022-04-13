import React, { FC, useEffect, useState } from "react";
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
  pmdData: IPmdData;
};

const ShowHideDotsButtons: FC<IShowHideDotsButtons> = ({ setShowStepsInput, pmdData }) => {

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
      setHideSteps(false);
      dispatch(setSelectedStepsIDs(null));
      dispatch(setStatisticsMode(null));
    };
  }, [hideSteps, selectedStepsIDs]);

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