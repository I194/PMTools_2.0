import React, { FC, useEffect, useMemo, useState } from "react";
import styles from "./ZijdGraph.module.scss";
import { IGraph } from "../../../utils/GlobalTypes";
import { SelectableGraph, GraphSymbols, Unit} from "../../Sub/Graphs";
import AxesAndData from "./AxesAndData";
import { stereoAreaConstants } from "./StereoConstants";
import { IPmdData } from "../../../utils/files/fileManipulations";
import { useAppSelector } from "../../../services/store/hooks";
import dataToStereoPMD from "../../../utils/graphs/formatters/dataToStereoPMD";
import { useGraphSelectableNodes, useGraphSelectedIndexes, usePMDGraphSettings } from "../../../utils/GlobalHooks";

export interface IStereoGraph extends IGraph {
  width: number;
  height: number;
  data: IPmdData;
}

const StereoGraph: FC<IStereoGraph> = ({ graphId, width, height, data }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan

  const { reference, selectedStepsIDs } = useAppSelector(state => state.pcaPageReducer); 
  const { menuItems, settings } = usePMDGraphSettings();
  const selectableNodes = useGraphSelectableNodes(graphId, false); 
  const selectedIndexes = useGraphSelectedIndexes();

  const {viewHeight, viewWidth, ...areaConstants} = stereoAreaConstants(width, height);
  const dataConstants = useMemo(() => dataToStereoPMD(data, width / 2, reference), [reference, width]);

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
          <GraphSymbols 
            title1="Down" id1={`${graphId}-d-data`} 
            title2="Up" id2={`${graphId}-u-data`}
            viewHeight={viewHeight} viewWidth={viewWidth}
            disabled={true}
          />
        </g>
      </SelectableGraph>
    </>
  )
}

export default StereoGraph;