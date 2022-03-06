import { MenuItem } from '@mui/material';
import {
  GridExportMenuItemProps,
} from '@mui/x-data-grid';
import { FC } from 'react';
import { toCSV_DIR, toDIR, toPMM, toXLSX_DIR } from '../../../../../../utils/files/converters';
import { IDirData } from '../../../../../../utils/files/fileManipulations';

interface DIRExport {
  as: 'dir' | 'pmm' | 'csv' | 'xlsx';
  data: IDirData;
};

const DIRExportMenuItem: FC<DIRExport> = ({as, data}, props: GridExportMenuItemProps<{}>) => {

  const { hideMenu } = props;
  const blankFile = new File([], '');

  const exportAs = {
    dir: {export: () => toDIR(blankFile, data), label: 'Export as DIR'},
    pmm: {export: () => toPMM(blankFile, data), label: 'Export as PMM'},
    csv: {export: () => toCSV_DIR(blankFile, data), label: 'Export as CSV'},
    xlsx: {export: () => toXLSX_DIR(blankFile, data), label: 'Export as XLSX'}
  };

  return (
    <MenuItem
      onClick={() => {
        exportAs[as].export();
        hideMenu?.();
      }}
    >
      {exportAs[as].label}
    </MenuItem>
  );
};

export default DIRExportMenuItem;
