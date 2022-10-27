import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './DIRPage.module.scss';
import { useDIRGraphSettings, useWindowSize } from '../../utils/GlobalHooks';
import { IDirData } from '../../utils/GlobalTypes';
import GraphsSkeleton from './GraphsSkeleton';
import { StereoGraphDIR }from '../../components/AppGraphs';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import { addHiddenDirectionsIDs, removeHiddenDirectionsIDs } from '../../services/reducers/dirPage';
import Direction from '../../utils/graphs/classes/Direction';
import { strangeRotation } from '../../utils/statistics/matrix';

interface IGraphs {
  dataToShow: IDirData | null;
};

const Graphs: FC<IGraphs> = ({ dataToShow }) => {

  const dispatch = useAppDispatch();
  const [wv, wh] = useWindowSize();

  const graphRef = useRef<HTMLDivElement>(null);
  const graphToExportRef = useRef<HTMLDivElement>(null);
  const { menuItems, settings } = useDIRGraphSettings();
  const { reference, currentInterpretation  } = useAppSelector(state => state.dirPageReducer);

  const [graphSize, setGraphSize] = useState<number>(300);
  const [centeredByMean, setCenteredByMean] = useState<boolean>(false);
  const [enableCutoff, setEnableCutoff] = useState<boolean>(false);
  const [cutoffAngle, setCutoffAngle] = useState<number>(45); // degrees
  const [showCutoffCircle, setShowCutoffCircle] = useState<boolean>(true);
  const [showCutoffOuterDots, setShowCutoffOuterDots] = useState<boolean>(false);

  useEffect(() => {
    const graphWidth = graphRef.current?.offsetWidth;
    const graphHeight = graphRef.current?.offsetHeight;
    if (graphWidth && graphHeight) {
      const minBoxSize = Math.min(graphWidth, graphHeight);
      setGraphSize(minBoxSize - 112);
    };
  }, [graphRef, wv, wh]);

  useEffect(() => {
    if (dataToShow && enableCutoff && !showCutoffOuterDots && currentInterpretation?.rawData) {
      // сначала берём среднее направление, относительно него будем строить cutoff
      const { direction: meanDirection }  = currentInterpretation.rawData.mean[reference as 'geographic' | 'stratigraphic']; 
      // затем берём все имеющиеся векторы и фильтруем их по их удалённости от среднего направления
      const newDirsToHideIDs = dataToShow.interpretations.filter(
        direction => {
          const { Dgeo, Igeo, Dstrat, Istrat } = direction;
          const inReferenceCoords: [number, number]  = reference === 'stratigraphic' ? [Dstrat, Istrat] : [Dgeo, Igeo];
          const directionVector = new Direction(inReferenceCoords[0], inReferenceCoords[1], 1);
          return (meanDirection.angle(directionVector) > cutoffAngle);
        }
      ).map(dir => dir.id);
      dispatch(addHiddenDirectionsIDs(newDirsToHideIDs));
    } else if ((dataToShow && !enableCutoff) || (dataToShow && showCutoffOuterDots)) {
      const newDirsToShowIDs = dataToShow.interpretations.filter(
        dir => dir[reference === "stratigraphic" ? 'Istrat' : 'Igeo'] <= cutoffAngle
      ).map(dir => dir.id);
      dispatch(removeHiddenDirectionsIDs(newDirsToShowIDs));
    }
  }, [enableCutoff, showCutoffOuterDots, dataToShow, currentInterpretation]);

  if (!dataToShow) return (
    <GraphsSkeleton 
      graph={{node: null, ref: graphRef}} 
      graphToExport={{node: null, ref: graphToExportRef}}
    />
  );

  return (
    <GraphsSkeleton 
      graph={{
        node: <StereoGraphDIR 
          graphId={`stereoDir`} 
          width={graphSize}
          height={graphSize}
          data={dataToShow}
          centeredByMean={centeredByMean}
          setCenteredByMean={setCenteredByMean}
          menuSettings={{menuItems, settings}}
          cutoff={{
            enabled: enableCutoff,
            setEnableCutoff,
            borderCircle: {
              show: showCutoffCircle,
              setShow: setShowCutoffCircle,
              angle: cutoffAngle // 45 is the most common angle in paleomagnetism
            },
            outerDots: {
              show: showCutoffOuterDots,
              setShow: setShowCutoffOuterDots
            }
          }}
        />,
        ref: graphRef
      }}
      graphToExport={{
        node: <StereoGraphDIR
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
              angle: 45 // most common in paleomagnetism
            },
            outerDots: {
              show: showCutoffOuterDots,
              setShow: setShowCutoffOuterDots
            }
          }}
          menuSettings={{menuItems, settings}}
        />,
        ref: graphToExportRef
      }}
    />
  )
};

export default Graphs;
