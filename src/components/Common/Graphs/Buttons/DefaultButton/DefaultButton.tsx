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
  return (
    <div className={styles.toDefault} style={{...extraStyle}}>
      <Button
        color={isUseful ? 'warning' : 'primary'}
        onClick={onClick}
        variant='outlined'
        size='small'
        sx={{
          m: '4px', 
          height: '24px', 
          borderRadius: '16px', 
          fontWeight: isUseful ? 600 : 400,
        }} 
      >
        { label }
      </Button>
    </div>
  )
};

export default DefaultButton;

