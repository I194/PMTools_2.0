import React, { FC, useMemo } from "react";
import styles from "./MagGraph.module.scss";
import { useGraphSelectableNodesPCA, useGraphSelectedIDs, usePMDGraphSettings } from "../../../utils/GlobalHooks";
import { FoldTestResult, IGraph } from "../../../utils/GlobalTypes";
import { IPmdData } from "../../../utils/GlobalTypes";
import dataToMag from "../../../utils/graphs/formatters/mag/dataToMag";
import { SelectableGraph } from "../../Common/Graphs";
import { magAreaConstants } from "./FoldTestConstants";
import AxesAndData from "./AxesAndData";
import getInterpretationIDs from "../../../utils/graphs/formatters/getInterpretationIDs";
import { useAppSelector } from "../../../services/store/hooks";
import dataToFoldTest from "../../../utils/graphs/formatters/foldTest/dataToFoldTest";

export interface IFoldTestGraph extends IGraph {
  data: FoldTestResult;
}

const FoldTestGraph: FC<IFoldTestGraph> = ({ graphId, width, height, data }) => {
  const { menuItems, settings } = usePMDGraphSettings();

  const dataConstants = useMemo(() => dataToFoldTest(data, width, height), [data, width, height]);
  const {viewHeight, viewWidth, ...areaConstants} = magAreaConstants(width, height);

  return (
    <>
      <SelectableGraph
        graphId={graphId}
        width={viewWidth}
        height={viewHeight}
        selectableNodes={[]}
        nodesDuplicated={false}
        menuItems={menuItems}
        graphName={`foldTestGraph`}
      >
        <g>
          <AxesAndData 
            graphId={graphId}
            width={width}
            height={height}
            areaConstants={areaConstants}
            dataConstants={dataConstants}
            selectedIDs={[]}
            inInterpretationIDs={[]}
            settings={settings}
          />
        </g>
      </SelectableGraph>
    </>
  )
}

export default FoldTestGraph;