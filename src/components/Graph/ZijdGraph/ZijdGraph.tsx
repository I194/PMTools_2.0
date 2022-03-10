import React, { FC, useMemo } from "react";
import styles from "./ZijdGraph.module.scss";
import { useAppSelector } from '../../../services/store/hooks';
import { useGraphSelectableNodes, useGraphSelectedIndexes, usePMDGraphSettings } from "../../../utils/GlobalHooks";
import { IGraph } from "../../../utils/GlobalTypes";
import { IPmdData } from "../../../utils/GlobalTypes";
import dataToZijd from "../../../utils/graphs/formatters/zijd/dataToZijd";
import { SelectableGraph, GraphSymbols, Unit} from "../../Sub/Graphs";
import { zijdAreaConstants } from "./ZijdConstants";
import AxesAndData from "./AxesAndData";
import getInterpretationIndexes from "../../../utils/graphs/formatters/getInterpretationIndexes";

export interface IZijdGraph extends IGraph {
  data: IPmdData;
}

const ZijdGraph: FC<IZijdGraph> = ({ graphId, width, height, data }) => {

  // ToDo: 
  // 1. менять viewBox в зависимости от размера группы data (horizontal-data + vertical-data) || STOPPED
  // 2. zoom&pan

  const { reference, projection, currentInterpretation } = useAppSelector(state => state.pcaPageReducer); 
  const { menuItems, settings } = usePMDGraphSettings();
  const selectableNodes = useGraphSelectableNodes(graphId, true);
  const selectedIndexes = useGraphSelectedIndexes();

  const { viewWidth, viewHeight, ...areaConstants} = useMemo(() => zijdAreaConstants(width, height), [width, height]);
  const { unitLabel, ...dataConstants } = useMemo(
    () => dataToZijd(data, width / 2, reference, projection, areaConstants.unitCount, currentInterpretation?.rawData),
  [reference, projection, width, currentInterpretation, data]);

  const inInterpretationIndexes = getInterpretationIndexes(currentInterpretation, data);

  return (
    <>
      <SelectableGraph
        graphId={graphId}
        width={viewWidth}
        height={viewHeight}
        selectableNodes={selectableNodes}
        nodesDuplicated={true}
        menuItems={menuItems}
        extraID={data.metadata.name}
      >
        <g>
          <AxesAndData 
            graphId={graphId}
            width={width}
            height={height}
            areaConstants={areaConstants}
            dataConstants={dataConstants}
            selectedIndexes={selectedIndexes}
            inInterpretationIndexes={inInterpretationIndexes}
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