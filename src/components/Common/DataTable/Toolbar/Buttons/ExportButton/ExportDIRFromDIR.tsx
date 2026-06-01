import React from 'react';
import { ButtonProps } from '@mui/material/Button';
import { GridToolbarExportContainer } from '@mui/x-data-grid';
import { IDirData } from '../../../../../../utils/GlobalTypes';
import DIRExportMenuItem from './MenuItems/DIRExportMenuItem';

type ExportDIRFromDIRProps = ButtonProps & {
  data: IDirData;
  /**
   * Every direction including the ones hidden on the graph, with CUT45 markers
   * on directions the cutoff rejects. When provided, "Export with hidden" menu
   * items are shown alongside the regular ones.
   */
  withHiddenData?: IDirData | null;
};

const ExportDIRFromDIR = (props: ExportDIRFromDIRProps) => {
  const { data, withHiddenData, ...containerProps } = props;
  return (
    <GridToolbarExportContainer {...containerProps}>
      {/* <DIRExportMenuItem as={'dir'} data={data}/> */}
      <DIRExportMenuItem as={'pmm'} data={data} />
      <DIRExportMenuItem as={'csv'} data={data} />
      <DIRExportMenuItem as={'xlsx'} data={data} />
      {withHiddenData && [
        <DIRExportMenuItem
          key="with-hidden-pmm"
          as={'pmm'}
          data={withHiddenData}
          label="Export with hidden as PMM"
        />,
        <DIRExportMenuItem
          key="with-hidden-csv"
          as={'csv'}
          data={withHiddenData}
          label="Export with hidden as CSV"
        />,
        <DIRExportMenuItem
          key="with-hidden-xlsx"
          as={'xlsx'}
          data={withHiddenData}
          label="Export with hidden as XLSX"
        />,
      ]}
    </GridToolbarExportContainer>
  );
};

export default ExportDIRFromDIR;
