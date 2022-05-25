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

const DIRStatisticsDataTableToolbar = () => {

  const { currentFileInterpretations, outputFilename } = useAppSelector(state => state.dirPageReducer);

  if (!currentFileInterpretations) return null;
  const data: IDirData = {
    name: outputFilename,
    interpretations: currentFileInterpretations.map((interpretation, index) => {
      return {
        id: index + 1,
        label: interpretation.label,
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

export default DIRStatisticsDataTableToolbar;
