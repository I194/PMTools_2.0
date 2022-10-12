import React from "react";
import styles from './VGP.module.scss';
import { Button, TextField, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { textColor, primaryColor } from "../../../utils/ThemeConstants";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../services/store/hooks";

const VGPMean = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');
  const { vgpMean } = useAppSelector(state => state.dirPageReducer);

  const onCopy = () => {
    if (!vgpMean) return;
    const {direction, MAD, k, N, R} = vgpMean;
    const [dec, inc] = direction.toArray();
    const text = `dec=${dec.toFixed(2)}; inc=${inc.toFixed(2)}; a95=${MAD.toFixed(2)}; k=${k!.toFixed(2)}; N=${N!}; R=${R!.toFixed(2)}`;
    navigator.clipboard.writeText(text);
  }

  if (!vgpMean) return null;

  return (
    <>
      <Tooltip
        title={t("pmtests.reverseTestResult.tooltip")}
        arrow
        placement="top"
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
          <div className={styles.col}>
            <Typography variant='body1' color={textColor(theme.palette.mode)}>
              dec: {vgpMean.direction.declination.toFixed(2)}
            </Typography>
            <Typography variant='body1' color={textColor(theme.palette.mode)}>
              inc: {vgpMean.direction.inclination.toFixed(2)}
            </Typography>
          </div>
          <span 
            className={styles.colCenter}
            style={{
              border: `1px dashed ${primaryColor(theme.palette.mode)}!important`,
              borderRadius: '8px!important',
            }}
          >
            <Typography variant='body1' color={textColor(theme.palette.mode)}>
              a95: {vgpMean.MAD.toFixed(2)}
            </Typography>
            <Typography variant='body1' color={textColor(theme.palette.mode)}>
              k: {vgpMean.k!.toFixed(2)}
            </Typography>
          </span>
          <div className={styles.col}>
            <Typography variant='body1' color={textColor(theme.palette.mode)}>
              N: {vgpMean.N!}
            </Typography>
            <Typography variant='body1' color={textColor(theme.palette.mode)}>
              R: {vgpMean.R!.toFixed(2)}
            </Typography>
          </div>
        </Button>
      </Tooltip>
    </>
  );
};


export default VGPMean;