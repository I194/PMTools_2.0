import React from 'react';
import { ButtonProps } from '@mui/material/Button';
import { GridToolbarExportContainer } from '@mui/x-data-grid';
import { IDirData } from '../../../../../../utils/GlobalTypes';
import DIRExportMenuItem from './MenuItems/DIRExportMenuItem';

type ExportDIRFromDIRProps = ButtonProps & {
  data: IDirData;
  /**
   * Directions rotated so the Fisher mean sits at the stereonet centre (with
   * CUT95 markers when the cutoff is active). When provided, "Export centered"
   * menu items are shown alongside the regular ones.
   */
  centeredData?: IDirData | null;
};

const ExportDIRFromDIR = (props: ExportDIRFromDIRProps) => {
  const { data, centeredData, ...containerProps } = props;
  return (
    <GridToolbarExportContainer {...containerProps}>
      {/* <DIRExportMenuItem as={'dir'} data={data}/> */}
      <DIRExportMenuItem as={'pmm'} data={data} />
      <DIRExportMenuItem as={'csv'} data={data} />
      <DIRExportMenuItem as={'xlsx'} data={data} />
      {centeredData && [
        <DIRExportMenuItem
          key="centered-pmm"
          as={'pmm'}
          data={centeredData}
          label="Export centered as PMM"
        />,
        <DIRExportMenuItem
          key="centered-csv"
          as={'csv'}
          data={centeredData}
          label="Export centered as CSV"
        />,
        <DIRExportMenuItem
          key="centered-xlsx"
          as={'xlsx'}
          data={centeredData}
          label="Export centered as XLSX"
        />,
      ]}
    </GridToolbarExportContainer>
  );
};

export default ExportDIRFromDIR;
