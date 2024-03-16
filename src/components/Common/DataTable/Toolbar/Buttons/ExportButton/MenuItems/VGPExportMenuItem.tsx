import { MenuItem } from '@mui/material';
import {
  GridExportMenuItemProps
} from '@mui/x-data-grid';
import { FC } from 'react';
import { toCSV_VGP, toGPML, toVGP, toXLSX_VGP } from '../../../../../../../utils/files/converters/vgp';
import { IDirData, IVGPData } from '../../../../../../../utils/GlobalTypes'; 

interface DIRExport {
  as: 'vgp' | 'gpml' | 'csv' | 'xlsx';
  data: IVGPData;
};

const DIRExportMenuItem: FC<DIRExport> = ({as, data}, props: GridExportMenuItemProps<{}>) => {

  const { hideMenu } = props;

  const exportAs = {
    vgp: {
      export: () => {
        if (!data.created) data.created = new Date().toLocaleString();
        toVGP(data)
      }, 
      label: 'Export as VGP'
    },
    gpml: {
      export: () => {
        if (!data.created) data.created = new Date().toLocaleString();
        toGPML(data)
      }, 
      label: 'Export as GPML'
    },
    csv: {
      export: () => {
        if (!data.created) data.created = new Date().toLocaleString();
        toCSV_VGP(data)
      }, 
      label: 'Export as CSV'
    },
    xlsx: {
      export: () => {
        if (!data.created) data.created = new Date().toLocaleString();
        toXLSX_VGP(data)
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
