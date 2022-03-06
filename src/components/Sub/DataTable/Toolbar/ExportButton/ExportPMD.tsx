import React from 'react';
import { ButtonProps } from '@mui/material/Button';
import {
  GridToolbarExportContainer,
  GridCsvExportMenuItem,
  GridCsvExportOptions,
  GridExportMenuItemProps,
} from '@mui/x-data-grid';
import PMDExportMenuItem from './MenuItems/PMDExportMenuItem';

const ExportPMD = (props: ButtonProps) => {
  return (
    <GridToolbarExportContainer {...props}>
      <PMDExportMenuItem as={'pmd'}/>
      <PMDExportMenuItem as={'csv'}/>
      <PMDExportMenuItem as={'xlsx'}/>
    </GridToolbarExportContainer>
  );
};

export default ExportPMD;
