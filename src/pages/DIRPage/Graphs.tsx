import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './DIRPage.module.scss';
import { useWindowSize } from '../../utils/GlobalHooks';
import { IDirData } from '../../utils/GlobalTypes';
import GraphsSkeleton from './GraphsSkeleton';
import { StereoGraphDIR }from '../../components/AppGraphs';

interface IGraphs {
  dataToShow: IDirData | null;
};

const Graphs: FC<IGraphs> = ({ dataToShow }) => {

  const [wv, wh] = useWindowSize();

  const graphRef = useRef<HTMLDivElement>(null);

  const [graphSize, setGraphSize] = useState<number>(300);

  useEffect(() => {
    console.log(graphRef.current)
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
        node: <StereoGraphDIR 
          graphId={`stereoDir`} 
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
