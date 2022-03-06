import React from 'react';
import { ButtonProps } from '@mui/material/Button';
import {
  GridToolbarExportContainer,
  GridCsvExportMenuItem,
  GridCsvExportOptions,
  GridExportMenuItemProps,
} from '@mui/x-data-grid';
import PMDExportMenuItem from './MenuItems/PMDExportMenuItem';
import { IPmdData } from '../../../../../utils/files/fileManipulations';

const ExportPMD = (props: ButtonProps & {data: IPmdData}) => {
  const { data } = props;
  return (
    <GridToolbarExportContainer {...props}>
      <PMDExportMenuItem as={'pmd'} data={data}/>
      <PMDExportMenuItem as={'csv'} data={data}/>
      <PMDExportMenuItem as={'xlsx'} data={data}/>
    </GridToolbarExportContainer>
  );
};

export default ExportPMD;
