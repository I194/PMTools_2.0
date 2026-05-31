import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { useAppSelector } from '../../../../services/store/hooks';
import { IDirData } from '../../../../utils/GlobalTypes';
import Direction from '../../../../utils/graphs/classes/Direction';
import centerDirectionsByMean from '../../../../utils/files/transforms/centerDirectionsByMean';
import markCutoffComments from '../../../../utils/files/transforms/markCutoffComments';
import ExportDIRFromDIR from './Buttons/ExportButton/ExportDIRFromDIR';

const DIRStatisticsDataTableToolbar = () => {
  const {
    currentFileInterpretations,
    currentInterpretation,
    outputFilename,
    reference,
    cutoffEnabled,
    cutoffAngle,
    reversedDirectionsIDs,
    hiddenDirectionsIDs,
  } = useAppSelector((state) => state.dirPageReducer);

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
        MADgeo: interpretation.confidenceRadiusGeo,
        Kgeo: interpretation.Kgeo || 0,
        MADstrat: interpretation.confidenceRadiusStrat,
        Kstrat: interpretation.Kstrat || 0,
        comment: interpretation.comment,
        demagType: interpretation.demagType,
      };
    }),
    format: '',
    created: '',
  };

  // "Export centered" payload: exactly the directions visible on the stereonet
  // (hidden ones dropped, reversed ones flipped), with CUT95 added to cut
  // directions when the cutoff is active, then rotated so the Fisher mean sits
  // at the centre. Available only when a mean has been computed.
  const mean = currentInterpretation?.rawData?.mean;
  let centeredData: IDirData | null = null;
  if (mean) {
    const visibleInterpretations = data.interpretations
      .filter((interpretation) => !hiddenDirectionsIDs.includes(interpretation.id))
      .map((interpretation) => {
        if (!reversedDirectionsIDs.includes(interpretation.id)) return interpretation;
        const geographic = new Direction(
          interpretation.Dgeo,
          interpretation.Igeo,
          1,
        ).reversePolarity();
        const stratigraphic = new Direction(
          interpretation.Dstrat,
          interpretation.Istrat,
          1,
        ).reversePolarity();
        return {
          ...interpretation,
          Dgeo: +geographic.declination.toFixed(1),
          Igeo: +geographic.inclination.toFixed(1),
          Dstrat: +stratigraphic.declination.toFixed(1),
          Istrat: +stratigraphic.inclination.toFixed(1),
        };
      });

    const geographicMean = new Direction(
      mean.geographic.direction.declination,
      mean.geographic.direction.inclination,
      mean.geographic.direction.length,
    );
    const stratigraphicMean = new Direction(
      mean.stratigraphic.direction.declination,
      mean.stratigraphic.direction.inclination,
      mean.stratigraphic.direction.length,
    );

    let payload: IDirData = { ...data, interpretations: visibleInterpretations };
    // Mark cut directions on the original coordinates first (same predicate as
    // the stereonet), then centre — the angular cutoff test is rotation-invariant.
    if (cutoffEnabled) {
      const cutoffMean = reference === 'stratigraphic' ? stratigraphicMean : geographicMean;
      payload = markCutoffComments(payload, cutoffMean, reference, cutoffAngle);
    }
    centeredData = centerDirectionsByMean(payload, geographicMean, stratigraphicMean);
  }

  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
      <ExportDIRFromDIR data={data} centeredData={centeredData} />
    </GridToolbarContainer>
  );
};

export default DIRStatisticsDataTableToolbar;
