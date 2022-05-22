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

const DIRInputDataTableToolbar = () => {

  const { dirStatData, currentDataDIRid } = useAppSelector(state => state.parsedDataReducer);
  const { hiddenDirectionsIDs } = useAppSelector(state => state.dirPageReducer);

  if (!dirStatData) return null;
  const data = dirStatData[currentDataDIRid || 0];
  // if (data && data.interpretations) {
  //   console.log(data)
  //   // data.interpretations = data.interpretations.filter(interp => !hiddenDirectionsIDs.includes(interp.id));
  // }

  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
      <ExportDIR data={data}/>
    </GridToolbarContainer>
  );
};

export default DIRInputDataTableToolbar;
