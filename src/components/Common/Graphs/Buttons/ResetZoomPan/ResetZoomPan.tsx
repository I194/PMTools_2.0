import React, { FC } from 'react';
import styles from './ResetZoomPan.module.scss';
import Button from '@mui/material/Button';

interface IResetZoomPan {
  onClick: () => void;
  isUseful: boolean;
}

const ResetZoomPan: FC<IResetZoomPan> = ({ onClick, isUseful }) => {
  return (
    <div className={styles.resetZoomPan}>
      <Button
        color={isUseful ? 'warning' : 'primary'}
        onClick={onClick}
        variant='outlined'
        sx={{m: '4px', height: '24px'}} 
        size='small'
      >
        Reset zoom&pan
      </Button>
    </div>
  )
};

export default ResetZoomPan;
