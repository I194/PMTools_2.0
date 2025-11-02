import React, { FC, useEffect, useMemo, useState } from "react";
import { useAppSelector } from '../../../services/store/hooks';
import { useGraphSelectableNodesPCA, useGraphSelectedIDs, usePMDGraphSettings } from "../../../utils/GlobalHooks";
import { IGraph, RawStatisticsPCA } from "../../../utils/GlobalTypes";
import { IPmdData } from "../../../utils/GlobalTypes";
import { clamp } from "../../../utils";
import dataToZijd from "../../../utils/graphs/formatters/zijd/dataToZijd";
import { SelectableGraph, GraphSymbols, Unit} from "../../Common/Graphs";
import { calculateZijdAreaParams } from "./ZijdConstants";
import AxesAndData from "./AxesAndData";
import getInterpretationIDs from "../../../utils/graphs/formatters/getInterpretationIDs";
import { GraphSettings, Pan, TMenuItem } from "../../../utils/graphs/types";
import CoordinateSystem from "../../Common/Graphs/CoordinateSystem/CoordinateSystem";

export interface IZijdGraph extends IGraph {
  data: IPmdData;
  rightClickMenu: {
    items: TMenuItem[];
    settings: GraphSettings;
  }
};

export const ZijdGraph = ({ graphId, width, height, data, rightClickMenu: { items, settings } }: IZijdGraph) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<Pan>({left: 0, top: 0});

  const { hotkeys } = useAppSelector(state => state.appSettingsReducer);
  const { reference, projection, currentInterpretation, hiddenStepsIDs } = useAppSelector(state => state.pcaPageReducer);
  const selectableNodes = useGraphSelectableNodesPCA(graphId, true);
  const selectedIDs = useGraphSelectedIDs();

  const { viewWidth, viewHeight, ...areaConstants} = useMemo(() => calculateZijdAreaParams(width, height), [width, height]);
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

  const inInterpretationIDs = useMemo(() => getInterpretationIDs(currentInterpretation, data), [currentInterpretation, data]);

  const handleWheelZoom = (event: React.WheelEvent<SVGSVGElement>) => {
    const newZoom = clamp(zoom - event.deltaY / width, 1, 6);
    setZoom(newZoom);
  };

  const handleHotkeysPan = (event: KeyboardEvent) => {
    const keyCode = event.code;
    const altKey = event.altKey;
    const zijdHotkeys = hotkeys.find(block => block.titleKey === 'zijd' || block.title === 'Управление диграммой Зийдервельда' || block.title === 'Zijd diagram manipulation')?.hotkeys;
    if (!zijdHotkeys) return;

    const rightHotkey = (zijdHotkeys.find(h => h.labelKey === 'zijd.right') || zijdHotkeys.find(h => h.label === 'Переместиться вправо') || zijdHotkeys.find(h => h.label === 'Move right'))?.hotkey.code;
    const leftHotkey = (zijdHotkeys.find(h => h.labelKey === 'zijd.left') || zijdHotkeys.find(h => h.label === 'Переместиться влево') || zijdHotkeys.find(h => h.label === 'Move left'))?.hotkey.code;
    const upHotkey = (zijdHotkeys.find(h => h.labelKey === 'zijd.top') || zijdHotkeys.find(h => h.label === 'Переместиться вверх') || zijdHotkeys.find(h => h.label === 'Move up'))?.hotkey.code;
    const downHotkey = (zijdHotkeys.find(h => h.labelKey === 'zijd.bottom') || zijdHotkeys.find(h => h.label === 'Переместиться вниз') || zijdHotkeys.find(h => h.label === 'Move down'))?.hotkey.code;

    if (!altKey) return;
    event.preventDefault();

    switch (keyCode) {
      case leftHotkey:
        setPan({...pan, left: pan.left - 10});
        return;
      case rightHotkey:
        setPan({...pan, left: pan.left + 10});
        return;
      case upHotkey:
        setPan({...pan, top: pan.top - 10});
        return;
      case downHotkey:
        setPan({...pan, top: pan.top + 10});
        return;
    };
  };

  const resetZoomPan = () => {
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
        menuItems={items}
        extraID={data.metadata.name}
        onWheel={handleWheelZoom}
        hotkeysListener={handleHotkeysPan}
        currentPan={pan}
        currentZoom={zoom}
        onResetZoomPan={resetZoomPan}
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
};