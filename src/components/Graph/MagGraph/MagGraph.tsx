import React, { FC, useMemo } from "react";
import styles from "./MagGraph.module.scss";
import { useGraphSelectableNodes, useGraphSelectedIndexes, usePMDGraphSettings } from "../../../utils/GlobalHooks";
import { IGraph } from "../../../utils/GlobalTypes";
import { IPmdData } from "../../../utils/files/fileManipulations"
import dataToMag from "../../../utils/graphs/formatters/mag/dataToMag";
import { SelectableGraph } from "../../Sub/Graphs";
import { magAreaConstants } from "./MagConstants";
import AxesAndData from "./AxesAndData";

export interface IMagGraph extends IGraph {
  data: IPmdData;
}

const MagGraph: FC<IMagGraph> = ({ graphId, width, height, data }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan

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