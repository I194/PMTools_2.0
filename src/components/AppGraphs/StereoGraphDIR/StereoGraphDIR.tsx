import React, { FC, useMemo, useState } from "react";
import styles from "./ZijdGraph.module.scss";
import { useAppSelector } from "../../../services/store/hooks";
import { useGraphSelectableNodesDIR, useGraphSelectedIDs, useDIRGraphSettings } from "../../../utils/GlobalHooks";
import { Cutoff, IDirData, IGraph, RawStatisticsDIR, VGPData } from "../../../utils/GlobalTypes";
import { SelectableGraph, GraphSymbols } from "../../Sub/Graphs";
import { stereoAreaConstants } from "./StereoConstants";
import AxesAndData from "./AxesAndData";
import getInterpretationIDs from "../../../utils/graphs/formatters/getInterpretationIDs";
import CoordinateSystem from "../../Sub/Graphs/CoordinateSystem/CoordinateSystem";
import dataToStereoDIR from "../../../utils/graphs/formatters/stereo/dataToStereoDIR";
import { GraphSettings, TMenuItem } from "../../../utils/graphs/types";

export interface IStereoGraphDIR extends IGraph {
  data: IDirData;
  centeredByMean: boolean;
  setCenteredByMean: React.Dispatch<React.SetStateAction<boolean>>;
  cutoff: Cutoff;
  menuSettings: {
    menuItems: TMenuItem[];
    settings: GraphSettings;
  }
};

const StereoGraphDIR: FC<IStereoGraphDIR> = ({ 
  graphId, 
  width, 
  height, 
  data,
  centeredByMean,
  setCenteredByMean,
  cutoff,
  menuSettings,
}) => {

  const { menuItems, settings } = menuSettings;
  const { reference, currentInterpretation, hiddenDirectionsIDs, reversedDirectionsIDs } = useAppSelector(state => state.dirPageReducer);
  const selectableNodes = useGraphSelectableNodesDIR(graphId); 

  const selectedIDs = useGraphSelectedIDs('dir');
  const {viewHeight, viewWidth, ...areaConstants} = stereoAreaConstants(width, height);
  const dataConstants = useMemo(() => 
    dataToStereoDIR(
      data, width / 2, reference, 
      hiddenDirectionsIDs, reversedDirectionsIDs, 
      centeredByMean, currentInterpretation?.rawData as RawStatisticsDIR,
      cutoff.enabled
    ),
    [
      reference, width, 
      currentInterpretation, data, 
      hiddenDirectionsIDs, 
      reversedDirectionsIDs, 
      centeredByMean, cutoff
    ]
  );

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
        cutoff={{
          toggle: () => cutoff.setEnableCutoff(!cutoff.enabled),
          isEnabled: cutoff.enabled,
          toggleBorderVisibility: () => cutoff.borderCircle?.setShow(!cutoff.borderCircle?.show),
          isBorderVisible: cutoff.borderCircle?.show || false,
          toggleOuterDotsVisibility: () => cutoff.outerDots?.setShow(!cutoff.outerDots?.show),
          isDotsHidden: !cutoff.outerDots?.show || false
        }}
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
            cutoff={cutoff}
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