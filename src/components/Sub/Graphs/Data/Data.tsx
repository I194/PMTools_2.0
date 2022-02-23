import React, { FC } from "react";
import { Dot } from "..";
import { createStraightPath } from "../../../../utils/graphs/createPath";
import { DotSettings, TooltipDot } from "../../../../utils/graphs/types";
import DotTooltip from "../Tooltip/DotTooltip";

interface IData {
  graphId: string;
  type: string;
  labels?: Array<string>;
  data: Array<[number, number]>;
  directionalData?: Array<[number, number]>;
  tooltipData?: Array<TooltipDot>;
  selectedIndexes: Array<number>;
  dotFillColor: string;
  differentColors?: boolean; 
  colorsType?: 'stereo' | 'colouredStereo';
  settings: DotSettings;
}

const Data: FC<IData> = ({
  graphId,
  type,
  labels,
  data,
  directionalData,
  tooltipData,
  selectedIndexes,
  dotFillColor,
  differentColors,
  colorsType,
  settings,
 }) => {
  
  const colorByType = (
    type: 'stereo' | 'colouredStereo',
    xy: [number, number],
    dec: number,
    inc: number,
    index: number
  ) => {
    if (type === 'stereo') return inc >= 0 ? 'black' : 'white';
    if (type === 'colouredStereo') return inc >= 0 ? 'red' : 'blue';
    return 'black';
  };

  return (
    <g id={`${graphId}-${type}-data`}>
      <path 
        id={`${graphId}-${type}-path`}
        d={createStraightPath(data)}
        fill="none" 
        stroke="black" 
      />
      <g 
        id={`${graphId}-${type}-dots`}
      >
        {
          data.map((xy, index) => (
            <Dot 
              x={xy[0]} 
              y={xy[1]} 
              id={`${graphId}-${type}-dot-${index}`} 
              annotation={{id: (index + 1).toString(), label: labels ? labels[index] : ''}}
              key={index} 
              selected={selectedIndexes.includes(index)}
              tooltip={tooltipData ? tooltipData[index] : undefined}
              fillColor={
                differentColors && colorsType
                  ? colorByType(
                      colorsType, 
                      xy, 
                      directionalData ? directionalData[index][0] : 1, 
                      directionalData ? directionalData[index][1] : 1,
                      index
                    )
                  : dotFillColor
              }
              strokeColor="black"
              settings={settings}
            />
          )
        )}
      </g>
    </g>
  )
}

export default Data;
