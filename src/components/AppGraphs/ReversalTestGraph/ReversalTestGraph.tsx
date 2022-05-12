import React, { FC, useMemo } from "react";
import styles from "./ReversalTestGraph.module.scss";
import { useGraphSelectableNodesPCA, useGraphSelectedIDs, usePMDGraphSettings } from "../../../utils/GlobalHooks";
import { CommonMeanTestBootstrapResult, FoldTestResult, IGraph } from "../../../utils/GlobalTypes";
import { IPmdData } from "../../../utils/GlobalTypes";
import dataToMag from "../../../utils/graphs/formatters/mag/dataToMag";
import { SelectableGraph } from "../../Sub/Graphs";
import { reversalTestConstants } from "./ReversalTestConstants";
import AxesAndData from "./AxesAndData";
import getInterpretationIDs from "../../../utils/graphs/formatters/getInterpretationIDs";
import { useAppSelector } from "../../../services/store/hooks";
import dataToFoldTest from "../../../utils/graphs/formatters/foldTest/dataToFoldTest";
import dataToReversalTest from "../../../utils/graphs/formatters/reversalTest/dataToReversalTest";

export interface IReversalTestGraph extends IGraph {
  data: CommonMeanTestBootstrapResult;
}

const ReversalTestGraph: FC<IReversalTestGraph> = ({ graphId, width, height, data }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan

  const { menuItems, settings } = usePMDGraphSettings();

  const dataConstants = useMemo(() => dataToReversalTest(data, width, height), [data, width, height]);
  const {viewHeight, viewWidth, ...areaConstants} = reversalTestConstants(width, height);
  const { graphX, graphY, graphZ } = dataConstants;
  const components: ['X', 'Y', 'Z'] = ['X', 'Y', 'Z'];

  return (
    <div className={styles.container}>
      {
        [graphX, graphY, graphZ].map((graph, index) => (
          <SelectableGraph
            key={index}
            graphId={graphId}
            width={viewWidth}
            height={viewHeight}
            selectableNodes={[]}
            nodesDuplicated={false}
            menuItems={menuItems}
            graphName={`reversalTestGraph_${index}`}
          >
            <g>
              <AxesAndData 
                graphId={graphId}
                width={width}
                height={height}
                areaConstants={areaConstants}
                dataConstants={{...graph, component: components[index]}}
                selectedIDs={[]}
                inInterpretationIDs={[]}
                settings={settings}
              />
            </g>
          </SelectableGraph>
        ))
      }
    </div>
  )
}

export default ReversalTestGraph;