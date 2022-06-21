import React, { FC, useEffect, useMemo, useState } from "react";
import styles from "./ZijdGraph.module.scss";
import { useAppSelector } from '../../../services/store/hooks';
import { useGraphSelectableNodesPCA, useGraphSelectedIDs, usePMDGraphSettings } from "../../../utils/GlobalHooks";
import { IGraph, RawStatisticsPCA } from "../../../utils/GlobalTypes";
import { IPmdData } from "../../../utils/GlobalTypes";
import dataToZijd from "../../../utils/graphs/formatters/zijd/dataToZijd";
import { SelectableGraph, GraphSymbols, Unit} from "../../Sub/Graphs";
import { zijdAreaConstants } from "./ZijdConstants";
import AxesAndData from "./AxesAndData";
import getInterpretationIDs from "../../../utils/graphs/formatters/getInterpretationIDs";
import { Pan } from "../../../utils/graphs/types";
import CoordinateSystem from "../../Sub/Graphs/CoordinateSystem/CoordinateSystem";

export interface IZijdGraph extends IGraph {
  data: IPmdData;
};

const ZijdGraph: FC<IZijdGraph> = ({ graphId, width, height, data }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<Pan>({left: 0, top: 0});

  const { hotkeys } = useAppSelector(state => state.appSettingsReducer);
  const { reference, projection, currentInterpretation, hiddenStepsIDs } = useAppSelector(state => state.pcaPageReducer); 
  const { menuItems, settings } = usePMDGraphSettings();
  const selectableNodes = useGraphSelectableNodesPCA(graphId, true);
  const selectedIDs = useGraphSelectedIDs();

  const { viewWidth, viewHeight, ...areaConstants} = useMemo(() => zijdAreaConstants(width, height), [width, height]);
  const { unitLabel, ...dataConstants } = useMemo(
    () => dataToZijd(
      data, 
      width / 2, 
      zoom,
      reference, 
      projection, 
      areaConstants.unitCount, 
      hiddenStepsIDs, 
      currentInterpretation?.rawData as RawStatisticsPCA
    ),
  [reference, projection, width, currentInterpretation, data, hiddenStepsIDs, zoom]);

  const inInterpretationIDs = getInterpretationIDs(currentInterpretation, data);

  const onWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    let newZoom = zoom + -event.deltaY / width;
    if (newZoom < 1) newZoom = 1;
    if (newZoom > 6) newZoom = 6;
    setZoom(newZoom);
  };

  const handleHotkeysPan = (event: KeyboardEvent) => {
    const keyCode = event.code;
    const altKey = event.altKey;
    const zijdHotkeys = hotkeys.find(block => block.title === 'Управление диграммой Зийдервельда')?.hotkeys;
    if (!zijdHotkeys) return;

    const rightHotkey = zijdHotkeys.find(hotkey => hotkey.label === 'Переместиться вправо')?.hotkey.code;
    const leftHotkey = zijdHotkeys.find(hotkey => hotkey.label === 'Переместиться влево')?.hotkey.code;
    const upHotkey = zijdHotkeys.find(hotkey => hotkey.label === 'Переместиться вверх')?.hotkey.code;
    const downHotkey = zijdHotkeys.find(hotkey => hotkey.label === 'Переместиться вниз')?.hotkey.code;
    
    if (altKey && keyCode === leftHotkey) {
      event.preventDefault();
      setPan({...pan, left: pan.left - 10});
    };
    if (altKey && keyCode === rightHotkey) {
      event.preventDefault();
      setPan({...pan, left: pan.left + 10});
    };
    if (altKey && keyCode === upHotkey) {
      event.preventDefault();
      setPan({...pan, top: pan.top - 10});
    };
    if (altKey && keyCode === downHotkey) {
      event.preventDefault();
      setPan({...pan, top: pan.top + 10});
    };
  };

  const onResetZoomPan = () => {
    setZoom(1);
    setPan({left: 0, top: 0});
  };

  return (
    <>
      <SelectableGraph
        graphId={graphId}
        width={viewWidth}
        height={viewHeight}
        selectableNodes={selectableNodes}
        nodesDuplicated={true}
        menuItems={menuItems}
        extraID={data.metadata.name}
        onWheel={onWheel}
        hotkeysListener={handleHotkeysPan}
        currentPan={pan}
        currentZoom={zoom}
        onResetZoomPan={onResetZoomPan}
        graphName={`${data.metadata.name}_zijd_pca`}
      >
        <g>
          <AxesAndData 
            graphId={graphId}
            width={width}
            height={height}
            pan={pan}
            areaConstants={areaConstants}
            dataConstants={dataConstants}
            selectedIDs={selectedIDs}
            inInterpretationIDs={inInterpretationIDs}
            settings={settings}
          />
          <CoordinateSystem reference={reference}/>  
          <GraphSymbols 
            title1="Horizontal" id1={`${graphId}-h-data`} 
            title2="Vertical" id2={`${graphId}-v-data`}
            viewHeight={viewHeight} viewWidth={viewWidth}
          />
          <Unit 
            label={`${unitLabel} A/m`} 
            viewHeight={viewHeight} viewWidth={viewWidth}
          />
        </g>
      </SelectableGraph>
    </>
  )
}

export default ZijdGraph;