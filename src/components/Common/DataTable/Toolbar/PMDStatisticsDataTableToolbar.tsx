import { 
  GridToolbarContainer, 
  GridToolbarColumnsButton, 
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useAppSelector } from "../../../../services/store/hooks";
import { IDirData } from "../../../../utils/GlobalTypes";
import ExportDIRFromPCA from "./Buttons/ExportButton/ExportDIRFromPca";

const PMDStatisticsDataTableToolbar = () => {

  const { currentFileInterpretations, outputFilename } = useAppSelector(state => state.pcaPageReducer);

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
        MADgeo: interpretation.confidenceRadius,
        Kgeo: interpretation.accuracy || 0,
        MADstrat: interpretation.confidenceRadius,
        Kstrat: interpretation.accuracy || 0,
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
      <ExportDIRFromPCA data={data}/>
    </GridToolbarContainer>
  );
};

export default PMDStatisticsDataTableToolbar;
