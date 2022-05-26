import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import styles from "./SelectableGraph.module.scss";
import Selecto from "react-selecto";
import ContextMenu from "../ContextMenu/ContextMenu";
import ExportButton from "../Buttons/ExportButton/ExportButton";
import { Pan, TMenuItem } from "../../../../utils/graphs/types";
import { useAppDispatch, useAppSelector } from "../../../../services/store/hooks";
import { setSelectedStepsIDs } from "../../../../services/reducers/pcaPage";
import { setSelectedDirectionsIDs } from "../../../../services/reducers/dirPage";
import ProjectionSelect from "../Buttons/ProjectionSelect/ProjectionSelect";
import ResetZoomPan from "../Buttons/ResetZoomPan/ResetZoomPan";
import ToggleMean from "../Buttons/ToggleMean/ToggleMean";
import { useLocation } from "react-router-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface ISelectableGraph {
  graphId: string;
  graphName?: string;
  width: number;
  height: number;
  viewBox?: string;
  selectableNodes: ChildNode[];
  nodesDuplicated: boolean;
  menuItems?: Array<TMenuItem>;
  extraID?: string;
  onWheel?: (e: React.WheelEvent<SVGSVGElement>) => void;
  hotkeysListener?: (e: KeyboardEvent) => void;
  currentPan?: Pan;
  currentZoom?: number;
  onResetZoomPan?: () => void;
}

const SelectableGraph: FC<ISelectableGraph> = ({
  children,
  graphId,
  graphName,
  width,
  height,
  viewBox,
  selectableNodes,
  menuItems,
  extraID,
  onWheel,
  hotkeysListener,
  currentPan,
  currentZoom,
  onResetZoomPan,
}) => {

  const dispatch = useAppDispatch();
  const location = useLocation();

  const Viewer = useRef<any>(null);

  useEffect(() => {
    if (Viewer.current) {
      Viewer.current.fitToViewer();
    }
  }, []);

  const { hotkeys, hotkeysActive } = useAppSelector(state => state.appSettingsReducer);
  const currentPage = location.pathname.split('/').pop() || location.pathname;

  const handleDoubleClick = (event: any) => {
    event.preventDefault();
    const timesClicked = event.detail;
    if (timesClicked === 2) dispatch(setSelectedStepsIDs(null));
  };

  const handleHotkeys = useCallback((e: KeyboardEvent) => {
    if (hotkeysListener) hotkeysListener(e);
  }, [currentPan]);

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

  const [dragContainerID, setDragContainerID] = useState<string>('#'+ID);
  const handleIsPanning = (event: KeyboardEvent) => {
    if (event.altKey) setDragContainerID('');
    else setDragContainerID('#'+ID);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleIsPanning);
    window.addEventListener('keyup', handleIsPanning);
    return () => {
      window.removeEventListener('keydown', handleIsPanning);
      window.removeEventListener('keyup', handleIsPanning);
    };
  }, [])

  useEffect(() => {
    if (hotkeysActive) window.addEventListener("keydown", handleHotkeys);
    else window.removeEventListener("keydown", handleHotkeys);
    return () => {
      window.removeEventListener("keydown", handleHotkeys);
    };
  }, [hotkeysActive, hotkeys, currentPan]);

  console.log('drag', dragContainerID)
  
  return (
    <>
      <ContextMenu items={menuItems}>
        {
          graphId === 'zijd' && 
          <>
            <ProjectionSelect />
            <ResetZoomPan 
              onClick={onResetZoomPan!} 
              isUseful={currentZoom! > 1 || currentPan?.left !== 0 || currentPan.top !== 0} 
            />
          </>
        }
        {/* <ExportButton graphId={ID} name={graphName} /> */}
        <ExportButton graphId={`export_${ID}`} name={graphName} />
        <TransformWrapper
          panning={{
            activationKeys: ['Alt'],
          }}
          disabled={graphId === 'zijd'}
        >
          <TransformComponent>
            <svg
              xmlns="http://www.w3.org/2000/svg" 
              version="1.1" 
              width={width} 
              height={height} 
              id={ID} 
              onClick={handleDoubleClick}
              onWheel={onWheel}
              viewBox={viewBox}
            >
              {children}
            </svg>
          </TransformComponent>
        </TransformWrapper>
      </ContextMenu>
      <Selecto
        dragContainer={dragContainerID}
        boundContainer={document.getElementById(ID)}
        selectableTargets={selectableTargets}
        hitRate={100}
        selectByClick={true}
        selectFromInside={true}
        toggleContinueSelect={["shift"]}
        ratio={0}
        dragCondition={() => dragContainerID !== ''}
        onSelectEnd={e => {
          const indexes = new Set(e.selected.map(el => el.id.split('-').pop()));
          const IDs = [...indexes].filter(index => index) as Array<string>;
          if (currentPage === 'pca') {
            dispatch(setSelectedStepsIDs(IDs.map(id => +id)));
          };
          if (currentPage === 'dir') {
            dispatch(setSelectedDirectionsIDs(IDs.map(id => +id)));
          };
        }}
      />
    </>
  )
}

export default SelectableGraph;