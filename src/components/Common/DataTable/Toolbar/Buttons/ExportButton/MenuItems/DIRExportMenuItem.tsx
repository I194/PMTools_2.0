import { MenuItem } from '@mui/material';
import { GridExportMenuItemProps } from '@mui/x-data-grid';
import { FC } from 'react';
import { toCSV_DIR, toDIR, toPMM, toXLSX_DIR } from '../../../../../../../utils/files/converters';
import { IDirData } from '../../../../../../../utils/GlobalTypes';

interface DIRExport {
  as: 'dir' | 'pmm' | 'csv' | 'xlsx';
  data: IDirData;
  label?: string;
}

const DIRExportMenuItem: FC<DIRExport> = (
  { as, data, label },
  props: GridExportMenuItemProps<{}>,
) => {
  const { hideMenu } = props;

  const exportAs = {
    dir: {
      export: () => {
        if (!data.created) data.created = new Date().toLocaleString();
        toDIR(data);
      },
      label: 'Export as DIR',
    },
    pmm: {
      export: () => {
        if (!data.created) data.created = new Date().toLocaleString();
        toPMM(data);
      },
      label: 'Export as PMM',
    },
    csv: {
      export: () => {
        if (!data.created) data.created = new Date().toLocaleString();
        toCSV_DIR(data);
      },
      label: 'Export as CSV',
    },
    xlsx: {
      export: () => {
        if (!data.created) data.created = new Date().toLocaleString();
        toXLSX_DIR(data);
      },
      label: 'Export as XLSX',
    },
  };

  return (
    <MenuItem
      onClick={() => {
        exportAs[as].export();
        hideMenu?.();
      }}
    >
      {label ?? exportAs[as].label}
    </MenuItem>
  );
};

export default DIRExportMenuItem;
