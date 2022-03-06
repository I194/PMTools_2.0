import { MenuItem } from '@mui/material';
import {
  GridExportMenuItemProps,
} from '@mui/x-data-grid';
import { useAppSelector } from '../../../../../../services/store/hooks';
import { toCSV_PMD, toPMD, toXLSX_PMD } from '../../../../../../utils/files/converters';

type PMDExportProps = GridExportMenuItemProps<{}> & {as: 'pmd' | 'csv' | 'xlsx'}

const PMDExportMenuItem = (props: PMDExportProps) => {

  const files = useAppSelector(state => state.filesReducer.treatmentFiles);

  const { hideMenu, as } = props;

  if (!files) return null;

  const exportAs = {
    pmd: {export: () => toPMD(files[0]), label: 'Export as PMD'},
    csv: {export: () => toCSV_PMD(files[0]), label: 'Export as CSV'},
    xlsx: {export: () => toXLSX_PMD(files[0]), label: 'Export as XLSX'}
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

export default PMDExportMenuItem;
