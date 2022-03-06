import { 
  GridToolbarContainer, 
  GridToolbarColumnsButton, 
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { FC } from "react";
import { useAppSelector } from "../../../../services/store/hooks";
import { IDirData, IPmdData } from "../../../../utils/files/fileManipulations";
import ExportDIR from "./Buttons/ExportButton/ExportDIR";
import ExportPMD from './Buttons/ExportButton/ExportPMD';

const PMDInputDataTableToolbar = () => {

  const { treatmentData } = useAppSelector(state => state.parsedDataReducer);

  if (!treatmentData) return null;
  const data = treatmentData[0];

  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
      <ExportPMD data={data as IPmdData}/>
    </GridToolbarContainer>
  );
};

export default PMDInputDataTableToolbar;
