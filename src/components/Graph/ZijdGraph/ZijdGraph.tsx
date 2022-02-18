import React, { FC, useEffect, useState } from "react";
import styles from "./ZijdGraph.module.scss";
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
  data: IPmdData['steps'];
}

const ZijdGraph: FC<IZijdGraph> = ({ graphId, pcaLines, width, height, data }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan

  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [selectableNodes, setSelectableNodes] = useState<ChildNode[]>([]);

  // const horizontalProjectionData: Array<[number, number]> = [
  //   [20, 20], [25, 70], [50, 40], [39, 72], [110, 119], [118, 129], [134, 141], [150, 150]
  // ]; // "x" is Y, "y" is X
  // const verticalProjectionData: Array<[number, number]> = [
  //   [20, 170], [25, 190], [50, 210], [39, 132], [110, 158], [118, 169], [134, 149], [150, 150]
  // ]; // "x" is Y, "y" is Z
  const res = dataToZijd(data, width / 2);
  console.log(res)

  const horizontalProjectionData: Array<[number, number]> = res.horizontalProjectionData;
  const verticalProjectionData: Array<[number, number]> = res.verticalProjectionData;

  const graphAreaMargin = 56;
  const viewWidth = width + graphAreaMargin * 2;
  const viewHeight = height + graphAreaMargin * 2;

  const unit = (width / 10);
  const unitCount = 10;
  const zeroX = (width / 2);
  const zeroY = (height / 2);

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
            selectedIndexes={selectedIndexes}
            handleDotClick={handleDotClick}
          />
          <GraphSymbols 
            title1="Horizontal" id1={`${graphId}-h-data`} 
            title2="Vertical" id2={`${graphId}-v-data`}
            viewHeight={viewHeight} viewWidth={viewWidth}
          />
          <Unit 
            label={`${(height/10).toExponential(2)} A/m`} 
            viewHeight={viewHeight} viewWidth={viewWidth}
          />
        </g>
      </SelectableGraph>
    </>
  )
}

export default ZijdGraph;