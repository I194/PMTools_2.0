import React from 'react';
import { ButtonProps } from '@mui/material/Button';
import {
  GridToolbarExportContainer,
  GridCsvExportMenuItem,
  GridCsvExportOptions,
} from '@mui/x-data-grid';
import PMDExportMenuItem from './MenuItems/PMDExportMenuItem';

const ExportPMD = (props: ButtonProps) => {

  const csvOptions: GridCsvExportOptions = { delimiter: ';' };

  return (
    <GridToolbarExportContainer {...props}>
      <GridCsvExportMenuItem options={csvOptions} />
      <PMDExportMenuItem />
    </GridToolbarExportContainer>
  );
};

export default ExportPMD;
