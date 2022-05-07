import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './VGP.module.scss';
import { useWindowSize } from '../../../utils/GlobalHooks';
import { VGPData } from '../../../utils/GlobalTypes';
import GraphsSkeleton from './GraphsSkeleton';
import { StereoGraphVGP } from '../../AppGraphs';
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";

// interface IGraphs {
//   dataToShow: VGPData | null;
// };

const Graphs: FC = () => {

  
  const { vgpData } = useAppSelector(state => state.dirPageReducer);

  const [dataToShow, setDataToShow] = useState<VGPData | null>(null);

  useEffect(() => {
    if (vgpData) setDataToShow(vgpData);
  }, [vgpData]);

  const [wv, wh] = useWindowSize();

  const graphRef = useRef<HTMLDivElement>(null);

  const [graphSize, setGraphSize] = useState<number>(300);

  useEffect(() => {
    const graphWidth = graphRef.current?.offsetWidth;
    const graphHeight = graphRef.current?.offsetHeight;
    if (graphWidth && graphHeight) {
      const minBoxSize = Math.min(graphWidth, graphHeight);
      setGraphSize(minBoxSize - 112);
    };
  }, [graphRef, wv, wh]);

  if (!dataToShow) return (
    <GraphsSkeleton 
      graph={{node: null, ref: graphRef}} 
    />
  );

  return (
    <GraphsSkeleton 
      graph={{
        node: <StereoGraphVGP 
          graphId={`stereoVGP`} 
          width={graphSize}
          height={graphSize}
          data={dataToShow}
        />,
        ref: graphRef
      }}
    />
  )
};

export default Graphs;
