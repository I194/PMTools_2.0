import React from 'react';
import styles from './DefaultButton.module.scss';
import Button from '@mui/material/Button';

type Props = {
  onClick: () => void;
  isUseful: boolean;
  label: string;
  extraStyle?: React.CSSProperties;
}

const DefaultButton = ({ onClick, isUseful, label, extraStyle }: Props) => {
  console.log('custom zoom', isUseful)
  return (
    <div className={styles.projectionSelect} style={{...extraStyle}}>
      <Button
        color={isUseful ? 'warning' : 'primary'}
        onClick={onClick}
        variant='outlined'
        size='small'
        sx={{m: '4px', height: '24px'}} 
      >
        { label }
      </Button>
    </div>
  )
};

export default DefaultButton;

