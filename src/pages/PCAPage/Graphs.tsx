import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './PCAPage.module.scss';
import { usePMDGraphSettings, useWindowSize } from '../../utils/GlobalHooks';
import { ZijdGraph, StereoGraph, MagGraph} from '../../components/AppGraphs';
import { IPmdData } from '../../utils/GlobalTypes';
import GraphsSkeleton from './GraphsSkeleton';
import { useAppSelector } from '../../services/store/hooks';
import { useMediaQuery } from 'react-responsive';

interface IGraphs {
  dataToShow: IPmdData | null;
};

const Graphs: FC<IGraphs> = ({ dataToShow }) => {

  const [wv, wh] = useWindowSize();
  const widthLessThan1400 = useMediaQuery({ query: '(max-width: 1400px)' });
  const largeGraphToShow = useAppSelector(state => state.pcaPageReducer.largeGraph);
  const zjdMenuSettings = usePMDGraphSettings();
  const strMenuSettings = usePMDGraphSettings();
  const dmgMenuSettings = usePMDGraphSettings();

  const graphLargeRef = useRef<HTMLDivElement>(null);
  const graphLargeToExportRef = useRef<HTMLDivElement>(null);
  const graphSmallTopRef = useRef<HTMLDivElement>(null);
  const graphSmallTopToExportRef = useRef<HTMLDivElement>(null);
  const graphSmallBotRef = useRef<HTMLDivElement>(null);
  const graphSmallBotToExportRef = useRef<HTMLDivElement>(null);

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
      graphLargeToExport={{node: null, ref: graphLargeToExportRef}}
      graphSmallTop={{node: null, ref: graphSmallTopRef}}
      graphSmallTopToExport={{node: null, ref: graphSmallTopToExportRef}}
      graphSmallBot={{node: null, ref: graphSmallBotRef}}
      graphSmallBotToExport={{node: null, ref: graphSmallBotToExportRef}}
    />
  );

  if (widthLessThan1400) return (
    <GraphsSkeleton 
      graphLarge={{
        node: (
          largeGraphToShow === 0 
            ? 
              <ZijdGraph 
                graphId={`zijd`}
                width={largeGraphSize}
                height={largeGraphSize} 
                data={dataToShow}
                menuSettings={{menuItems: zjdMenuSettings.menuItems, settings: zjdMenuSettings.settings}}
              />
            :
              largeGraphToShow === 1
              ?
                <StereoGraph 
                  graphId={`stereo`} 
                  width={largeGraphSize}
                  height={largeGraphSize}
                  data={dataToShow}
                  menuSettings={{menuItems: strMenuSettings.menuItems, settings: strMenuSettings.settings}}
                />
              :
                <MagGraph 
                  graphId={`mag`}
                  width={largeGraphSize}
                  height={largeGraphSize}
                  data={dataToShow}
                  menuSettings={{menuItems: dmgMenuSettings.menuItems, settings: dmgMenuSettings.settings}}
                />
        ),
        ref: graphLargeRef
      }}
      graphLargeToExport={{
        node: (
          largeGraphToShow === 0 
            ?
              <ZijdGraph 
                graphId={`export_zijd`}
                width={500}
                height={500} 
                data={dataToShow}
                menuSettings={{menuItems: zjdMenuSettings.menuItems, settings: zjdMenuSettings.settings}}
              />
            :
              largeGraphToShow === 1
              ?
                <StereoGraph 
                  graphId={`export_stereo`}
                  width={500}
                  height={500} 
                  data={dataToShow}
                  menuSettings={{menuItems: strMenuSettings.menuItems, settings: strMenuSettings.settings}}
                />
              :
                <MagGraph
                  graphId={`export_mag`}
                  width={500}
                  height={500}
                  data={dataToShow}
                  menuSettings={{menuItems: dmgMenuSettings.menuItems, settings: dmgMenuSettings.settings}}
                />
        ),
        ref: graphLargeToExportRef
      }}
    />
  )

  return (
    <GraphsSkeleton 
      graphLarge={{
        node: (
          <ZijdGraph 
            graphId={`zijd`}
            width={largeGraphSize}
            height={largeGraphSize} 
            data={dataToShow}
            menuSettings={{menuItems: zjdMenuSettings.menuItems, settings: zjdMenuSettings.settings}}
          />
        ),
        ref: graphLargeRef
      }}
      graphLargeToExport={{
        node: <ZijdGraph 
          graphId={`export_zijd`}
          width={500}
          height={500} 
          data={dataToShow}
          menuSettings={{menuItems: zjdMenuSettings.menuItems, settings: zjdMenuSettings.settings}}
        />,
        ref: graphLargeToExportRef
      }}
      graphSmallTop={{
        node: (
          <StereoGraph 
            graphId={`stereo`} 
            width={smallGraphSize}
            height={smallGraphSize}
            data={dataToShow}
            menuSettings={{menuItems: strMenuSettings.menuItems, settings: strMenuSettings.settings}}
          />
        ),
        ref: graphSmallTopRef
      }}
      graphSmallTopToExport={{
        node: <StereoGraph 
          graphId={`export_stereo`}
          width={500}
          height={500} 
          data={dataToShow}
          menuSettings={{menuItems: strMenuSettings.menuItems, settings: strMenuSettings.settings}}
        />,
        ref: graphSmallTopToExportRef
      }}
      graphSmallBot={{
        node: (
          <MagGraph 
            graphId={`mag`}
            width={smallGraphSize}
            height={smallGraphSize}
            data={dataToShow}
            menuSettings={{menuItems: dmgMenuSettings.menuItems, settings: dmgMenuSettings.settings}}
          />
        ),
        ref: graphSmallBotRef
      }}
      graphSmallBotToExport={{
        node: (
          <MagGraph
            graphId={`export_mag`}
            width={500}
            height={500}
            data={dataToShow}
            menuSettings={{menuItems: dmgMenuSettings.menuItems, settings: dmgMenuSettings.settings}}
          />
        ),
        ref: graphSmallBotToExportRef
      }}
    />
  )
};

export default Graphs;
