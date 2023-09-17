import React, { FC, useMemo } from "react";
import styles from "./MagGraph.module.scss";
import { useGraphSelectableNodesPCA, useGraphSelectedIDs, usePMDGraphSettings } from "../../../utils/GlobalHooks";
import { IDirData, IGraph } from "../../../utils/GlobalTypes";
import { IPmdData } from "../../../utils/GlobalTypes";
import dataToMag from "../../../utils/graphs/formatters/mag/dataToMag";
import { SelectableGraph } from "../../Common/Graphs";
import getInterpretationIDs from "../../../utils/graphs/formatters/getInterpretationIDs";
import { useAppSelector } from "../../../services/store/hooks";
import { GraphSettings, TMenuItem } from "../../../utils/graphs/types";

export interface IHGGraph extends IGraph {
  data: IDirData;
  menuSettings: {
    menuItems: TMenuItem[];
    settings: GraphSettings;
  }
}

const HGGraph = ({ graphId, width, height, data, menuSettings }: IHGGraph) => {

  return (
    <>
      {/* <SelectableGraph
        graphId={graphId}
        width={viewWidth}
        height={viewHeight}
        selectableNodes={[]}
        nodesDuplicated={false}
        menuItems={[]}
        extraID={data.metadata.name}
        graphName={`${data.metadata.name}_hg_zoomed`}
      >
        <g>
          <Zoomed_lambert_graph
            center_zone={center_zone}
            dir_list={dir_list}
            angle_list={angle_list}
            grid_points={grid_points}
            points_numb={points_numb}
            sred_dir={sred_dir}
            alpha95={alpha95}
            isvis={isvis}
            isvisgrid={isvisgrid}
            grid_color={grid_color}
            poly_color={poly_color}
            degree_grid_isvis={degree_grid_isvis}
            rumbs_isvis={rumbs_isvis}
          />
        </g>
      </SelectableGraph> */}
    </>
  )
}

export default HGGraph;