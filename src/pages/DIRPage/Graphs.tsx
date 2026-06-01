import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import styles from './DIRPage.module.scss';
import { useDIRGraphSettings, useWindowSize } from '../../utils/GlobalHooks';
import { IDirData } from '../../utils/GlobalTypes';
import GraphsSkeleton from './GraphsSkeleton';
import { StereoGraphDIR } from '../../components/AppGraphs';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import {
  addHiddenDirectionsIDs,
  removeHiddenDirectionsIDs,
  setCenteredByMean as setCenteredByMeanAction,
  setCutoffEnabled,
} from '../../services/reducers/dirPage';
import Direction from '../../utils/graphs/classes/Direction';
import { strangeRotation } from '../../utils/statistics/matrix';
import reverseDirectionsByIds from '../../utils/files/transforms/reverseDirectionsByIds';

interface IGraphs {
  dataToShow: IDirData | null;
}

const Graphs: FC<IGraphs> = ({ dataToShow }) => {
  const dispatch = useAppDispatch();
  const [wv, wh] = useWindowSize();

  const graphRef = useRef<HTMLDivElement>(null);
  const graphToExportRef = useRef<HTMLDivElement>(null);
  const { menuItems, settings } = useDIRGraphSettings();
  const {
    reference,
    currentInterpretation,
    centeredByMean,
    cutoffEnabled,
    cutoffAngle,
    reversedDirectionsIDs,
    hiddenDirectionsIDs,
  } = useAppSelector((state) => state.dirPageReducer);

  // Center-by-mean and cutoff enable/angle live in Redux so the directions table
  // and export menu can read them; the remaining cutoff visibility toggles stay
  // local to the graph.
  const setCenteredByMean: React.Dispatch<React.SetStateAction<boolean>> = (value) =>
    dispatch(setCenteredByMeanAction(typeof value === 'function' ? value(centeredByMean) : value));
  const enableCutoff = cutoffEnabled;
  const setEnableCutoff: React.Dispatch<React.SetStateAction<boolean>> = (value) =>
    dispatch(setCutoffEnabled(typeof value === 'function' ? value(cutoffEnabled) : value));

  const [graphSize, setGraphSize] = useState<number>(300);
  const [showCutoffCircle, setShowCutoffCircle] = useState<boolean>(true);
  const [showCutoffOuterDots, setShowCutoffOuterDots] = useState<boolean>(false);

  useEffect(() => {
    const graphWidth = graphRef.current?.offsetWidth;
    const graphHeight = graphRef.current?.offsetHeight;
    if (graphWidth && graphHeight) {
      const minBoxSize = Math.min(graphWidth, graphHeight);
      setGraphSize(minBoxSize - 112);
    }
  }, [graphRef, wv, wh]);

  const cutoffOuterDotsIDs: number[] = useMemo(() => {
    if (!currentInterpretation?.rawData || !dataToShow) return [];
    // сначала берём среднее направление, относительно него будем строить cutoff
    let { direction: meanDirection } =
      currentInterpretation.rawData.mean[reference as 'geographic' | 'stratigraphic'];
    meanDirection = new Direction(
      meanDirection.declination,
      meanDirection.inclination,
      meanDirection.length,
    );
    // Test the cutoff against the SAME reversed/aligned coordinates the stereonet
    // plots and the Fisher mean was computed in. Without this, a reversed direction
    // sitting on the mean would be measured at its raw antipodal position (~180°
    // away) and wrongly hidden — so the 45° circle drawn on screen would not match
    // which dots it actually cuts. Mirrors the export path (reverseDirectionsByIds
    // then markCutoffComments). When nothing is reversed this is a no-op copy.
    const alignedData = reverseDirectionsByIds(dataToShow, reversedDirectionsIDs);
    const newDirsToHideIDs = alignedData.interpretations
      .filter((direction) => {
        const { Dgeo, Igeo, Dstrat, Istrat } = direction;
        const inReferenceCoords: [number, number] =
          reference === 'stratigraphic' ? [Dstrat, Istrat] : [Dgeo, Igeo];
        const directionVector = new Direction(inReferenceCoords[0], inReferenceCoords[1], 1);
        return meanDirection.angle(directionVector) > cutoffAngle;
      })
      .map((dir) => dir.id);
    return newDirsToHideIDs;
  }, [currentInterpretation, dataToShow, reversedDirectionsIDs, reference, cutoffAngle]);

  // Remember which ids the cutoff currently hides, so when the outlier set
  // changes (Geo↔Strat flip, a reversal, or a recomputed mean) we can re-sync:
  // drop the ids that are no longer cut and hide the newly-cut ones — without
  // disturbing directions the user hid manually. `cutoffOuterDotsIDs` must be in
  // the dependency array or this never re-runs on those changes.
  const appliedCutoffIDsRef = useRef<number[]>([]);
  // Latest hidden set, read inside the effect without making it a dependency
  // (that would re-run the effect on its own dispatch and risk a loop).
  const hiddenDirectionsIDsRef = useRef(hiddenDirectionsIDs);
  hiddenDirectionsIDsRef.current = hiddenDirectionsIDs;

  useEffect(() => {
    if (!dataToShow) return;
    const shouldHide = enableCutoff && !showCutoffOuterDots;
    const nextCutoffIDs = shouldHide ? cutoffOuterDotsIDs : [];
    const currentlyHidden = hiddenDirectionsIDsRef.current;
    // Release only ids the cutoff itself hid and that are no longer cut.
    const idsToRelease = appliedCutoffIDsRef.current.filter((id) => !nextCutoffIDs.includes(id));
    // Hide newly-cut ids that aren't already hidden (manually or by a prior pass).
    const idsToHide = nextCutoffIDs.filter((id) => !currentlyHidden.includes(id));
    if (idsToRelease.length) dispatch(removeHiddenDirectionsIDs(idsToRelease));
    if (idsToHide.length) dispatch(addHiddenDirectionsIDs(idsToHide));
    // The cutoff "owns" only ids it actually hid: still-cut ids it owned before,
    // plus the ones it just hid. Ids already hidden by hand are never owned, so
    // disabling the cutoff can never reveal a manual hide.
    //
    // Known limitation: hidden state is a single set with no per-id provenance,
    // and the eye icon (setHiddenDirectionsIDs, a full replace) does not re-run
    // this effect. So if the user manually un-hides then re-hides a direction
    // that the cutoff is also hiding, the cutoff still "owns" it and disabling
    // the cutoff releases it. Fully fixing this needs separate cutoff-hidden vs
    // manually-hidden sets; this is still strictly better than the prior code,
    // which cleared the entire hidden set whenever the cutoff was switched off.
    appliedCutoffIDsRef.current = [
      ...appliedCutoffIDsRef.current.filter((id) => nextCutoffIDs.includes(id)),
      ...idsToHide,
    ];
  }, [enableCutoff, showCutoffOuterDots, dataToShow, cutoffOuterDotsIDs, dispatch]);

  if (!dataToShow)
    return (
      <GraphsSkeleton
        graph={{ node: null, ref: graphRef }}
        graphToExport={{ node: null, ref: graphToExportRef }}
      />
    );

  return (
    <GraphsSkeleton
      graph={{
        node: (
          <StereoGraphDIR
            graphId={`stereoDir`}
            width={graphSize}
            height={graphSize}
            data={dataToShow}
            centeredByMean={centeredByMean}
            setCenteredByMean={setCenteredByMean}
            menuSettings={{ menuItems, settings }}
            cutoff={{
              enabled: enableCutoff,
              setEnableCutoff,
              borderCircle: {
                show: showCutoffCircle,
                setShow: setShowCutoffCircle,
                angle: cutoffAngle, // 45 is the most common angle in paleomagnetism
              },
              outerDots: {
                show: showCutoffOuterDots,
                setShow: setShowCutoffOuterDots,
              },
            }}
          />
        ),
        ref: graphRef,
      }}
      graphToExport={{
        node: (
          <StereoGraphDIR
            graphId={`export_stereoDir`}
            width={500}
            height={500}
            data={dataToShow}
            centeredByMean={centeredByMean}
            setCenteredByMean={setCenteredByMean}
            cutoff={{
              enabled: enableCutoff,
              setEnableCutoff,
              borderCircle: {
                show: showCutoffCircle,
                setShow: setShowCutoffCircle,
                angle: 45, // most common in paleomagnetism
              },
              outerDots: {
                show: showCutoffOuterDots,
                setShow: setShowCutoffOuterDots,
              },
            }}
            menuSettings={{ menuItems, settings }}
          />
        ),
        ref: graphToExportRef,
      }}
    />
  );
};

export default Graphs;
