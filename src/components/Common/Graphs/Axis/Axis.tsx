import React, { FC } from "react"
import { Ticks } from ".."

/**
 * Interface for the Axis component props.
 * 
 * Note: All positioning is relative to the top-left corner of the SVG element.
 *       All units are in pixels unless otherwise stated.
 */
interface IAxis {
  /** Unique identifier for the graph containing this axis */
  graphId: string;
  
  /** Type of the axis ('x' or 'y') */
  type: 'x' | 'y';
  
  /**
   * Optional offset for the axis.
   */
  offset?: { x: number, y: number };
  
  /** Name displayed along the axis */
  name: string;
  
  /**
   * Optional custom position for the axis name.
   */
  namePosition?: { x: number, y: number };
  
  /** Optional mirrored name displayed along the axis */
  mirrorName?: string;
  
  /** Optional custom position for the mirrored axis name */
  mirrorNamePosition?: { x: number, y: number };
  
  /** Zero point for the axis */
  zero: number;
  
  /** Length of the axis */
  length: number;
  
  /** Unit length between ticks */
  unit: number;
  
  /** Number of units (ticks) on the axis */
  unitCount: number;
  
  /** Whether to hide the axis line */
  hideLine?: boolean;
  
  /** Whether to hide ticks */
  hideTicks?: boolean;
  
  /** Position of ticks ('inner', 'outer', 'both') */
  tickPosition: 'inner' | 'outer' | 'both';
  
  /** Optional custom labels for ticks */
  labels?: Array<string>;
  
  /** Optional grid settings */
  grid?: {
    length: number;
    width: number;
    color: string;
    dashArray: Array<number>;
  };
}

/**
 * Axis component for rendering axes in a graph.
 * 
 * Note: All positioning is relative to the top-left corner of the SVG element.
 *       All units are in pixels unless otherwise stated.
 * 
 * @param props - The properties of the axis.
 * 
 * @returns The rendered Axis component.
 */
const Axis: FC<IAxis> = ({ 
  graphId, 
  type,
  offset,
  name,
  namePosition,
  mirrorName,
  mirrorNamePosition,
  zero, 
  length, 
  unit,
  unitCount,
  hideLine,
  hideTicks,
  tickPosition,
  labels,
  grid,
}) => {

  const axisPos = {
    x: {
      x1: 0,
      y1: zero,
      x2: length,
      y2: zero,
      text: {
        x: length + 10,
        y: zero,
        xMirror: -10,
        yMirror: zero
      }
    },
    y: {
      x1: zero,
      y1: 0,
      x2: zero,
      y2: length,
      text: {
        x: zero,
        y: -10,
        xMirror: zero,
        yMirror: length + 10
      }
    }
  }

  return (
    <g 
      id={`${graphId}-${type}-axis`}
      transform={
        `
          translate(${offset?.x || 0}, ${offset?.y || 0})
        `
      }
    >
      {
        hideLine 
          ? null
          : <line 
              id={`${graphId}-${type}-line`} 
              x1={axisPos[type].x1} 
              y1={axisPos[type].y1} 
              x2={axisPos[type].x2} 
              y2={axisPos[type].y2} 
              stroke="black" 
              strokeWidth="1" 
            />
      }
      {
        hideTicks
          ? null
          : <Ticks 
              axis={type} 
              start={0} 
              zero={zero} 
              interval={unit} 
              count={unitCount}
              position={tickPosition}
              labels={labels}
              grid={grid}
            />
      }
      <text 
        id={`${graphId}-${type}-name`} 
        x={ namePosition ? namePosition.x : axisPos[type].text.x } 
        y={ namePosition ? namePosition.y : axisPos[type].text.y }
        textAnchor='middle' // Horizontal alignment
        alignmentBaseline="middle" // Vertical alignment, doesn't work in CorelDraw and Inkscape
        fontSize={'16px'}
      >
        {name}
      </text>
      {
        mirrorName
          ? <text 
              id={`${graphId}-${type}-name`} 
              x={ mirrorNamePosition ? mirrorNamePosition.x : axisPos[type].text.xMirror } 
              y={ mirrorNamePosition ? mirrorNamePosition.y : axisPos[type].text.yMirror }
              textAnchor='middle' // Horizontal alignment
              alignmentBaseline="middle" // Vertical alignment, doesn't work in CorelDraw and Inkscape
              fontSize={'16px'}
            >
              {mirrorName}
            </text>
          : null
      }
    </g>
  ) 
}

export default Axis;
