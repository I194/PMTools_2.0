import React, { FC, useEffect, useMemo, useState } from "react";
import styles from "./ZijdGraph.module.scss";
import { IGraph } from "../../../utils/GlobalTypes";
import { SelectableGraph, GraphSymbols, Unit} from "../../Sub/Graphs";
import { dirToCartesian2D } from "../../../utils/graphs/dirToCartesian";
import AxesAndData from "./AxesAndData";
import { IPmdData } from "../../../utils/files/fileManipulations";
import { useAppSelector } from "../../../services/store/hooks";
import dataToStereoPMD from "../../../utils/graphs/formatters/dataToStereoPMD";
import { GraphSettings, TMenuItem } from "../../../utils/graphs/types";
import { useGraphSelectableNodes, useGraphSelectedIndexes, usePMDGraphSettings } from "../../../utils/GlobalHooks";

export interface IStereoGraph extends IGraph {
  width: number;
  height: number;
  data: IPmdData;
}

const StereoGraph: FC<IStereoGraph> = ({ graphId, width, height, data }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan

  const { reference, selectedStepsIDs } = useAppSelector(state => state.pcaPageReducer); 
  const { menuItems, settings } = usePMDGraphSettings();
  const selectableNodes = useGraphSelectableNodes(graphId, true); 

  const selectedIndexes = useGraphSelectedIndexes();

  const { 
    directionalData, 
    xyData, 
    tooltipData,
    labels,
  } = useMemo(() => dataToStereoPMD(data, width / 2, reference), [reference, width]);

  const graphAreaMargin = 40;
  const viewWidth = width + graphAreaMargin * 2;
  const viewHeight = height + graphAreaMargin * 2;

  const unit = (width / 18);
  const unitCount = 18;
  const zeroX = (width / 2);
  const zeroY = (height / 2);

  const handleDotClick = (index: number) => {
    const selectedIndexesUpdated = Array.from(selectedIndexes);

    if (selectedIndexes.includes(index)) {
      selectedIndexesUpdated.splice(
        selectedIndexesUpdated.findIndex((selectedIndex) => selectedIndex === index),
        1
      );
    } else {
      selectedIndexesUpdated.push(index);
    }
    // setSelectedIndexes(selectedIndexesUpdated);
  };

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
            graphAreaMargin={graphAreaMargin}
            zeroX={zeroX}
            zeroY={zeroY}
            width={width}
            height={height}
            unit={unit}
            unitCount={unitCount}
            labels={labels}
            data={xyData}
            directionalData={directionalData}
            tooltipData={tooltipData}
            selectedIndexes={selectedIndexes}
            handleDotClick={handleDotClick}
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