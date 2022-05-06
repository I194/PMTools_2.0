import React, { FC, useMemo } from "react";
import styles from "./MagGraph.module.scss";
import { useGraphSelectableNodesPCA, useGraphSelectedIDs, usePMDGraphSettings } from "../../../utils/GlobalHooks";
import { IGraph } from "../../../utils/GlobalTypes";
import { IPmdData } from "../../../utils/GlobalTypes";
import dataToMag from "../../../utils/graphs/formatters/mag/dataToMag";
import { SelectableGraph } from "../../Sub/Graphs";
import { magAreaConstants } from "./MagConstants";
import AxesAndData from "./AxesAndData";
import getInterpretationIDs from "../../../utils/graphs/formatters/getInterpretationIDs";
import { useAppSelector } from "../../../services/store/hooks";

export interface IMagGraph extends IGraph {
  data: IPmdData;
}

const MagGraph: FC<IMagGraph> = ({ graphId, width, height, data }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan

  const { currentInterpretation, hiddenStepsIDs } = useAppSelector(state => state.pcaPageReducer); 
  const { menuItems, settings } = usePMDGraphSettings();
  const selectableNodes = useGraphSelectableNodesPCA(graphId, false);
  const selectedIDs = useGraphSelectedIDs();

  const dataConstants = useMemo(() => dataToMag(data, width, hiddenStepsIDs), [width, data, hiddenStepsIDs]);
  const {viewHeight, viewWidth, ...areaConstants} = magAreaConstants(width, height, dataConstants.stepLabels);
  const inInterpretationIDs = getInterpretationIDs(currentInterpretation, data);

  return (
    <>
      <SelectableGraph
        graphId={graphId}
        width={viewWidth}
        height={viewHeight}
        selectableNodes={selectableNodes}
        nodesDuplicated={false}
        menuItems={menuItems}
        extraID={data.metadata.name}
      >
        <g>
          <AxesAndData 
            graphId={graphId}
            width={width}
            height={height}
            areaConstants={areaConstants}
            dataConstants={dataConstants}
            selectedIDs={selectedIDs}
            inInterpretationIDs={inInterpretationIDs}
            settings={settings}
          />
        </g>
      </SelectableGraph>
    </>
  )
}

export default MagGraph;