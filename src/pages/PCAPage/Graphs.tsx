import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './PCAPage.module.scss';
import { useWindowSize } from '../../utils/GlobalHooks';
import { ZijdGraph, StereoGraph, MagGraph} from '../../components/Graph';
import { IPmdData } from '../../utils/GlobalTypes';
import GraphsSkeleton from './GraphsSkeleton';

interface IGraphs {
  dataToShow: IPmdData | null;
};

const Graphs: FC<IGraphs> = ({ dataToShow }) => {

  const [wv, wh] = useWindowSize();

  const graphLargeRef = useRef<HTMLDivElement>(null);
  const graphSmallTopRef = useRef<HTMLDivElement>(null);
  const graphSmallBotRef = useRef<HTMLDivElement>(null);

  const [largeGraphSize, setLargeGraphSize] = useState<number>(300);
  const [smallGraphSize, setSmallGraphSize] = useState<number>(300);

  useEffect(() => {
    const largeGraphWidth = graphLargeRef.current?.offsetWidth;
    const largeGraphHeight = graphLargeRef.current?.offsetHeight;
    if (largeGraphWidth && largeGraphHeight) {
      const minBoxSize = Math.min(largeGraphWidth, largeGraphHeight);
      setLargeGraphSize(minBoxSize - 112);
    };
    const smallGraphWidth = graphSmallTopRef.current?.offsetWidth;
    const smallGraphHeight = graphSmallTopRef.current?.offsetHeight;
    if (smallGraphWidth && smallGraphHeight) {
      const minBoxSize = Math.min(smallGraphWidth, smallGraphHeight);
      setSmallGraphSize(minBoxSize - 80);
    };
  }, [graphLargeRef, graphSmallTopRef, graphSmallBotRef, wv, wh]);

  if (!dataToShow) return (
    <GraphsSkeleton 
      graphLarge={{node: null, ref: graphLargeRef}} 
      graphSmallTop={{node: null, ref: graphSmallTopRef}}
      graphSmallBot={{node: null, ref: graphSmallBotRef}}
    />
  );

  return (
    <GraphsSkeleton 
      graphLarge={{
        node: <ZijdGraph 
          graphId={`zijd`}
          width={largeGraphSize}
          height={largeGraphSize} 
          data={dataToShow}
        />,
        ref: graphLargeRef
      }}
      graphSmallTop={{
        node: <StereoGraph 
          graphId={`stereo`} 
          width={smallGraphSize}
          height={smallGraphSize}
          data={dataToShow}
        />,
        ref: graphSmallTopRef
      }}
      graphSmallBot={{
        node: <MagGraph 
          graphId={`mag`}
          width={smallGraphSize}
          height={smallGraphSize}
          data={dataToShow}
        />,
        ref: graphSmallBotRef
      }}
    />
  )
};

export default Graphs;
