import React from "react";
import { Button, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  textColor,
  primaryColor,
  successColor,
} from '../../../../../utils/ThemeConstants';
import { ReversalTestClassicResult } from "../../../../../utils/GlobalTypes";

const ClassicResult = ({ result }: {result: ReversalTestClassicResult}) => {
  const theme = useTheme();

  return (
    <>
      <Typography variant='body1' color={textColor(theme.palette.mode)}>
        Классический тест обращения [McFadden and McElhinny, 1990]
      </Typography>
      <Typography variant='body1' color={textColor(theme.palette.mode)}>
        γ: {result.gamma.toFixed(2)}
      </Typography>
      <Typography variant='body1' color={textColor(theme.palette.mode)}>
        γ critical: {result.gammaCritical.toFixed(2)}
      </Typography>
      <Typography variant='body1' color={textColor(theme.palette.mode)}>
        Class: {result.classification}
      </Typography>
    </>
  );
};


export default ClassicResult;