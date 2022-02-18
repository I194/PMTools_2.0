import React, { FC } from "react";
import { Axis, Data } from "../../Sub/Graphs";

interface IAxesAndData {
  graphId: string;
  graphAreaMargin: number;
  zeroX: number;
  zeroY: number;
  width: number;
  height: number;
  unit: number;
  unitCount: number;
  horizontalProjectionData: Array<[number, number]>;
  verticalProjectionData: Array<[number, number]>;
  directionalData: Array<[number, number]>;
  selectedIndexes: Array<number>;
  handleDotClick: (index: number) => void;
}

const AxesAndData: FC<IAxesAndData> = ({ 
  graphId, graphAreaMargin,
  zeroX, zeroY, width, height, unit, unitCount,
  horizontalProjectionData,
  verticalProjectionData,
  directionalData,
  selectedIndexes,
  handleDotClick
}) => {
  return (
    <g 
      id={`${graphId}-axes-and-data`}
      transform={`translate(${graphAreaMargin}, ${graphAreaMargin})`}
    >
      <g id={`${graphId}-axes`}>
        <Axis 
          graphId={graphId}
          type='x'
          name='N, N'
          zero={zeroY}
          length={width}
          unit={unit}
          unitCount={unitCount}
          tickPosition="both"
        />
        <Axis 
          graphId={graphId}
          type='y'
          name='W, UP'
          namePosition={{x: zeroX - 20, y: -10}}
          zero={zeroX}
          length={height}
          unit={unit}
          unitCount={unitCount}
          tickPosition="both"
        />
      </g>
      {/* 
          Создавать маркеры черезе path нельзя, ибо тогда теряется почти весь их функционал
          Добавить слушатель можно только к конкретному элементу по типу <circle />
          Потому лучше отрисовывать отдельно каждый <circle /> через map массива координат
          Однако hover всё равно работать не будет и потому лучше использовать onMouseOver
          Как раз при этом достигается условие zero-css (я его только что сам придумал)
      */}
      <g id={`${graphId}-data`}>
        <Data 
          graphId={graphId}
          type='h'
          data={horizontalProjectionData}
          directionalData={directionalData}
          selectedIndexes={selectedIndexes}
          handleDotClick={handleDotClick}
          dotFillColor='black'
        />
        <Data 
          graphId={graphId}
          type='v'
          data={verticalProjectionData}
          directionalData={directionalData}
          selectedIndexes={selectedIndexes}
          handleDotClick={handleDotClick}
          dotFillColor='white'
        />
      </g>
    </g>
  )
}

export default AxesAndData
