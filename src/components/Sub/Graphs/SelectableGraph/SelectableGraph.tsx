import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import styles from "./SelectableGraph.module.scss";
import { Box, boxesIntersect } from "react-drag-to-select";
// import { Box, boxesIntersect } from "@air/react-drag-to-select";
import { MouseSelection } from "..";
import ContextMenu from "../ContextMenu/ContextMenu";
import ExportButton from "../Buttons/ExportButton/ExportButton";
import { TMenuItem } from "../../../../utils/graphs/types";
import { useAppDispatch } from "../../../../services/store/hooks";
import { setSelectedStepsIDs } from "../../../../services/reducers/pcaPage";

interface ISelectableGraph {
  graphId: string;
  width: number;
  height: number;
  selectableNodes: ChildNode[];
  nodesDuplicated: boolean;
  menuItems?: Array<TMenuItem>;
}

const SelectableGraph: FC<ISelectableGraph> = ({
  children,
  graphId,
  width,
  height,
  selectableNodes,
  nodesDuplicated,
  menuItems
}) => {

  const dispatch = useAppDispatch();

  const graphRef = useRef(null);
  const selectableNodesBoxes = useRef<Box[]>([]);

  const [graphElement, setGraphElement] = useState<HTMLElement | Window | null>(graphRef.current);
  const [selectedIndexes, setSelectedIndexes] = useState<Array<number>>([]);

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
      setSelectedIndexes(indexesToSelect);
    }, [selectableNodesBoxes],
  );

  const onSelectionEnd = useCallback(
    () => {
      const stepsIDs = nodesDuplicated 
          ? selectedIndexes.slice(0, selectedIndexes.length/2).map(index => index + 1)
          : selectedIndexes.map(index => index + 1);
      if (stepsIDs.length > 0) dispatch(setSelectedStepsIDs(stepsIDs));
      else dispatch(setSelectedStepsIDs(null));
    }, [selectedIndexes],
  );

  // const onSelectionEnd = () => {};

  const handleDoubleClick = (event: any) => {
    event.preventDefault();

    const timesClicked = event.detail;
    if (timesClicked === 2) {
      setSelectedIndexes([]);
      dispatch(setSelectedStepsIDs(null));
    }
  };

  return (
    <>
      <ContextMenu items={menuItems}>
        <ExportButton graphId={`${graphId}-graph`} />
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
      </ContextMenu>
      <MouseSelection 
        onSelectionChange={handleSelectionChange} 
        onSelectionEnd={onSelectionEnd}
        eventsElement={graphElement}
      />
    </>

  )
}

export default SelectableGraph;
