import React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

const DotTooltip = styled(
  ({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
  )
)(
  ({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: 'black',
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: 'black',
      color: 'white'
    },
  })
);

export default DotTooltip;