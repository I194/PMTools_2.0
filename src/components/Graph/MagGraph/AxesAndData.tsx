import React, { FC } from "react";
import { Axis, Data } from "../../Sub/Graphs";

interface IAxesAndData {
  graphId: string;
  graphAreaMargin: number;
  zeroX: number;
  zeroY: number;
  width: number;
  height: number;
  unitX: number;
  unitY: number;
  unitCountX: number;
  unitCountY: number;
  data: Array<[number, number]>;
  maxMAG: number;
  demagnetizationType: string;
  selectedIndexes: Array<number>;
  handleDotClick: (index: number) => void;
}

const AxesAndData: FC<IAxesAndData> = ({ 
  graphId, graphAreaMargin,
  zeroX, zeroY, width, height,
  unitX, unitY, unitCountX, unitCountY,
  data, maxMAG,
  demagnetizationType,
  selectedIndexes,
  handleDotClick
}) => {

  const labelsX = [];
  const labelsY = [];

  for (let i = 0; i <= unitCountX; i++) {
    labelsX.push((i * 100).toString());
  }

  for (let i = unitCountY; i >= 0; i--) {
    labelsY.push((i / 10).toString());
  }

  const axisNameX = demagnetizationType === 'T' ? `°C` : 'nT';

  return (
    <g 
      id={`${graphId}-axes-and-data`}
      transform={`translate(${graphAreaMargin}, ${graphAreaMargin})`}
    >
      <g id={`${graphId}-axes`}>
        <rect 
          id='mag-rect-axis'
          x={0} 
          y={0} 
          width={width}
          height={height}
          fill="none"
          stroke="black"
          strokeWidth={1}
        />
        <Axis 
          graphId={graphId}
          type='x'
          name={axisNameX}
          mirrorNamePosition={{x: -24, y: zeroY + 5}} 
          zero={zeroY}
          length={width}
          unit={unitX}
          unitCount={unitCountX}
          hideLine={true}
          tickPosition="outer"
          labels={labelsX}
        />
        <Axis 
          graphId={graphId}
          type='y'
          name='M/Mmax'
          mirrorName={`Mmax = ${maxMAG} A/m`}
          mirrorNamePosition={{x: zeroX + 80, y: -10}} 
          zero={zeroX}
          length={height}
          unit={unitY}
          unitCount={unitCountY}
          hideLine={true}
          tickPosition="inner"
          labels={labelsY}
          grid={{
            length: width,
            width: 1,
            color: 'black',
            dashArray: [5, 4]
          }}
        />
      </g>
      {/* 
          Создавать маркеры черезе path нельзя, ибо тогда теряется почти весь их функционал
          Добавить слушатель можно только к конкретному элементу по типу <circle />
          Потому лучше отрисовывать отдельно каждый <circle /> через map массива координат
          Однако hover всё равно работать не будет и потому лучше использовать onMouseOver
          Как раз при этом достигается условие zero-css (я его только что сам придумал)
      */}
      <g 
        id={`${graphId}-data`}
      >
        <Data 
          graphId={graphId}
          type='all'
          data={data}
          selectedIndexes={selectedIndexes}
          handleDotClick={handleDotClick}
          dotFillColor='black'
          differentColors={true}
          colorsType="stereo"
        />
      </g>
    </g>
  )
}

export default AxesAndData
