import React, { FC, useEffect, useState } from "react";
import styles from "./ZijdGraph.module.scss";
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { IGraph } from "../../../utils/GlobalTypes";
import { SelectableGraph, GraphSymbols, Unit} from "../../Sub/Graphs";
import AxesAndData from "./AxesAndData";
import { IPmdData } from "../../../utils/files/fileManipulations";
import dataToZijd from "../../../utils/graphs/formatters/dataToZijd";

interface LineCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface IZijdGraph extends IGraph {
  pcaLines?: [LineCoords, LineCoords];
  width: number;
  height: number;
  data: IPmdData;
}

const ZijdGraph: FC<IZijdGraph> = ({ graphId, pcaLines, width, height, data }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan

  const dispatch = useAppDispatch();

  const { reference } = useAppSelector(state => state.pcaPageReducer); 

  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [selectableNodes, setSelectableNodes] = useState<ChildNode[]>([]);

  const graphAreaMargin = 56;
  const viewWidth = width + graphAreaMargin * 2;
  const viewHeight = height + graphAreaMargin * 2;

  const unit = (width / 10);
  const unitCount = 10;
  const zeroX = (width / 2);
  const zeroY = (height / 2);
  
  const {
    horizontalProjectionData,
    verticalProjectionData,
    directionalData,
    unitLabel,
    tooltipData
  } = dataToZijd(data, width / 2, reference, unitCount);

  // selectableNodes - все точки на графике 
  useEffect(() => {
    const elementsContainerH = document.getElementById(`${graphId}-h-dots`);
    const elementsContainerV = document.getElementById(`${graphId}-v-dots`);
    if (elementsContainerH && elementsContainerV) {
      const nodes = Array.from(elementsContainerH.childNodes).concat(Array.from(elementsContainerV.childNodes));
      setSelectableNodes(nodes);
    }
  }, [graphId])

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
    setSelectedIndexes(selectedIndexesUpdated);
    return null;
  };

  return (
    <>
      <SelectableGraph
        graphId={graphId}
        width={viewWidth}
        height={viewWidth}
        selectableNodes={selectableNodes}
        selectedIndexes={selectedIndexes}
        setSelectedIndexes={setSelectedIndexes}
        nodesDuplicated={true}
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
            horizontalProjectionData={horizontalProjectionData}
            verticalProjectionData={verticalProjectionData}
            directionalData={directionalData}
            selectedIndexes={selectedIndexes}
            handleDotClick={handleDotClick}
            tooltipData={tooltipData}
          />
          <GraphSymbols 
            title1="Horizontal" id1={`${graphId}-h-data`} 
            title2="Vertical" id2={`${graphId}-v-data`}
            viewHeight={viewHeight} viewWidth={viewWidth}
          />
          <Unit 
            label={`${unitLabel} A/m`} 
            viewHeight={viewHeight} viewWidth={viewWidth}
          />
        </g>
      </SelectableGraph>
    </>
  )
}

export default ZijdGraph;