import React, { FC } from "react";
import { StringLiteralLike } from "typescript";
import { Dot } from "..";
import { createStraightPath } from "../../../../utils/graphs/createPath";
import { DotsData, DotSettings, DotType, TooltipDot } from "../../../../utils/graphs/types";
import DotTooltip from "../Tooltip/DotTooltip";

interface IData {
  graphId: string;
  type: DotType;
  labels?: Array<string>;
  data: DotsData;
  connectDots?: boolean;
  showDots?: boolean;
  directionalData?: Array<[number, number]>;
  tooltipData?: Array<TooltipDot>;
  selectedIDs: Array<number>;
  inInterpretationIDs: Array<number>;
  dotHighlightedColor?: string;
  dotFillColor: string;
  differentColors?: boolean; 
  pathStyle?: {
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    strokeDasharray?: string;
  };
  colorsType?: 'light' | 'dark';
  settings: DotSettings;
}

const Data: FC<IData> = ({
  graphId,
  type,
  labels,
  data,
  connectDots = true,
  showDots = true,
  directionalData,
  tooltipData,
  selectedIDs,
  inInterpretationIDs,
  dotHighlightedColor,
  dotFillColor,
  differentColors,
  pathStyle,
  colorsType,
  settings,
 }) => {
  
  const colorByType = (
    type: 'light' | 'dark',
    inc: number
  ) => {
    if (type === 'dark') return inc >= 0 ? 'black' : 'white';
    return inc >= 0 ? 'black' : 'white';
  };

  return (
    <g id={`${graphId}-${type}-data`}>
      {
        connectDots &&
        <path 
          id={`${graphId}-${type}-path`}
          d={createStraightPath(data.map(dot => dot.xyData))}
          fill={pathStyle?.fill || 'none'}
          stroke={pathStyle?.stroke || 'black'}
          strokeWidth={pathStyle?.strokeWidth || 1}
          strokeDasharray={pathStyle?.strokeDasharray || 'none'}
        />
      }
      {
        showDots &&
        <g 
          id={`${graphId}-${type}-dots`}
        >
          {
            data.map(({id, xyData, confidenceCircle}, index) => (
              <Dot 
                x={xyData[0]} 
                y={xyData[1]} 
                id={`${graphId}-${type}-dot-${id}`} 
                key={index} 
                type={type}
                annotation={{id: (index + 1).toString(), label: labels ? labels[index] : ''}}
                selected={selectedIDs.includes(id)}
                tooltip={tooltipData ? tooltipData[index] : undefined}
                fillColor={
                  differentColors && colorsType
                    ? colorByType(
                        colorsType, 
                        directionalData ? directionalData[index][1] : 1,
                      )
                    : dotFillColor
                }
                strokeColor={
                  inInterpretationIDs.includes(id) 
                    ? dotHighlightedColor || 'orange' 
                    // : colorsType === 'dark' ? '#119dff' : "black"
                    : "black"
                }
                strokeWidth={
                  inInterpretationIDs.includes(id) 
                    ? 2 
                    : 1
                }
                confidenceCircle={confidenceCircle}
                settings={settings}
              />
            )
          )}
        </g>
      }
    </g>
  )
}

export default Data;
