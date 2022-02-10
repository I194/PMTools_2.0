import React, { FC } from "react";
import styles from './Ticks.module.scss';

interface ITicks {
  axis: 'x' | 'y';
  start: number;
  zero: number;
  interval: number;
  count: number;
  position: 'inner' | 'outer' | 'both';
  labels?: Array<string>;
  grid?: {
    length: number;
    width: number;
    color: string;
    dashArray: Array<number>;
  }
}

const Ticks: FC<ITicks> = ({ 
  axis, 
  start, 
  zero, 
  interval, 
  count,
  position,
  labels,
  grid,
}) => {

  const positionsAcrossAxis = {
    both: {x1: -5, y1: -5, x2: +5, y2: +5},
    inner: {x1: 0, y1: -5, x2: +5, y2: 0},
    outer: {x1: -5, y1: 0, x2: 0, y2: +5},
  }

  const positionsAlongAxis = [];
  for (let i = 0; i <= count; i++) {
    positionsAlongAxis.push(start + interval * i);
  }

  return (
    <g id={`ticks-${axis}`}>
      {
        positionsAlongAxis.map((posAA, index) => {
          return (
            <>
              {
                labels 
                  ? <text
                      x={axis === 'x' ? posAA : zero + positionsAcrossAxis['outer'].x1 * 2}
                      y={axis === 'y' ? posAA + 5 : zero + positionsAcrossAxis['outer'].y2 * 4}
                      text-anchor={axis === 'y' ? 'end' : 'middle'}
                    > 
                      {labels[index]}
                    </text>
                  : null
              }
              <line
                id={`tick-x${index}`}
                x1={axis === 'x' ? posAA : zero + positionsAcrossAxis[position].x1}
                y1={axis === 'y' ? posAA : zero + positionsAcrossAxis[position].y1}
                x2={axis === 'x' ? posAA : zero + positionsAcrossAxis[position].x2}
                y2={axis === 'y' ? posAA : zero + positionsAcrossAxis[position].y2}
                stroke="black"
                strokeWidth={1}
                key={index}
              />
              {
                grid 
                  ? <line
                      id={`grid-x${index}`}
                      x1={axis === 'x' ? posAA : zero}
                      y1={axis === 'y' ? posAA : zero}
                      x2={axis === 'x' ? posAA : zero + grid.length}
                      y2={axis === 'y' ? posAA : zero + grid.length}
                      stroke={grid.color}
                      strokeWidth={grid.width}
                      strokeDasharray={grid.dashArray.join(' ')}
                      key={`${index}-gridline`}
                    />
                  : null
              }
            </>
          )
        })
      }
    </g>
  )
}

export default Ticks;
