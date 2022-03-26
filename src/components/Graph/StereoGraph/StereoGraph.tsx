import React, { FC, useMemo } from "react";
import styles from "./ZijdGraph.module.scss";
import { useAppSelector } from "../../../services/store/hooks";
import { useGraphSelectableNodes, useGraphSelectedIDs, usePMDGraphSettings } from "../../../utils/GlobalHooks";
import { IGraph, RawStatisticsPCA } from "../../../utils/GlobalTypes";
import { IPmdData } from "../../../utils/GlobalTypes";
import dataToStereoPMD from "../../../utils/graphs/formatters/stereo/dataToStereoPMD";
import { SelectableGraph, GraphSymbols } from "../../Sub/Graphs";
import { stereoAreaConstants } from "./StereoConstants";
import AxesAndData from "./AxesAndData";
import getInterpretationIDs from "../../../utils/graphs/formatters/getInterpretationIDs";
import CoordinateSystem from "../../Sub/Graphs/CoordinateSystem/CoordinateSystem";

export interface IStereoGraph extends IGraph {
  data: IPmdData;
}

const StereoGraph: FC<IStereoGraph> = ({ graphId, width, height, data }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan

  const { reference, currentInterpretation, hiddenStepsIDs } = useAppSelector(state => state.pcaPageReducer); 
  const { menuItems, settings } = usePMDGraphSettings();
  const selectableNodes = useGraphSelectableNodes(graphId, false); 
  const selectedIDs = useGraphSelectedIDs();

  const {viewHeight, viewWidth, ...areaConstants} = stereoAreaConstants(width, height);
  const dataConstants = useMemo(() => 
    dataToStereoPMD(data, width / 2, reference, hiddenStepsIDs, currentInterpretation?.rawData as RawStatisticsPCA),
  [reference, width, currentInterpretation, data, hiddenStepsIDs]);

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
            inInterpretationIDs={inInterpretationIDs}
            selectedIDs={selectedIDs}
            settings={settings}
          />
          <CoordinateSystem reference={reference} top={-15}/>  
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