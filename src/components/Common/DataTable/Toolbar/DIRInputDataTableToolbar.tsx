import { useMemo } from 'react';
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
  useGridApiContext,
  useGridSelector,
  gridFilteredSortedRowIdsSelector,
} from '@mui/x-data-grid';
import { useAppSelector } from '../../../../services/store/hooks';
import { IDirData } from '../../../../utils/GlobalTypes';
import reverseDirectionsByIds from '../../../../utils/files/transforms/reverseDirectionsByIds';
import centerDirectionsByMean from '../../../../utils/files/transforms/centerDirectionsByMean';
import markCutoffComments from '../../../../utils/files/transforms/markCutoffComments';
import meanDirectionsOf from '../../../../utils/files/transforms/meanDirectionsOf';
import ExportDIRFromDIR from './Buttons/ExportButton/ExportDIRFromDIR';

const DIRInputDataTableToolbar = () => {
  const { dirStatData, currentDataDIRid } = useAppSelector((state) => state.parsedDataReducer);
  const {
    hiddenDirectionsIDs,
    reversedDirectionsIDs,
    centeredByMean,
    cutoffEnabled,
    cutoffAngle,
    reference,
    currentInterpretation,
  } = useAppSelector((state) => state.dirPageReducer);

  // Rows that pass the grid's own column filters (e.g. a filter on Comment).
  // The toolbar is rendered inside the DataGrid, so the grid API is in scope.
  // Row ids equal interpretation ids (see DataTableDIR).
  const apiRef = useGridApiContext();
  const filteredRowIds = useGridSelector(apiRef, gridFilteredSortedRowIdsSelector);

  // Build the two export datasets once per relevant change instead of on every
  // render. The null cases are handled inside the memo so it stays above the
  // early return and respects the Rules of Hooks.
  const exportData = useMemo(() => {
    const sourceData = dirStatData?.[currentDataDIRid || 0] as IDirData | undefined;
    if (!sourceData?.interpretations) return null;

    // Reversal is applied to every export (matches the table and stereonet).
    const reversedData = reverseDirectionsByIds(sourceData, reversedDirectionsIDs);

    const means = meanDirectionsOf(currentInterpretation);
    const center = (dirData: IDirData): IDirData =>
      centeredByMean && means
        ? centerDirectionsByMean(dirData, means.geographic, means.stratigraphic)
        : dirData;

    // Regular export: only the directions visible on the graph (hidden dropped)
    // that also pass the table filter. Original order is kept: the grid's sort
    // order is a view concern and must not reorder the exported file.
    const filteredRowIdSet = new Set(filteredRowIds);
    const visibleData = center({
      ...reversedData,
      interpretations: reversedData.interpretations.filter(
        (interpretation) =>
          !hiddenDirectionsIDs.includes(interpretation.id) &&
          filteredRowIdSet.has(interpretation.id),
      ),
    });

    // "Export with hidden": every direction, with CUT45 added to the ones the 45°
    // cutoff rejects (when the cutoff is on). Cutoff marking is done before
    // centering because the angular test is rotation-invariant.
    let withHiddenData: IDirData = reversedData;
    if (cutoffEnabled && means) {
      const cutoffMean = reference === 'stratigraphic' ? means.stratigraphic : means.geographic;
      withHiddenData = markCutoffComments(withHiddenData, cutoffMean, reference, cutoffAngle);
    }
    withHiddenData = center(withHiddenData);

    return { visibleData, withHiddenData };
  }, [
    dirStatData,
    currentDataDIRid,
    filteredRowIds,
    hiddenDirectionsIDs,
    reversedDirectionsIDs,
    centeredByMean,
    cutoffEnabled,
    cutoffAngle,
    reference,
    currentInterpretation,
  ]);

  if (!exportData) return null;

  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
      <ExportDIRFromDIR data={exportData.visibleData} withHiddenData={exportData.withHiddenData} />
    </GridToolbarContainer>
  );
};

export default DIRInputDataTableToolbar;
