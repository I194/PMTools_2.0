import React, { FC, useState } from "react";
import styles from "./GraphSymbols.module.scss";
import { Dot } from "../index";

interface ISymbolRow {
  title: string;
  sourceId: string;
  disabled?: boolean;
  fill: string;
  x: number;
  y: number;
}

const SymbolRow: FC<ISymbolRow> = ({title, sourceId, disabled, fill, x, y}) => {

  const [sourceIsVisible, setSoruceVisibility] = useState(true);

  const handleClick = () => {
    setSoruceVisibility(!sourceIsVisible);
    const source = document.getElementById(sourceId);
    if (source) {
      source.style.setProperty(
        'display', 
        !sourceIsVisible ? 'block' : 'none' // '!' because state change takes some time and we can't wait 'til it's happens
      ); 
    }
  }

  const handleOver = () => {
    const source = document.getElementById(sourceId);
    if (source) {
      // console.log(source.childNodes[0])
      (source.childNodes[0] as HTMLElement).style.setProperty(
        'filter', 
        "url(#double)"
      ); 
    }
  }

  const handleOut = () => {
    const source = document.getElementById(sourceId);
    if (source) {
      (source.childNodes[0] as HTMLElement).style.setProperty(
        'filter', 
        'none'
      ); 
    }
  }

  const doNothing = () => {};
 
  return (
    <g 
      id={title} 
      onMouseOver={disabled ? doNothing : handleOver}
      onMouseOut={disabled ? doNothing : handleOut}
      onClick={disabled ? doNothing : handleClick}
      cursor={disabled ? 'default' : 'pointer'}
    >
      <circle id={`symbol-${title}`} fill={fill} stroke="black" r={4} cx={x} cy={y}/>
      <text id={`title-${title}`} x={x + 10} y={y + 4}>{title}</text>
      <filter id="double">
        <feMorphology in="SourceGraphic" result="a" operator="dilate" radius="0.5" />
        <feComposite in="SourceGraphic" in2="a" result="xx" operator="xor" />
      </filter>
    </g>
  )
}

interface IGraphSymbols {
  title1?: string;
  id1?: string;
  title2?: string;
  id2?: string;
  disabled?: boolean;
  viewWidth: number;
  viewHeight: number;
}

const GraphSymbols: FC<IGraphSymbols> = ({
  title1, 
  id1, 
  title2, 
  id2, 
  disabled,
  viewWidth, 
  viewHeight
}) => {
  return (
    <g 
      id='graph-symbols' 
      transform={`translate(${20}, ${viewHeight - 45})`}
    >
      {
        title1 && id1 &&
        <SymbolRow title={title1} sourceId={id1} fill='black' x={10} y={10} disabled={disabled}/> 
      }
      {
        title2 && id2 &&
        <SymbolRow title={title2} sourceId={id2} fill='white' x={10} y={30} disabled={disabled}/>
      }
    </g>
  )
}

export default GraphSymbols;