import React from "react";
import styles from './VGP.module.scss';
import { Button, TextField, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { textColor, primaryColor } from "../../../utils/ThemeConstants";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../services/store/hooks";
import { useMediaQuery } from "react-responsive";

const VGPMean = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');
  const widthLessThan1400 = useMediaQuery({ query: '(max-width: 1400px)' });
  const { vgpMean } = useAppSelector(state => state.dirPageReducer);

  const onCopy = () => {
    if (!vgpMean) return;
    const {direction, MAD, k, N, R} = vgpMean;
    const [dec, inc] = direction.toArray();
    const plon = dec > 180 ? -(360 - dec).toFixed(2) : dec.toFixed(2);
    const plat = inc.toFixed(2)
    const text = `plon=${plon}; plat=${plat}; a95=${MAD.toFixed(2)}; k=${k!.toFixed(2)}; N=${N!}; R=${R!.toFixed(2)}`;
    navigator.clipboard.writeText(text);
  }

  if (!vgpMean) return null;

  return (
    <>
      <Typography variant='body1' color={textColor(theme.palette.mode)} textAlign="center" fontWeight={600}>
        Mean VGP
      </Typography>
      <Tooltip
        title={<Typography variant='body2'>{t("pmtests.reverseTestResult.tooltip")}</Typography>}
        arrow
        placement="top"
        componentsProps={{
          popper: {
            sx: {
              pb: widthLessThan1400 ? '0' : '12px'
            }
          }
        }}
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
              plat: {vgpMean.direction.inclination.toFixed(2)} {/* inc, from -90 to +90 deg */}
            </Typography>
            <Typography variant='body1' color={textColor(theme.palette.mode)}>
              plon: {
                vgpMean.direction.declination > 180
                  ? -(360 - vgpMean.direction.declination).toFixed(2)
                  : vgpMean.direction.declination.toFixed(2)
              } {/* dec, from 0 to 360 deg, but we need to bind it between -180 to 180 deg */}
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