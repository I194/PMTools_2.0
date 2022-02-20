import React, { FC, useEffect, useRef, useState } from "react";
import styles from './Dot.module.scss';
import { Tooltip } from "../index";
import { ITooltip } from "../Tooltip/Tooltip";
import { TooltipDot } from "../../../../utils/graphs/types";

interface IDot {
  x: number;
  y: number;
  inc?: number;
  dec?: number;
  r?: number;
  id: string;
  tooltip?: TooltipDot;
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
  tooltip,
  onClick,
  selected, 
  showText, 
  fillColor, 
  strokeColor
}) => {

  const dotRef = useRef(null);

  const [tooltipData, setTooltipData] = useState<ITooltip>();
  const [position, setPosition] = useState<{left: number, top: number} | null>(null);
  const [dotElement, setDotElement] = useState<HTMLElement | null>(dotRef.current);

  useEffect(() => {
    setDotElement(dotRef.current);
  }, [dotRef]);

  useEffect(() => {
    if (dotElement) {
      setPosition({
        left: dotElement.getBoundingClientRect().left,
        top: dotElement.getBoundingClientRect().top
      });
    }
  }, [dotElement]);

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
        [
          (showText || selected) &&
          <text 
            id={`${id}__annotation`}
            x={x}
            y={y - 8}
          >
            {id}
          </text>,

          selected && 
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
        ]
      }
      <circle 
        cx={x} 
        cy={y} 
        r={r ? r * 1.5 : 6}
        style={{
          fill: 'transparent', 
          stroke: 'transparent',
        }} 
        onMouseOver={() => handleOver(id)}
        onMouseOut={() => handleOut(id)}
      />
      <circle 
        cx={x} 
        cy={y} 
        r={r ? r : 4}
        id={id}
        ref={dotRef}
        style={{
          fill: fillColor, 
          stroke: strokeColor,
          cursor: 'pointer'
        }} 
        onClick={() => onClick(+id.split('-')[id.split('-').length - 1])}
        onMouseOver={() => handleOver(id)}
        onMouseOut={() => handleOut(id)}
      />
      {
        tooltipData ? 
          <Tooltip
            position={tooltipData.position} 
            isVisible={tooltipData.isVisible} 
            data={tooltip}
          /> 
        : null
      }
    </g>
  )
}

export default Dot;