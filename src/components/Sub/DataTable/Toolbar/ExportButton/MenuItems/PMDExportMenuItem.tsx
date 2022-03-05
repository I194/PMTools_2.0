import { MenuItem } from '@mui/material';
import {
  GridExportMenuItemProps,
} from '@mui/x-data-grid';
import { useAppSelector } from '../../../../../../services/store/hooks';
import { toPMD } from '../../../../../../utils/files/converters';

const PMDExportMenuItem = (props: GridExportMenuItemProps<{}>) => {

  const files = useAppSelector(state => state.filesReducer.treatmentFiles);

  const { hideMenu } = props;

  return (
    <MenuItem
      onClick={() => {
        if (files) toPMD(files[0])
        hideMenu?.();
      }}
    >
      Export PMD
    </MenuItem>
  );
};

export default PMDExportMenuItem;
