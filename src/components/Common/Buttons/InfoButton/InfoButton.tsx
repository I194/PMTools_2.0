import React, { FC, useMemo, useState } from 'react';
import style from './InfoButton.module.scss';
import IconButton from '@mui/material/IconButton';
import HelpCenterOutlinedIcon from '@mui/icons-material/HelpCenterOutlined';
import { Popover, Typography } from '@mui/material';
import { ContentType, GraphType } from '../../../../utils/GlobalTypes';
import { useTheme } from '@mui/material/styles';
import { primaryColor } from '../../../../utils/ThemeConstants';
import { useTranslation } from 'react-i18next';

const InfoDivider = () => {
  const theme = useTheme();
  return (
    <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div 
        style={{
          width: '90%', 
          height: '2px', 
          backgroundColor: primaryColor(theme.palette.mode),
          margin: '7px 0 0 0',
          boxSizing: 'border-box',
          borderRadius: '42px'
        }}
      />
    </div>
  )
}

type Props = {
  contentType: ContentType;
  position?: {
    right?: number;
    top?: number;
  }
}

const InfoButton = ({ contentType, position }: Props) => {

  const { t, i18n } = useTranslation('translation');
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const content = useMemo(() => {
    switch (contentType) {
      case 'zijd':
        return (
          <>
            <Typography variant='h6'>{t('graphsInfo.zijd.zoomPan.title')}</Typography>
            <Typography variant='body2'>{t('graphsInfo.zijd.zoomPan.line1')}</Typography>
            <Typography variant='body1'>{t('graphsInfo.zijd.zoomPan.line2')}</Typography>
            <ul>
              <li><Typography variant='body2'>{t('graphsInfo.zijd.zoomPan.line3')}</Typography></li>
              <li><Typography variant='body2'>{t('graphsInfo.zijd.zoomPan.line4')}<code>'Alt'</code> + <code>'Arrow button'</code></Typography></li>
              <li><Typography variant='body2'>{t('graphsInfo.zijd.zoomPan.line5')}<code>RESET ZOOM&PAN</code></Typography></li>
              <li><Typography variant='body2'>{t('graphsInfo.zijd.zoomPan.line6')}</Typography></li>
            </ul>
            <Typography variant='body1'>{t('graphsInfo.zijd.zoomPan.line7')}</Typography>
            <ul>
              <li><Typography variant='body2'>{t('graphsInfo.zijd.zoomPan.line8')}</Typography></li>
              <li><Typography variant='body2'>{t('graphsInfo.zijd.zoomPan.line9')}<code>'Alt'</code></Typography></li>
            </ul>
            <InfoDivider />
            <Typography variant='h6'>{t('graphsInfo.zijd.selecting.title')}</Typography>
            <Typography variant='body2'>{t('graphsInfo.zijd.selecting.line1')}</Typography>
            <ul>
              <li><Typography variant='body2'>{t('graphsInfo.zijd.selecting.line2')}</Typography></li>
              <li><Typography variant='body2'>{t('graphsInfo.zijd.selecting.line3')}</Typography></li>
              <li><Typography variant='body2'>{t('graphsInfo.zijd.selecting.line4')}</Typography></li>
              <li><Typography variant='body2'>{t('graphsInfo.zijd.selecting.line5')}</Typography></li>
            </ul>
            <Typography variant='caption' component="p">{t('graphsInfo.zijd.selecting.line6')}<code>'shift'</code></Typography>
            <Typography variant='caption' component="p">{t('graphsInfo.zijd.selecting.line7')}</Typography>
            <InfoDivider />
            <Typography variant='h6'>{t('graphsInfo.zijd.interactiveLegend.title')}</Typography>
            <Typography variant='body2'>{t('graphsInfo.zijd.interactiveLegend.line1')}</Typography>
            <Typography variant='caption' component="p">{t('graphsInfo.zijd.interactiveLegend.line2')}</Typography>
            <InfoDivider />
            <Typography variant='h6'>{t('graphsInfo.generalAdvice.title')}</Typography>
            <Typography variant='body2'>{t('graphsInfo.generalAdvice.line1')}<code>'Ctrl'</code> + <code>'-'</code></Typography>
          </>
        )
      case 'stereo':
      case 'mag':
      case 'stereoDir':
        return (
          <>
            <Typography variant='h6'>{t('graphsInfo.stereoAndMagAndStereoDir.zoomPan.title')}</Typography>
            <Typography variant='body2'>{t('graphsInfo.stereoAndMagAndStereoDir.zoomPan.line1')}</Typography>
            <Typography variant='body1'>{t('graphsInfo.stereoAndMagAndStereoDir.zoomPan.line2')}</Typography>
            <ul>
              <li><Typography variant='body2'>{t('graphsInfo.stereoAndMagAndStereoDir.zoomPan.line3')}</Typography></li>
              <li><Typography variant='body2'>{t('graphsInfo.stereoAndMagAndStereoDir.zoomPan.line4')}<code>'Alt'</code></Typography></li>
            </ul>
            <InfoDivider />
            <Typography variant='h6'>{t('graphsInfo.stereoAndMagAndStereoDir.selecting.title')}</Typography>
            <Typography variant='body2'>{t('graphsInfo.stereoAndMagAndStereoDir.selecting.line1')}</Typography>
            <ul>
              <li><Typography variant='body2'>{t('graphsInfo.stereoAndMagAndStereoDir.selecting.line2')}</Typography></li>
              <li><Typography variant='body2'>{t('graphsInfo.stereoAndMagAndStereoDir.selecting.line3')}</Typography></li>
              <li><Typography variant='body2'>{t('graphsInfo.stereoAndMagAndStereoDir.selecting.line4')}</Typography></li>
              <li><Typography variant='body2'>{t('graphsInfo.stereoAndMagAndStereoDir.selecting.line5')}</Typography></li>
            </ul>
            <Typography variant='caption' component="p">{t('graphsInfo.stereoAndMagAndStereoDir.selecting.line6')}<code>'shift'</code></Typography>
            <Typography variant='caption' component="p">{t('graphsInfo.stereoAndMagAndStereoDir.selecting.line7')}</Typography>
            <InfoDivider />
            <Typography variant='h6'>{t('graphsInfo.generalAdvice.title')}</Typography>
            <Typography variant='body2'>{t('graphsInfo.generalAdvice.line1')}<code>'Ctrl'</code> + <code>'-'</code></Typography>
          </>
        )
      case 'stereoVGP':
        return (
          <>
            <Typography variant='h6'>{t('graphsInfo.stereoVGP.zoomPan.title')}</Typography>
            <Typography variant='body2'>{t('graphsInfo.stereoVGP.zoomPan.line1')}</Typography>
            <Typography variant='body1'>{t('graphsInfo.stereoVGP.zoomPan.line2')}</Typography>
            <ul>
              <li><Typography variant='body2'>{t('graphsInfo.stereoVGP.zoomPan.line3')}</Typography></li>
              <li><Typography variant='body2'>{t('graphsInfo.stereoVGP.zoomPan.line4')}<code>'Alt'</code></Typography></li>
            </ul>
            <InfoDivider />
            <Typography variant='h6'>{t('graphsInfo.stereoVGP.selecting.title')}</Typography>
            <Typography variant='body2'>{t('graphsInfo.stereoVGP.selecting.line1')}</Typography>
            <ul>
              <li><Typography variant='body2'>{t('graphsInfo.stereoVGP.selecting.line2')}</Typography></li>
              <li><Typography variant='body2'>{t('graphsInfo.stereoVGP.selecting.line3')}</Typography></li>
            </ul>
            <Typography variant='caption' component="p">{t('graphsInfo.stereoVGP.selecting.line3')}<code>'shift'</code></Typography>
            <InfoDivider />
            <Typography variant='h6'>{t('graphsInfo.generalAdvice.title')}</Typography>
            <Typography variant='body2'>{t('graphsInfo.generalAdvice.line1')}<code>'Ctrl'</code> + <code>'-'</code></Typography>
          </>
        )
      case 'statisticsDataTable':
        return (
          <>
            <Typography variant='h6'>{t('tablesInfo.interpretationSetter.title')}</Typography>
            <Typography variant='body2'>{t('tablesInfo.interpretationSetter.line1')}</Typography>
            <ul>
              <li><Typography variant='body2'>{t('tablesInfo.interpretationSetter.line2')}</Typography></li>
              <li><Typography variant='body2'>{t('tablesInfo.interpretationSetter.line3')} <code>'Shift'</code> + <code>'Arrow Up/Down'</code></Typography></li>
            </ul>
            <InfoDivider />
            <Typography variant='h6'>{t('tablesInfo.comments.title')}</Typography>
            <Typography variant='body2'>{t('tablesInfo.comments.line1')}</Typography>
            <ul>
              <li><Typography variant='body2'>{t('tablesInfo.comments.line2')}</Typography></li>
              <li><Typography variant='body2'>{t('tablesInfo.comments.line3')}</Typography></li>
            </ul>
          </>
        )
      default:
        return null;
        break;
    }
  }, [contentType, i18n, t]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  if (!content) return null;

  return (
    <div 
      className={style.container} 
      style={{
        top: `${position?.top}px`,
        right: `${position?.right}px`
      }}
    >
      <IconButton 
        color="primary" 
        component="span"
        onClick={handleClick}
        sx={{p: '4px'}}
      >
        <HelpCenterOutlinedIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            padding: '8px',
            ul: {
              margin: '0',
            },
            maxWidth: '42%'
          }
        }}
      >
        {
          content
        }
      </Popover>
    </div>
  );
};

export default InfoButton;

