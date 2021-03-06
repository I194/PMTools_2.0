import React, { FC, useMemo, useState } from "react";
import styles from "./ZijdGraph.module.scss";
import { useAppSelector } from "../../../services/store/hooks";
import { useGraphSelectableNodesDIR, useGraphSelectedIDs, usePMDGraphSettings } from "../../../utils/GlobalHooks";
import { IDirData, IGraph, RawStatisticsDIR, VGPData } from "../../../utils/GlobalTypes";
import { SelectableGraph, GraphSymbols } from "../../Sub/Graphs";
import { stereoAreaConstants } from "./StereoConstants";
import AxesAndData from "./AxesAndData";
import getInterpretationIDs from "../../../utils/graphs/formatters/getInterpretationIDs";
import CoordinateSystem from "../../Sub/Graphs/CoordinateSystem/CoordinateSystem";
import dataToStereoDIR from "../../../utils/graphs/formatters/stereo/dataToStereoDIR";

export interface IStereoGraphDIR extends IGraph {
  data: IDirData;
  centeredByMean: boolean;
  setCenteredByMean: React.Dispatch<React.SetStateAction<boolean>>;
};

const StereoGraphDIR: FC<IStereoGraphDIR> = ({ 
  graphId, 
  width, 
  height, 
  data,
  centeredByMean,
  setCenteredByMean,
}) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan

  // const [centeredByMean, setCenteredByMean] = useState<boolean>(false);

  const { reference, currentInterpretation, hiddenDirectionsIDs, reversedDirectionsIDs } = useAppSelector(state => state.dirPageReducer);
  const { menuItems, settings } = usePMDGraphSettings();
  const selectableNodes = useGraphSelectableNodesDIR(graphId); 

  const selectedIDs = useGraphSelectedIDs('dir');
  const {viewHeight, viewWidth, ...areaConstants} = stereoAreaConstants(width, height);
  const dataConstants = useMemo(() => 
    dataToStereoDIR(data, width / 2, reference, hiddenDirectionsIDs, reversedDirectionsIDs, centeredByMean, currentInterpretation?.rawData as RawStatisticsDIR),
  [reference, width, currentInterpretation, data, hiddenDirectionsIDs, reversedDirectionsIDs, centeredByMean]);

  return (
    <>
      <SelectableGraph
        graphId={graphId}
        width={viewWidth}
        height={viewHeight}
        selectableNodes={selectableNodes}
        nodesDuplicated={false}
        menuItems={menuItems}
        extraID={data.name}
        graphName={`${data.name}_stereo_dir`}
        onCenterByMean={() => setCenteredByMean(!centeredByMean)}
        centeredByMean={centeredByMean}
      >
        <g>
          <AxesAndData 
            graphId={graphId}
            width={width}
            height={height}
            areaConstants={areaConstants}
            dataConstants={dataConstants}
            inInterpretationIDs={[]}
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

export default StereoGraphDIR;