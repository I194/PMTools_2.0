import React from 'react';
import { ButtonProps } from '@mui/material/Button';
import {
  GridToolbarExportContainer,
  GridCsvExportMenuItem,
  GridCsvExportOptions,
  GridExportMenuItemProps,
} from '@mui/x-data-grid';
import PMDExportMenuItem from './MenuItems/PMDExportMenuItem';
import { IDirData } from '../../../../../../utils/GlobalTypes'; 
import DIRExportMenuItem from './MenuItems/DIRExportMenuItem';

const ExportDIR = (props: ButtonProps & {data: IDirData}) => {
  const { data } = props;
  return (
    <GridToolbarExportContainer {...props}>
      {/* <DIRExportMenuItem as={'dir'} data={data}/> */}
      <DIRExportMenuItem as={'pmm'} data={data}/>
      <DIRExportMenuItem as={'csv'} data={data} />
      <DIRExportMenuItem as={'xlsx'} data={data} />
    </GridToolbarExportContainer>
  );
};

export default ExportDIR;
