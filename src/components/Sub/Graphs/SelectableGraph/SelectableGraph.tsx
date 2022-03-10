import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import styles from "./SelectableGraph.module.scss";
import Selecto from "react-selecto";
import ContextMenu from "../ContextMenu/ContextMenu";
import ExportButton from "../Buttons/ExportButton/ExportButton";
import { TMenuItem } from "../../../../utils/graphs/types";
import { useAppDispatch } from "../../../../services/store/hooks";
import { setSelectedStepsIDs } from "../../../../services/reducers/pcaPage";
import ProjectionSelect from "../Buttons/ProjectionSelect/ProjectionSelect";

interface ISelectableGraph {
  graphId: string;
  width: number;
  height: number;
  selectableNodes: ChildNode[];
  nodesDuplicated: boolean;
  menuItems?: Array<TMenuItem>;
  extraID?: string;
}

const SelectableGraph: FC<ISelectableGraph> = ({
  children,
  graphId,
  width,
  height,
  selectableNodes,
  menuItems,
  extraID,
}) => {

  const dispatch = useAppDispatch();

  const handleDoubleClick = (event: any) => {
    event.preventDefault();
    const timesClicked = event.detail;
    if (timesClicked === 2) dispatch(setSelectedStepsIDs(null));
  };

  const [ID, setID] = useState<string>(`${graphId}-graph`);
  const [selectableTargets, setSelectableTargets] = useState<(string | HTMLElement)[]>([]);

  useEffect(() => {
    if (extraID) {
      setID(`${graphId}-graph-${extraID}`);
    };
  }, [extraID]);

  useEffect(() => {
    setSelectableTargets(
      selectableNodes.map(node => document.getElementById((node.lastChild as any).id) || '') 
    );
  }, [selectableNodes]);

  return (
    <>
      <ContextMenu items={menuItems}>
        {
          graphId === 'zijd' && 
          <ProjectionSelect />
        }
        <ExportButton graphId={ID} />
        <svg
          xmlns="http://www.w3.org/2000/svg" 
          version="1.1" 
          width={width} 
          height={height} 
          id={ID} 
          onClick={handleDoubleClick}
        >
          {children}
        </svg>
      </ContextMenu>
      <Selecto
        dragContainer={'#'+ID}
        boundContainer={document.getElementById(ID)}
        selectableTargets={selectableTargets}
        hitRate={100}
        selectByClick={true}
        selectFromInside={true}
        toggleContinueSelect={["shift"]}
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