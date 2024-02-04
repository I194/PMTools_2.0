import React, { FC } from "react";
import { StringLiteralLike } from "typescript";
import { Dot } from "..";
import { createStraightPath } from "../../../../utils/graphs/createPath";
import { DotsData, DotSettings, DotType, TooltipDot } from "../../../../utils/graphs/types";
import DotTooltip from "../Tooltip/DotTooltip";

/**
 * Interface for the Data component props.
 * 
 * Note: All positioning is relative to the top-left corner of the SVG element.
 *       All units are in pixels unless otherwise stated.
 */
interface IData {
  /** Unique identifier for the graph containing this data */
  graphId: string;
  
  /** Type of the data (DotType) */
  type: DotType;
  
  /** Optional labels for the data points */
  labels?: Array<string>;
  
  /** Array of data points (DotsData) */
  data: DotsData;
  
  /** Whether to connect the dots with a line */
  connectDots?: boolean;
  
  /** Whether to show individual dots */
  showDots?: boolean;
  
  /** Optional directional data for the dots */
  directionalData?: Array<[number, number]>;
  
  /** Optional tooltip data for the dots */
  tooltipData?: Array<TooltipDot>;
  
  /** IDs of selected dots */
  selectedIDs: Array<number>;
  
  /** IDs of dots in interpretation */
  inInterpretationIDs: Array<number>;
  
  /** Optional custom color for highlighted dots */
  dotHighlightedColor?: string;
  
  /** Default fill color for dots */
  dotFillColor: string;
  
  /** Whether to use different colors for dots */
  differentColors?: boolean;
  
  /** Optional custom style for the connecting path */
  pathStyle?: {
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    strokeDasharray?: string;
  };
  
  /** Light or dark color scheme */
  colorsType?: 'light' | 'dark';
  
  /** General settings for all dots (the Dot component)
   * @param annotations Whether to show annotations.
   * @param tooltips Whether to show tooltips.
   * @param id Whether to display the ID in the annotation.
   * @param label Whether to display the label in the annotation.
   * @param confidenceCircle Whether to render the confidence circle.
   * @param highlightStatistics Whether to render orange highlights
   * @param showGC Whether to render great circles for dirs with 'gc' or 'gcn' code
   */
  settings: DotSettings;
}

/**
 * Data component for rendering a set of data points in a graph.
 * 
 * Note: All positioning is relative to the top-left corner of the SVG element.
 *       All units are in pixels unless otherwise stated.
 * 
 * @param props - The properties of the data.
 * 
 * @returns The rendered Data component.
 */
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
            data.map(({id, xyData, confidenceCircle, greatCircle}, index) => (
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
                  inInterpretationIDs.includes(id) && settings.highlightStatistics
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
                greatCircle={settings.showGC ? greatCircle : undefined}         
              />
            )
          )}
        </g>
      }
    </g>
  )
}

export default Data;
