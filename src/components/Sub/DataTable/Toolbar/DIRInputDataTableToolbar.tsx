import { 
  GridToolbarContainer, 
  GridToolbarColumnsButton, 
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { FC } from "react";
import { useAppSelector } from "../../../../services/store/hooks";
import { IDirData, IPmdData } from "../../../../utils/GlobalTypes";
import Direction from "../../../../utils/graphs/classes/Direction";
import ExportDIR from "./Buttons/ExportButton/ExportDIR";
import ExportPMD from './Buttons/ExportButton/ExportPMD';

const DIRInputDataTableToolbar = () => {

  const { dirStatData, currentDataDIRid } = useAppSelector(state => state.parsedDataReducer);
  const { hiddenDirectionsIDs, reversedDirectionsIDs } = useAppSelector(state => state.dirPageReducer);

  if (!dirStatData) return null;
  const data = {...dirStatData[currentDataDIRid || 0]};
  if (data && data.interpretations) {
    if (hiddenDirectionsIDs.length) {
      data.interpretations  = data.interpretations.filter(interp => !hiddenDirectionsIDs.includes(interp.id));
    };
    if (reversedDirectionsIDs.length) {
      data.interpretations = data.interpretations.map(interp => {
        const { id, Dgeo, Igeo, Dstrat, Istrat } = interp;
        let geoDirection = new Direction(Dgeo, Igeo, 1);
        let stratDirection = new Direction(Dstrat, Istrat, 1);
        if (reversedDirectionsIDs.includes(id)) {
          geoDirection = geoDirection.reversePolarity();
          stratDirection = stratDirection.reversePolarity();
        };
        const DgeoFinal = +geoDirection.declination.toFixed(1);
        const IgeoFinal = +geoDirection.inclination.toFixed(1);
        const DstratFinal = +stratDirection.declination.toFixed(1);
        const IstratFinal = +stratDirection.inclination.toFixed(1);
        return {...interp, Dgeo: DgeoFinal, Igeo: IgeoFinal, Dstrat: DstratFinal, Istrat: IstratFinal};
      });
    }
  }

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
