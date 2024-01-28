import { GridCellModesModel } from "@mui/x-data-grid";
import { useCallback, useState } from "react";

export const useCellModesModel = () => {
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});

  const handleCellModesModelChange = useCallback((model: GridCellModesModel) => {
    setCellModesModel(model);
  }, []);

  return {cellModesModel, handleCellModesModelChange, setCellModesModel};
}