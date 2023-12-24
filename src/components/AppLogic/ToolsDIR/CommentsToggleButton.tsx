import React, { FC } from 'react';
import Button from '@mui/material/Button';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { toggleCommentsInput } from '../../../services/reducers/dirPage';

const CommentsToggleButton: FC = () => {
  const dispatch = useAppDispatch();
  const { isCommentsInputVisible } = useAppSelector(state => state.dirPageReducer);

  const handleClick = () => {
    dispatch(toggleCommentsInput());
  };

  return (
    <Button
      color={isCommentsInputVisible ? 'warning' : 'primary'}
      onClick={handleClick}
      variant='outlined'
      sx={{
        borderRadius: '16px',
        fontWeight: isCommentsInputVisible ? 600 : 400,
      }} 
    >
      Comments Input
    </Button>
  )
};

export default CommentsToggleButton;
