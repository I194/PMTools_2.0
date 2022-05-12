import { Button } from "@mui/material";
import React from "react";
import styles from './PMTests.module.scss';

type Props = {
  isRunning: boolean;
  setIsRunning: (isRunning: boolean) => void;
  startLabel?: string;
  runningLabel?: string;
  submit?: boolean;
}

const TestControls = ({ 
  isRunning, 
  setIsRunning, 
  startLabel = 'Запустить тест', 
  runningLabel = 'Тест запущен, производится моделирование...',
  submit,
}: Props) => {
  return (
    <div className={styles.controls}>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => setIsRunning(true)} 
        disabled={isRunning}
        type={submit ? 'submit' : 'button'}
        sx={{
          width: 'fit-content',
          textTransform: 'none',
        }}
      >
        { isRunning ? runningLabel : startLabel }
      </Button>
    </div>
  );
};

export default TestControls;

