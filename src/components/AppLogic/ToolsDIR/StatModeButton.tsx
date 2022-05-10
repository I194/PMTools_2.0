import { Button, Tooltip, Typography } from '@mui/material';
import React, { FC } from 'react';
import { setStatisticsMode } from '../../../services/reducers/dirPage';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { StatisticsModeDIR } from '../../../utils/graphs/types';

interface IStatModeButton {
  mode: StatisticsModeDIR;
  hotkey: string;
};

const StatModeButton: FC<IStatModeButton> = ({ mode, hotkey }) => {

  const dispatch = useAppDispatch();
  const { statisticsMode } = useAppSelector(state => state.dirPageReducer); 

  const onStatisticsModeClick = (mode: StatisticsModeDIR) => {
    if (statisticsMode === mode) mode = null;
    dispatch(setStatisticsMode(mode));
  };

  return (
    <Tooltip 
      title={<Typography variant='body1'>{hotkey}</Typography>}
      enterDelay={1000}
      arrow
    >
      <Button
        color={statisticsMode === mode ? 'secondary' : 'primary'}
        sx={{
          fontWeight: statisticsMode === mode ? 600 : 400
        }}
        onClick={() => onStatisticsModeClick(mode)}
      >
        { mode?.toUpperCase() }
      </Button>
    </Tooltip>
  );
};

export default StatModeButton;
