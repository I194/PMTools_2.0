import React, { FC, useState } from "react";
import styles from './Dot.module.scss';
import { Tooltip } from "../index";
import { ITooltip } from "../Tooltip/Tooltip";

interface IDot {
  x: number;
  y: number;
  inc?: number;
  dec?: number;
  r?: number;
  id: string;
  selected?: boolean;
  onClick: (index: number) => void;
  showText?: boolean;
  fillColor: string;
  strokeColor: string;
}

const Dot: FC<IDot> = ({
  x, 
  y, 
  inc,
  dec,
  r, 
  id, 
  onClick,
  selected, 
  showText, 
  fillColor, 
  strokeColor
}) => {

  const [tooltipData, setTooltipData] = useState<ITooltip>();

  const handleOver = (id: string) => {
    const dot = document.getElementById(id);
    if (dot) {
      dot.style.setProperty('fill', 'orange');
      setTooltipData({
        isVisible: true,
        position: {
          left: dot.getBoundingClientRect().left,
          top: dot.getBoundingClientRect().top
        },
        dot: {
          id,
          x,
          y,
          inc,
          dec,
        }
      })
    }
  }

  const handleOut = (id: string) => {
    const dot = document.getElementById(id);
    if (dot) {
      setTooltipData(undefined);
      dot.style.setProperty('fill', fillColor);
    }
  }

  return (
    <g>
      {
        showText || selected ?
        <text 
          id={`${id}__annotation`}
          x={x}
          y={y - 8}
        >
          {id}
        </text>
        : null
      }
      { selected ? 
        <circle
          cx={x} 
          cy={y} 
          r={r ? r + 2 : 6}
          id={`${id}__selection`}
          style={{
            fill: 'purple', 
            stroke: 'purple',
            opacity: '50%',
          }} 
        />
        : null
      }
      <circle 
        cx={x} 
        cy={y} 
        r={r ? r : 4}
        id={id}
        style={{
          fill: fillColor, 
          stroke: strokeColor,
          cursor: 'pointer'
        }} 
        className={styles.dot}
        onClick={() => onClick(+id.split('-')[id.split('-').length - 1])}
        onMouseOver={() => handleOver(id)}
        onMouseOut={() => handleOut(id)}
      />
      {
        tooltipData ? 
          <Tooltip
            position={tooltipData.position} 
            isVisible={tooltipData.isVisible} 
            dot={tooltipData.dot}
          /> 
        : null
      }
    </g>
  )
}

export default Dot;