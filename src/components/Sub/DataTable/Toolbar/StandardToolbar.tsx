import { GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import ExportPMD from './ExportButton/ExportPMD';

const StandardToolbar = () => {
  return (
    <GridToolbarContainer>
      <ExportPMD />
    </GridToolbarContainer>
  );
};

export default StandardToolbar;
