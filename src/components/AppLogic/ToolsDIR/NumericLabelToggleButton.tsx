import React, { FC } from 'react';
import Button from '@mui/material/Button';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { toggleLabelMode } from '../../../services/reducers/dirPage';

const NumericLabelToggleButton: FC = () => {
  const dispatch = useAppDispatch();
  const { labelModeIsNumeric } = useAppSelector(state => state.dirPageReducer);

  const handleClick = () => {
    dispatch(toggleLabelMode());
  };

  return (
    <Button
      color={labelModeIsNumeric ? 'warning' : 'primary'}
      onClick={handleClick}
      variant='outlined'
      sx={{
        borderRadius: '16px',
        fontWeight: labelModeIsNumeric ? 600 : 400,
      }} 
    >
      Numeric Label
    </Button>
  )
};

export default NumericLabelToggleButton;


