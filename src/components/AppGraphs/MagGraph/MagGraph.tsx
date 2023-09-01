import React, { FC, useMemo } from "react";
import styles from "./MagGraph.module.scss";
import { useGraphSelectableNodesPCA, useGraphSelectedIDs, usePMDGraphSettings } from "../../../utils/GlobalHooks";
import { IGraph } from "../../../utils/GlobalTypes";
import { IPmdData } from "../../../utils/GlobalTypes";
import dataToMag from "../../../utils/graphs/formatters/mag/dataToMag";
import { SelectableGraph } from "../../Common/Graphs";
import { magAreaConstants } from "./MagConstants";
import AxesAndData from "./AxesAndData";
import getInterpretationIDs from "../../../utils/graphs/formatters/getInterpretationIDs";
import { useAppSelector } from "../../../services/store/hooks";
import { GraphSettings, TMenuItem } from "../../../utils/graphs/types";

export interface IMagGraph extends IGraph {
  data: IPmdData;
  menuSettings: {
    menuItems: TMenuItem[];
    settings: GraphSettings;
  }
}

const MagGraph: FC<IMagGraph> = ({ graphId, width, height, data, menuSettings }) => {
  const { currentInterpretation, hiddenStepsIDs } = useAppSelector(state => state.pcaPageReducer); 
  const { menuItems, settings } = menuSettings;
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
        graphName={`${data.metadata.name}_mag_pca`}
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