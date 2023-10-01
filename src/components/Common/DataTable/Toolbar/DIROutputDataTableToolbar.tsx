import { 
  GridToolbarContainer, 
  GridToolbarColumnsButton, 
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useAppSelector } from "../../../../services/store/hooks";
import { IDirData } from "../../../../utils/GlobalTypes"; 
import ExportDIRFromDIR from "./Buttons/ExportButton/ExportDIRFromDIR";

const DIROutputDataTableToolbar = () => {

  const { allInterpretations, outputFilename } = useAppSelector(state => state.dirPageReducer);

  if (!allInterpretations) return null;
  const data: IDirData = {
    name: outputFilename,
    interpretations: allInterpretations.map((interpretation, index) => {
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
        MADgeo: interpretation.confidenceRadiusGeo,
        Kgeo: interpretation.Kgeo || 0,
        MADstrat: interpretation.confidenceRadiusGeo,
        Kstrat: interpretation.Kgeo || 0,
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
      <ExportDIRFromDIR data={data}/>
    </GridToolbarContainer>
  );
};

export default DIROutputDataTableToolbar;
