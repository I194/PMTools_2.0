import React, { FC, useEffect, useMemo, useState } from "react";
import styles from "./ZijdGraph.module.scss";
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { IGraph } from "../../../utils/GlobalTypes";
import { SelectableGraph, GraphSymbols, Unit} from "../../Sub/Graphs";
import AxesAndData from "./AxesAndData";
import { IPmdData } from "../../../utils/files/fileManipulations";
import dataToZijd from "../../../utils/graphs/formatters/dataToZijd";
import { GraphSettings, TMenuItem } from "../../../utils/graphs/types";
import { setSelectedStepsIDs } from "../../../services/reducers/pcaPage";
import { zijdAreaConstants } from "./ZijdConstants";
import { useGraphSelectableNodes, usePMDGraphSettings } from "../../../utils/GlobalHooks";

interface LineCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface IZijdGraph extends IGraph {
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

  const { reference, selectedStepsIDs } = useAppSelector(state => state.pcaPageReducer); 

  const { menuItems, settings } = usePMDGraphSettings();
  const selectableNodes = useGraphSelectableNodes(graphId, true);

  const areaConstants = useMemo(() => zijdAreaConstants(width, height), [width, height]);
  const { viewWidth, viewHeight } = areaConstants; 
  const dataConstants = useMemo(() => dataToZijd(data, width / 2, reference, areaConstants.unitCount), [reference, width]);
  const { unitLabel } = dataConstants; 
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  // проверка на наличие в сторе выбранных шагов (их ID хранятся в selectedStepsIDs)
  useEffect(() => {
    if (selectedStepsIDs) setSelectedIndexes(selectedStepsIDs.map(id => id - 1));
    else setSelectedIndexes([]); 
  }, [selectedStepsIDs]);

  // при нажатии на точку она выбирается
  const handleDotClick = (index: number) => {
    const selectedIndexesUpdated = Array.from(selectedIndexes);

    if (selectedIndexes.includes(index)) {
      selectedIndexesUpdated.splice(
        selectedIndexesUpdated.findIndex((selectedIndex) => selectedIndex === index),
        1
      );
    } else {
      selectedIndexesUpdated.push(index);
    };
    // const stepsIDs = selectedIndexesUpdated.map(index => index + 1);
    // if (stepsIDs.length > 0) dispatch(setSelectedStepsIDs(stepsIDs));
    // else dispatch(setSelectedStepsIDs(null));
    setSelectedIndexes(selectedIndexesUpdated);
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
        nodesDuplicated={true}
        menuItems={menuItems}
      >
        <g>
          <AxesAndData 
            graphId={graphId}
            width={width}
            height={height}
            areaConstants={areaConstants}
            dataConstants={dataConstants}
            selectedIndexes={selectedIndexes}
            handleDotClick={handleDotClick}
            settings={settings}
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