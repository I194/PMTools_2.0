import { 
  GridToolbarContainer, 
  GridToolbarColumnsButton, 
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";

import { Typography } from "@mui/material";

const PMDStatisticsDataTableToolbar = () => {
  return (
    <GridToolbarContainer>
      <Typography>Statistics results</Typography>
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
    </GridToolbarContainer>
  );
};

export default PMDStatisticsDataTableToolbar;
