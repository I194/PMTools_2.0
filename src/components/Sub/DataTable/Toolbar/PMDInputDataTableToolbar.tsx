import { 
  GridToolbarContainer, 
  GridToolbarColumnsButton, 
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { FC } from "react";
import { useAppSelector } from "../../../../services/store/hooks";
import { IDirData, IPmdData } from "../../../../utils/GlobalTypes";
import ExportDIR from "./Buttons/ExportButton/ExportDIR";
import ExportPMD from './Buttons/ExportButton/ExportPMD';

const PMDInputDataTableToolbar = () => {

  const { treatmentData, currentDataPMDid } = useAppSelector(state => state.parsedDataReducer);
  const { hiddenStepsIDs } = useAppSelector(state => state.pcaPageReducer);

  if (!treatmentData) return null;
  const data = {...treatmentData[currentDataPMDid || 0]};
  if (data && data.steps && hiddenStepsIDs.length) {
    data.steps = data.steps.filter(step => !hiddenStepsIDs.includes(step.id));
  }

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
