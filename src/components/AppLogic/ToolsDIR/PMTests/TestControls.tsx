import { Button } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
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
  startLabel, 
  runningLabel,
  submit,
}: Props) => {
  const { t, i18n } = useTranslation('translation');

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
        { 
          isRunning 
            ? runningLabel || t("pmtests.controls.running")
            : startLabel || t("pmtests.controls.run")
        }
      </Button>
    </div>
  );
};

export default TestControls;

