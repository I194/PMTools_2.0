import React, { FC, useEffect, useMemo, useState } from "react";
import styles from "./MagGraph.module.scss";
import { IGraph } from "../../../utils/GlobalTypes";
import { SelectableGraph, GraphSymbols, Unit} from "../../Sub/Graphs";
import AxesAndData from "./AxesAndData";
import dataToMag from "../../../utils/graphs/formatters/dataToMag";
import { magAreaConstants } from "./MagConstants";
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";
import { IPmdData } from "../../../utils/files/fileManipulations";
import { GraphSettings, TMenuItem } from "../../../utils/graphs/types";
import { useGraphSelectableNodes, useGraphSelectedIndexes, usePMDGraphSettings } from "../../../utils/GlobalHooks";


export interface IMagGraph extends IGraph {
  width: number;
  height: number;
  data: IPmdData;
}


const MagGraph: FC<IMagGraph> = ({ graphId, width, height, data }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan
  const dispatch = useAppDispatch();

  const { menuItems, settings } = usePMDGraphSettings();
  const selectableNodes = useGraphSelectableNodes(graphId, false);
  const selectedIndexes = useGraphSelectedIndexes();

  const dataConstants = useMemo(() => dataToMag(data, width), [width]);
  const {viewHeight, viewWidth, ...areaConstants} = magAreaConstants(width, height, dataConstants.stepLabels);

  return (
    <>
      <SelectableGraph
        graphId={graphId}
        width={viewWidth}
        height={viewHeight}
        selectableNodes={selectableNodes}
        nodesDuplicated={false}
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
        </g>
      </SelectableGraph>
    </>
  )
}

export default MagGraph;