import React from 'react';
import { ButtonProps } from '@mui/material/Button';
import {
  GridToolbarExportContainer,
} from '@mui/x-data-grid';
import { IVGPData } from '../../../../../../utils/GlobalTypes'; 
import VGPExportMenuItem from './MenuItems/VGPExportMenuItem';

const ExportVGP = (props: ButtonProps & {data: IVGPData}) => {
  const { data } = props;
  return (
    <GridToolbarExportContainer {...props}>
      <VGPExportMenuItem as={'csv'} data={data}/>
      <VGPExportMenuItem as={'xlsx'} data={data}/>
    </GridToolbarExportContainer>
  );
};

export default ExportVGP;
