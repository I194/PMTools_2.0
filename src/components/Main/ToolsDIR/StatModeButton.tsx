import { Button } from '@mui/material';
import React, { FC } from 'react';
import { setStatisticsMode } from '../../../services/reducers/dirPage';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { StatisticsModeDIR } from '../../../utils/graphs/types';

interface IStatModeButton {
  mode: StatisticsModeDIR;
};

const StatModeButton: FC<IStatModeButton> = ({mode}) => {

  const dispatch = useAppDispatch();
  const { statisticsMode } = useAppSelector(state => state.pcaPageReducer); 

  const onStatisticsModeClick = (mode: StatisticsModeDIR) => {
    if (statisticsMode === mode) mode = null;
    dispatch(setStatisticsMode(mode));
  };

  return (
    <Button
      color={statisticsMode === mode ? 'secondary' : 'primary'}
      sx={{
        fontWeight: statisticsMode === mode ? 600 : 400
      }}
      onClick={() => onStatisticsModeClick(mode)}
    >
      { mode?.toUpperCase() }
    </Button>
  );
};

export default StatModeButton;
