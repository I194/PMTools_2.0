import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Box, boxesIntersect } from "react-drag-to-select";
import { MouseSelection } from "..";
import styles from "./SelectableGraph.module.scss";

interface ISelectableGraph {
  graphId: string;
  width: number;
  height: number;
  selectableNodes: ChildNode[];
  selectedIndexes: Array<number>;
  setSelectedIndexes: React.Dispatch<React.SetStateAction<Array<number>>>
  nodesDuplicated: boolean;
}

const SelectableGraph: FC<ISelectableGraph> = ({
  children,
  graphId,
  width,
  height,
  selectableNodes,
  selectedIndexes,
  setSelectedIndexes,
  nodesDuplicated
}) => {
  
  const graphRef = useRef(null);
  const selectableNodesBoxes = useRef<Box[]>([]);

  const [graphElement, setGraphElement] = useState<HTMLElement | Window | null>(graphRef.current);

  useEffect(() => {
    setGraphElement(graphRef.current);
  }, [graphRef]);

  useEffect(() => {
    selectableNodesBoxes.current = [];
    if (selectableNodes) {
      selectableNodes.forEach((item, index) => {
        //@ts-ignore
        const { left, top, width, height } = item.getBoundingClientRect();
        selectableNodesBoxes.current.push({
          left,
          top,
          width,
          height,
        });
      });
    }
  }, [selectableNodes]);

  const handleSelectionChange = useCallback(
    (box: Box) => {
      const indexesToSelect: number[] = [];

      selectableNodesBoxes.current.forEach((item, index) => {
        if (boxesIntersect(box, item)) {
          indexesToSelect.push(
            nodesDuplicated 
              ? index % (selectableNodesBoxes.current.length / 2) 
              : index 
          );
        }
      });
      console.log(nodesDuplicated, indexesToSelect)
      setSelectedIndexes(indexesToSelect);
    }, [selectableNodesBoxes],
  );

  const handleDoubleClick = (event: any) => {
    event.preventDefault();

    const timesClicked = event.detail;
    if (timesClicked === 2) {
      setSelectedIndexes([]);
    }
  }
  
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg" 
        version="1.1" 
        width={width} 
        height={height} 
        id={`${graphId}-graph`} 
        ref={graphRef}
        onClick={handleDoubleClick}
      >
        {children}
      </svg>
      <MouseSelection 
        onSelectionChange={handleSelectionChange} 
        eventsElement={graphElement}
      />
    </>

  )
}

export default SelectableGraph;
