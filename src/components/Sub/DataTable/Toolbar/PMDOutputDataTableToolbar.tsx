import { 
  GridToolbarContainer, 
  GridToolbarColumnsButton, 
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { FC, useEffect } from "react";
import { useAppSelector } from "../../../../services/store/hooks";
import { IDirData } from "../../../../utils/GlobalTypes"; 
import ExportDIR from "./Buttons/ExportButton/ExportDIR";
import ExportPMD from './Buttons/ExportButton/ExportPMD';

const PMDOutputDataTableToolbar = () => {

  const { allInterpretations, outputFilename } = useAppSelector(state => state.pcaPageReducer);

  if (!allInterpretations) return null;
  const data: IDirData = {
    name: outputFilename,
    interpretations: allInterpretations.map((interpretation) => {
      return {
        id: interpretation.id,
        code: interpretation.code || '',
        stepRange: interpretation.stepRange,
        stepCount: interpretation.stepCount,
        Dgeo: interpretation.Dgeo,
        Igeo: interpretation.Igeo,
        Dstrat: interpretation.Dstrat,
        Istrat: interpretation.Istrat,
        mad: interpretation.confidenceRadius,
        k: interpretation.k || 0,
        comment: interpretation.comment,
        demagType: interpretation.demagType
      };
    }),
    format: '',
    created: ''
  };

  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
      <ExportDIR data={data}/>
    </GridToolbarContainer>
  );
};

export default PMDOutputDataTableToolbar;
