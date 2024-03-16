import React, { FC } from 'react';
import styles from './CenterByMean.module.scss';
import Button from '@mui/material/Button';

interface ICenterByMean {
  onClick: () => void;
  isUseful?: boolean;
}

const CenterByMean: FC<ICenterByMean> = ({ onClick, isUseful }) => {
  return (
    <div className={styles.centerByMean}>
      <Button
        color={isUseful ? 'warning' : 'primary'}
        onClick={onClick}
        variant='outlined'
        sx={{m: '4px', height: '24px'}} 
        size='small'
      >
        Center by mean
      </Button>
    </div>
  )
};

export default CenterByMean;
