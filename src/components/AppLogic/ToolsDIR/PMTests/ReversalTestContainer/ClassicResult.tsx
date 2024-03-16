import React from "react";
import styles from './ReversalTestContainer.module.scss';
import { Button, TextField, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  textColor,
  primaryColor,
  successColor,
} from '../../../../../utils/ThemeConstants';
import { ReversalTestClassicResult } from "../../../../../utils/GlobalTypes";
import { useTranslation } from "react-i18next";

const ClassicResult = ({ result }: {result: ReversalTestClassicResult}) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');

  const onCopy = () => {
    const text = `γ/γcr=${result.gamma.toFixed(2)}/${result.gammaCritical.toFixed(2)}`;
    navigator.clipboard.writeText(text);
  }

  return (
    <>
      <Typography variant='body1' color={textColor(theme.palette.mode)}>
        {t("pmtests.reverseTestResult.title")}
      </Typography>
      <Tooltip
        title={t("pmtests.reverseTestResult.tooltip")}
        arrow
        placement="right"
      >
        <Button 
          className={styles.copyResult}
          sx={{
            textDecoration: 'none',
            textTransform: 'none',
            border: `1px dashed ${primaryColor(theme.palette.mode)}!important`,
            borderRadius: '8px!important',
          }}
          onClick={onCopy}
        >
          <Typography variant='body1' color={textColor(theme.palette.mode)}>
            γ: {result.gamma.toFixed(2)}
          </Typography>
          <Typography variant='body1' color={textColor(theme.palette.mode)}>
            γ critical: {result.gammaCritical.toFixed(2)}
          </Typography>
          <Typography variant='body1' color={textColor(theme.palette.mode)}>
            Class: {result.classification}
          </Typography>
        </Button>
      </Tooltip>
    </>
  );
};


export default ClassicResult;