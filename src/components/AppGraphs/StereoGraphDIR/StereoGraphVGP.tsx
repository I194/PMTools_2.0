import React, { FC, useEffect, useMemo } from "react";
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
import dataToStereoVGP from "../../../utils/graphs/formatters/stereo/dataToStereoVGP";

export interface IStereoGraphVGP extends IGraph {
  data: VGPData;
};

const StereoGraphVGP: FC<IStereoGraphVGP> = ({ graphId, width, height, data }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan
  console.log('what', data)
  const { reference, currentInterpretation, hiddenDirectionsIDs, currentFile } = useAppSelector(state => state.dirPageReducer);
  const { menuItems, settings } = usePMDGraphSettings();
  const selectableNodes = useGraphSelectableNodesDIR(graphId); 
  const selectedIDs = useGraphSelectedIDs('dir');
  const {viewHeight, viewWidth, ...areaConstants} = stereoAreaConstants(width, height);
  const dataConstants = useMemo(() => 
    dataToStereoVGP(data, width / 2, hiddenDirectionsIDs),
  [reference, width, currentInterpretation, data, hiddenDirectionsIDs]);

  return (
    <>
      <SelectableGraph
        graphId={graphId}
        width={viewWidth}
        height={viewHeight}
        selectableNodes={selectableNodes}
        nodesDuplicated={false}
        menuItems={menuItems}
        extraID={'vgp'}
        graphName={`stereo_vgp`}
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

export default StereoGraphVGP;