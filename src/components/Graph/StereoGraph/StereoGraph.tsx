import React, { FC, useEffect, useState } from "react";
import styles from "./ZijdGraph.module.scss";
import { IGraph } from "../../../utils/GlobalTypes";
import { SelectableGraph, GraphSymbols, Unit} from "../../Sub/Graphs";
import { dirToCartesian2D } from "../../../utils/graphs/dirToCartesian";
import AxesAndData from "./AxesAndData";

interface IStereoGraph extends IGraph {
  width: number;
  height: number;
}

const StereoGraph: FC<IStereoGraph> = ({ graphId, width, height }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan
  // 3. починить отображение цвета точек - проблема сейчас в том, что не считывается корректно inc (считывается y)
  //    то есть вообще надо уже начать работать с нормальной моделью данных, а не с выдуманным массивом [][]

  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [selectableNodes, setSelectableNodes] = useState<ChildNode[]>([]);

  const directionalData: Array<[number, number]> = [
    [50, 0], [10, 10], [20, 20], [30, 30], [40, 40], [50, 50], [60, 60], [70, 70], [80, 80], [90, 90],
    [80, 270], [70, 270], [60, 270], [50, 270], [40, 270], [30, 270], [20, 270], [10, 270], [0, 270],
    [0, 0], [-10, 0], [-20, 0], [-30, 0], [-40, 0],
  ]; // // "x" is Inclination, "y" is Declination

  const graphAreaMargin = 40;
  const viewWidth = width + graphAreaMargin * 2;
  const viewHeight = height + graphAreaMargin * 2;

  const unit = (width / 18);
  const unitCount = 18;
  const zeroX = (width / 2);
  const zeroY = (height / 2);

  const data: Array<[number, number]> = directionalData.map((di) => {
    const xyz = dirToCartesian2D(di[0], di[1] - 90, width);
    // console.log(xyz.x, xyz.y)
    return [xyz.x, xyz.y];
  })

  // selectableNodes - все точки на графике 
  useEffect(() => {
    const elementsContainer = document.getElementById(`${graphId}-all-dots`);
    if (elementsContainer) {
      const nodes = Array.from(elementsContainer.childNodes);
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

  console.log("nodes:", selectableNodes)

  return (
    <>
      <SelectableGraph
        graphId={graphId}
        width={viewWidth}
        height={viewHeight}
        selectableNodes={selectableNodes}
        selectedIndexes={selectedIndexes}
        setSelectedIndexes={setSelectedIndexes}
        nodesDuplicated={false}
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
            data={data}
            directionalData={directionalData}
            selectedIndexes={selectedIndexes}
            handleDotClick={handleDotClick}
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