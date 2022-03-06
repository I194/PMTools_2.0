import { MenuItem } from '@mui/material';
import {
  GridExportMenuItemProps,
} from '@mui/x-data-grid';
import { FC } from 'react';
import { toCSV_DIR, toDIR, toPMM, toXLSX_DIR } from '../../../../../../../utils/files/converters';
import { IDirData } from '../../../../../../../utils/GlobalTypes'; 

interface DIRExport {
  as: 'dir' | 'pmm' | 'csv' | 'xlsx';
  data: IDirData;
};

const DIRExportMenuItem: FC<DIRExport> = ({as, data}, props: GridExportMenuItemProps<{}>) => {

  const { hideMenu } = props;
  const blankFile = new File([], '');

  data.format = as;

  const exportAs = {
    dir: {
      export: () => {
        data.created = new Date().toLocaleString();
        toDIR(blankFile, data)
      }, 
      label: 'Export as DIR'
    },
    pmm: {
      export: () => {
        data.created = new Date().toLocaleString();
        toPMM(blankFile, data)
      }, 
      label: 'Export as PMM'
    },
    csv: {
      export: () => {
        data.created = new Date().toLocaleString();
        toCSV_DIR(blankFile, data)
      }, 
      label: 'Export as CSV'
    },
    xlsx: {
      export: () => {
        data.created = new Date().toLocaleString();
        toXLSX_DIR(blankFile, data)
      }, 
      label: 'Export as XLSX'
    }
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
