import React, { FC } from "react"
import { Ticks } from ".."

interface IAxis {
  graphId: string;
  type: 'x' | 'y';
  offset?: {x: number, y: number};
  name: string;
  namePosition?: {x: number, y: number};
  mirrorName?: string;
  mirrorNamePosition?: {x: number, y: number};
  zero: number;
  length: number;
  unit: number;
  unitCount: number;
  hideLine?: boolean;
  hideTicks?: boolean;
  tickPosition: 'inner' | 'outer' | 'both';
  labels?: Array<string>;
  grid?: {
    length: number;
    width: number;
    color: string;
    dashArray: Array<number>;
  }
}

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
        y: zero + 5,
        xMirror: -20,
        yMirror: zero + 4
      }
    },
    y: {
      x1: zero,
      y1: 0,
      x2: zero,
      y2: length,
      text: {
        x: zero - 6,
        y: -10,
        xMirror: zero - 6,
        yMirror: length + 20
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
      >
        {name}
      </text>
      {
        mirrorName
          ? <text 
              id={`${graphId}-${type}-name`} 
              x={ mirrorNamePosition ? mirrorNamePosition.x : axisPos[type].text.xMirror } 
              y={ mirrorNamePosition ? mirrorNamePosition.y : axisPos[type].text.yMirror }
            >
              {mirrorName}
            </text>
          : null
      }
    </g>
  ) 
}

export default Axis;
