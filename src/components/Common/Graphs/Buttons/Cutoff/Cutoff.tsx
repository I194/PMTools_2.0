import React, { FC } from 'react';
import styles from './Cutoff.module.scss';
import { Button, ButtonGroup } from '@mui/material';

type Props = {
  onToggle: () => void;
  onToggleBorderVisibility: () => void;
  onToggleOuterDotsVisibility: () => void;
  isUseful?: boolean;
  isUsefulBorder?: boolean;
  isUsefulDots?: boolean;
}

const Cutoff = ({ 
  onToggle, onToggleBorderVisibility, onToggleOuterDotsVisibility, 
  isUseful, isUsefulBorder, isUsefulDots 
}: Props) => {
  return (
    <div className={styles.centerByMean}>
      <ButtonGroup variant='outlined' size='small' sx={{height: 24, mt: '4px'}}>
        <Button
          color={isUseful ? 'warning' : 'primary'}
          onClick={onToggle}
        >
          Cutoff 45
        </Button>
        <Button
          color={isUsefulBorder ? 'warning' : 'primary'}
          onClick={onToggleBorderVisibility}
          disabled={!isUseful}
        >
          Border
        </Button>
        <Button
          color={isUsefulDots ? 'warning' : 'primary'}
          onClick={onToggleOuterDotsVisibility}
          disabled={!isUseful}
        >
          Outer dots
        </Button>
      </ButtonGroup>
    </div>
  )
};

export default Cutoff;
