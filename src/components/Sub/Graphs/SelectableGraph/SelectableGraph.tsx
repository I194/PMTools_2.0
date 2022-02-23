import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import styles from "./SelectableGraph.module.scss";
import Selecto from "react-selecto";
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

  const [graphElement, setGraphElement] = useState<HTMLElement | Window | null>(graphRef.current);

  useEffect(() => {
    setGraphElement(graphRef.current);
  }, [graphRef]);

  const handleDoubleClick = (event: any) => {
    event.preventDefault();

    const timesClicked = event.detail;
    if (timesClicked === 2) {
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
      <Selecto
        dragContainer={`#${graphId}-graph`}
        selectableTargets={selectableNodes.map(node => document.getElementById((node.lastChild as any).id) || '')}
        hitRate={100}
        selectByClick={true}
        selectFromInside={false}
        continueSelect={true}
        ratio={0}
        onSelectEnd={e => {
          const indexes = new Set(e.selected.map(el => el.id.split('-').pop()));
          const IDs = [...indexes].filter(index => index) as Array<string>;
          dispatch(setSelectedStepsIDs(IDs.map(id => +id + 1)));
        }}
      />
    </>

  )
}

export default SelectableGraph;
