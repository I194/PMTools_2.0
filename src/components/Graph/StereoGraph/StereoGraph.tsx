import React, { FC, useEffect, useState } from "react";
import styles from "./ZijdGraph.module.scss";
import { IGraph } from "../../../utils/GlobalTypes";
import { SelectableGraph, GraphSymbols, Unit} from "../../Sub/Graphs";
import { dirToCartesian2D } from "../../../utils/graphs/dirToCartesian";
import AxesAndData from "./AxesAndData";
import { IPmdData } from "../../../utils/files/fileManipulations";
import { useAppSelector } from "../../../services/store/hooks";
import dataToStereoPMD from "../../../utils/graphs/formatters/dataToStereoPMD";

interface IStereoGraph extends IGraph {
  width: number;
  height: number;
  data: IPmdData;
}

const StereoGraph: FC<IStereoGraph> = ({ graphId, width, height, data }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan
  // 3. починить отображение цвета точек - проблема сейчас в том, что не считывается корректно inc (считывается y)
  //    то есть вообще надо уже начать работать с нормальной моделью данных, а не с выдуманным массивом [][]

  const { reference } = useAppSelector(state => state.pcaPageReducer); 

  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [selectableNodes, setSelectableNodes] = useState<ChildNode[]>([]);

  const { directionalData, xyData } = dataToStereoPMD(data, width / 2, reference);

  const graphAreaMargin = 40;
  const viewWidth = width + graphAreaMargin * 2;
  const viewHeight = height + graphAreaMargin * 2;

  const unit = (width / 18);
  const unitCount = 18;
  const zeroX = (width / 2);
  const zeroY = (height / 2);

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
            data={xyData}
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