import React, { FC, useMemo } from "react";
import styles from "./ZijdGraph.module.scss";
import { useAppSelector } from "../../../services/store/hooks";
import { useGraphSelectableNodes, useGraphSelectedIndexes, usePMDGraphSettings } from "../../../utils/GlobalHooks";
import { IGraph } from "../../../utils/GlobalTypes";
import { IPmdData } from "../../../utils/files/fileManipulations";
import dataToStereoPMD from "../../../utils/graphs/formatters/dataToStereoPMD";
import { SelectableGraph, GraphSymbols } from "../../Sub/Graphs";
import { stereoAreaConstants } from "./StereoConstants";
import AxesAndData from "./AxesAndData";

export interface IStereoGraph extends IGraph {
  data: IPmdData;
}

const StereoGraph: FC<IStereoGraph> = ({ graphId, width, height, data }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan

  const { reference, currentStatistics } = useAppSelector(state => state.pcaPageReducer); 
  const { menuItems, settings } = usePMDGraphSettings();
  const selectableNodes = useGraphSelectableNodes(graphId, false); 
  const selectedIndexes = useGraphSelectedIndexes();

  const {viewHeight, viewWidth, ...areaConstants} = stereoAreaConstants(width, height);
  const dataConstants = useMemo(() => 
    dataToStereoPMD(data, width / 2, reference, currentStatistics),
  [reference, width, currentStatistics]);

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