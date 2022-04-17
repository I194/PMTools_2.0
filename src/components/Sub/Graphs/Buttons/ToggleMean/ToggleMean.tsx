import React, { FC } from 'react';
import styles from './ToggleMean.module.scss';
import Button from '@mui/material/Button';
import { useAppDispatch, useAppSelector } from '../../../../../services/store/hooks';
import { toggleShowVGPMean } from '../../../../../services/reducers/dirPage';

const ToggleMean: FC = () => {

  const dispatch = useAppDispatch();

  const { showVGPMean } = useAppSelector(state => state.dirPageReducer);

  const handleClick = () => {
    dispatch(toggleShowVGPMean());
  };

  return (
    <div className={styles.container}>
      <Button
        color={showVGPMean ? 'warning' : 'primary'}
        onClick={handleClick}
        variant='outlined'
        sx={{m: '4px', height: '24px'}} 
        size='small'
      >
        Toggle mean
      </Button>
    </div>
  )
};

export default ToggleMean;
