import { Button } from '@mui/material';
import React, { FC } from 'react';
import { setStatisticsMode } from '../../../services/reducers/pcaPage';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { StatisticsModePCA } from '../../../utils/graphs/types';

interface IStatModeButton {
  mode: StatisticsModePCA;
};

const StatModeButton: FC<IStatModeButton> = ({mode}) => {

  const dispatch = useAppDispatch();
  const { statisticsMode } = useAppSelector(state => state.pcaPageReducer); 

  const onStatisticsModeClick = (mode: StatisticsModePCA) => {
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
