import React, { FC, useEffect, useMemo, useState } from "react";
import styles from "./ZijdGraph.module.scss";
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { IGraph } from "../../../utils/GlobalTypes";
import { SelectableGraph, GraphSymbols, Unit} from "../../Sub/Graphs";
import AxesAndData from "./AxesAndData";
import { IPmdData } from "../../../utils/files/fileManipulations";
import dataToZijd from "../../../utils/graphs/formatters/dataToZijd";
import { GraphSettings, TMenuItem } from "../../../utils/graphs/types";
import { setSelectedStepsIDs } from "../../../services/reducers/pcaPage";
import { zijdAreaConstants } from "./ZijdConstants";
import { useGraphSelectableNodes, useGraphSelectedIndexes, usePMDGraphSettings } from "../../../utils/GlobalHooks";

interface LineCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface IZijdGraph extends IGraph {
  pcaLines?: [LineCoords, LineCoords];
  width: number;
  height: number;
  data: IPmdData;
}

const ZijdGraph: FC<IZijdGraph> = ({ graphId, pcaLines, width, height, data }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan

  const dispatch = useAppDispatch();

  const { reference, selectedStepsIDs } = useAppSelector(state => state.pcaPageReducer); 
  const { menuItems, settings } = usePMDGraphSettings();
  const selectableNodes = useGraphSelectableNodes(graphId, true);
  const selectedIndexes = useGraphSelectedIndexes();

  const { viewWidth, viewHeight, ...areaConstants} = useMemo(() => zijdAreaConstants(width, height), [width, height]);
  const { unitLabel, ...dataConstants } = useMemo(() => dataToZijd(data, width / 2, reference, areaConstants.unitCount), [reference, width]);

  return (
    <>
      <SelectableGraph
        graphId={graphId}
        width={viewWidth}
        height={viewHeight}
        selectableNodes={selectableNodes}
        nodesDuplicated={true}
        menuItems={menuItems}
      >
        <g>
          <AxesAndData 
            graphId={graphId}
            width={width}
            height={height}
            areaConstants={areaConstants}
            dataConstants={dataConstants}
            selectedIndexes={selectedIndexes}
            settings={settings}
          />
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