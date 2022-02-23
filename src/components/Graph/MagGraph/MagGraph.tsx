import React, { FC, useEffect, useMemo, useState } from "react";
import styles from "./MagGraph.module.scss";
import { IGraph } from "../../../utils/GlobalTypes";
import { SelectableGraph, GraphSymbols, Unit} from "../../Sub/Graphs";
import AxesAndData from "./AxesAndData";
import dataToMag from "../../../utils/graphs/formatters/dataToMag";
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";
import { IPmdData } from "../../../utils/files/fileManipulations";
import { GraphSettings, TMenuItem } from "../../../utils/graphs/types";
import { useGraphSelectableNodes, useGraphSelectedIndexes, usePMDGraphSettings } from "../../../utils/GlobalHooks";


export interface IMagGraph extends IGraph {
  width: number;
  height: number;
  data: IPmdData;
}


const MagGraph: FC<IMagGraph> = ({ graphId, width, height, data }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan
  const dispatch = useAppDispatch();

  const { reference, selectedStepsIDs } = useAppSelector(state => state.pcaPageReducer); 
  const { menuItems, settings } = usePMDGraphSettings();
  const selectableNodes = useGraphSelectableNodes(graphId, false);

  const selectedIndexes = useGraphSelectedIndexes();

  const { 
    xyData, 
    stepLabels, 
    maxMag,
    tooltipData,
    labels,
  } = useMemo(() => dataToMag(data, width), [width]);

  const demagnetizationType = data.steps[0].demagType;

  const graphAreaMargin = 40;
  const viewWidth = width + graphAreaMargin * 2;
  const viewHeight = height + graphAreaMargin * 2;

  const unitCountX = stepLabels.length - 1;
  const unitCountY = 10;
  const unitX = (width / unitCountX);
  const unitY = (height / unitCountY);
  const zeroX = (0);
  const zeroY = (height);

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
            unitX={unitX}
            unitY={unitY}
            unitCountX={unitCountX}
            unitCountY={unitCountY}
            labels={labels}
            data={xyData}
            tooltipData={tooltipData}
            maxMAG={maxMag}
            stepLabels={stepLabels}
            demagnetizationType={demagnetizationType}
            selectedIndexes={selectedIndexes}
            handleDotClick={handleDotClick}
            settings={settings}
          />
        </g>
      </SelectableGraph>
    </>
  )
}

export default MagGraph;