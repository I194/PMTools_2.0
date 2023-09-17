import React, { FC } from "react";
import { DotsData, GraphSettings, TooltipDot } from "../../../utils/graphs/types";
import { Axis, Data } from "../../Common/Graphs";

interface IAxesAndData {
  graphId: string;
  width: number;
  height: number;
  areaConstants: {
    graphAreaMargin: number;
    zeroX: number;
    zeroY: number;
    unitX: number;
    unitY: number;
    unitCountX: number;
    unitCountY: number;
  };
  dataConstants: {
    firstCDFDotsData: DotsData;
    secondCDFDotsData: DotsData;
    firstLowerDotsData: DotsData;
    firstUpperDotsData: DotsData;
    secondLowerDotsData: DotsData;
    secondUpperDotsData: DotsData;
    component: 'X' | 'Y' | 'Z'; 
  };
  selectedIDs: Array<number>;
  inInterpretationIDs: Array<number>;
  settings: GraphSettings;
}

const AxesAndData: FC<IAxesAndData> = ({ 
  graphId, width, height,
  areaConstants,
  dataConstants,
  selectedIDs,
  inInterpretationIDs,
  settings,
}) => {

  const {
    graphAreaMargin,
    zeroX,
    zeroY,
    unitX,
    unitY,
    unitCountX,
    unitCountY,
  } = areaConstants;

  const { 
    firstCDFDotsData,
    secondCDFDotsData,
    firstLowerDotsData,
    firstUpperDotsData,
    secondLowerDotsData,
    secondUpperDotsData,
    component,
  } = dataConstants;

  const labelsX = [-1, -0.5, 0, 0.5, 1].map(x => x.toString());
  const labelsY = [1, 0.75, 0.5, 0.25, 0].map(y => y.toString());

  const axisNameX = `${component} component`;
  const axisNameY = 'CDF: normal (blue), reversed (violet)';

  return (
    <g 
      id={`${graphId}-axes-and-data`}
      transform={`translate(${graphAreaMargin}, ${graphAreaMargin})`}
    >
      <g id={`${graphId}-axes`}>
        <rect 
          id='reversalTest-rect-axis'
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
          namePosition={{x: width / 2, y: zeroY + 36}}
          zero={zeroY}
          length={width}
          unit={unitX}
          unitCount={unitCountX}
          hideLine={true}
          hideTicks={!settings.area.ticks}
          tickPosition="outer"
          labels={labelsX}
        />
        <Axis 
          graphId={graphId}
          type='y'
          name={axisNameY}
          namePosition={{x: zeroX + 100, y: -15}}
          zero={zeroX}
          length={height}
          unit={unitY}
          unitCount={unitCountY}
          hideLine={true}
          hideTicks={!settings.area.ticks}
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
          type='cdf'
          data={firstCDFDotsData}
          selectedIDs={selectedIDs}
          inInterpretationIDs={inInterpretationIDs}
          dotFillColor='green'
          differentColors={true}
          settings={settings.dots}
          pathStyle={{
            stroke: '#119dff',
            strokeWidth: 2,
          }}
          showDots={false}
        />
        <Data 
          graphId={graphId}
          type='cdf'
          data={secondCDFDotsData}
          selectedIDs={selectedIDs}
          inInterpretationIDs={inInterpretationIDs}
          dotFillColor='green'
          differentColors={true}
          settings={settings.dots}
          pathStyle={{
            stroke: '#9933ff',
            strokeWidth: 2,
          }}
          showDots={false}
        />
        <Data 
          graphId={graphId}
          type='boundary'
          data={firstLowerDotsData}
          selectedIDs={selectedIDs}
          inInterpretationIDs={inInterpretationIDs}
          dotFillColor='green'
          differentColors={true}
          settings={settings.dots}
          pathStyle={{
            stroke: '#119dff',
            strokeWidth: 2,
            fill: 'none',
            strokeDasharray: '5, 4'
          }}
          showDots={false}
        />
        
        <Data 
          graphId={graphId}
          type='boundary'
          data={firstUpperDotsData}
          selectedIDs={selectedIDs}
          inInterpretationIDs={inInterpretationIDs}
          dotFillColor='green'
          differentColors={true}
          settings={settings.dots}
          pathStyle={{
            stroke: '#119dff',
            strokeWidth: 2,
            fill: 'none',
            strokeDasharray: '5, 4'
          }}
          showDots={false}
        />
        <Data 
          graphId={graphId}
          type='boundary'
          data={secondLowerDotsData}
          selectedIDs={selectedIDs}
          inInterpretationIDs={inInterpretationIDs}
          dotFillColor='blue'
          differentColors={true}
          settings={settings.dots}
          pathStyle={{
            stroke: '#9933ff',
            strokeWidth: 2,
            fill: 'none',
            strokeDasharray: '5, 4'
          }}
          showDots={false}
        />
        <Data 
          graphId={graphId}
          type='boundary'
          data={secondUpperDotsData}
          selectedIDs={selectedIDs}
          inInterpretationIDs={inInterpretationIDs}
          dotFillColor='blue'
          differentColors={true}
          settings={settings.dots}
          pathStyle={{
            stroke: '#9933ff',
            strokeWidth: 2,
            fill: 'none',
            strokeDasharray: '5, 4'
          }}
          showDots={false}
        />
      </g>
    </g>
  )
}

export default AxesAndData
