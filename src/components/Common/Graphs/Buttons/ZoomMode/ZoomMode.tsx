import React, { FC } from 'react';
import styles from './ZoomMode.module.scss';
import Button from '@mui/material/Button';

interface IResetZoomPan {
  onClick: () => void;
  isUseful: boolean;
}

const ZoomMode: FC<IResetZoomPan> = ({ onClick, isUseful }) => {
  return (
    <div className={styles.projectionSelect}>
      <Button
        color={isUseful ? 'warning' : 'primary'}
        onClick={onClick}
        variant='outlined'
        sx={{m: '4px', height: '24px'}} 
        size='small'
      >
        Zoom&pan mode
      </Button>
    </div>
  )
};

export default ZoomMode;
