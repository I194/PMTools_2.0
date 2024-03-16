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
    cdfDotsData: DotsData;
    bootstrapDotsData: Array<DotsData>;
    lowerDotsData: DotsData;
    upperDotsData: DotsData;
    untitlingStartDotsData: DotsData;
    untitlingEndDotsData: DotsData;
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
    cdfDotsData,
    bootstrapDotsData,
    lowerDotsData,
    upperDotsData,
    untitlingStartDotsData,
    untitlingEndDotsData,
  } = dataConstants;

  const labelsX = [-50, -25, 0, 25, 50, 75, 100, 125, 150].map(x => x.toString());
  const labelsY = [];
  
  for (let i = unitCountY; i >= 0; i--) labelsY.push((i / 10).toString());

  const axisNameX = '% Untilting';
  const axisNameY = 'tau_1 (red), unfolding CDF (green)';

  return (
    <g 
      id={`${graphId}-axes-and-data`}
      transform={`translate(${graphAreaMargin}, ${graphAreaMargin})`}
    >
      <g id={`${graphId}-axes`}>
        <rect 
          id='foldTest-rect-axis'
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
        {
          bootstrapDotsData.map((data, index) => (
            <Data
              key={index}
              graphId={graphId}
              type={`bootstrap_${index}`}
              data={data}
              selectedIDs={selectedIDs}
              inInterpretationIDs={inInterpretationIDs}
              dotFillColor='red'
              differentColors={true}
              settings={settings.dots}
              pathStyle={{
                stroke: 'red',
                strokeWidth: 1,
                fill: 'none',
                strokeDasharray: '5, 4'
              }}
              showDots={false}
            />
          ))
        }
        <Data 
          graphId={graphId}
          type='cdf'
          data={cdfDotsData}
          selectedIDs={selectedIDs}
          inInterpretationIDs={inInterpretationIDs}
          dotFillColor='green'
          differentColors={true}
          settings={settings.dots}
          pathStyle={{
            stroke: 'green',
            strokeWidth: 2,
          }}
          showDots={false}
        />
        <Data 
          graphId={graphId}
          type='untitlingStart'
          data={untitlingStartDotsData}
          selectedIDs={selectedIDs}
          inInterpretationIDs={inInterpretationIDs}
          dotFillColor='green'
          differentColors={true}
          settings={settings.dots}
          pathStyle={{
            stroke: 'green',
            strokeWidth: 2,
            fill: 'none',
            strokeDasharray: '5, 4'
          }}
          showDots={false}
        />
        
        <Data 
          graphId={graphId}
          type='untitlingEnd'
          data={untitlingEndDotsData}
          selectedIDs={selectedIDs}
          inInterpretationIDs={inInterpretationIDs}
          dotFillColor='green'
          differentColors={true}
          settings={settings.dots}
          pathStyle={{
            stroke: 'green',
            strokeWidth: 2,
            fill: 'none',
            strokeDasharray: '5, 4'
          }}
          showDots={false}
        />
        <Data 
          graphId={graphId}
          type='lowerBound'
          data={lowerDotsData}
          selectedIDs={selectedIDs}
          inInterpretationIDs={inInterpretationIDs}
          dotFillColor='blue'
          differentColors={true}
          settings={settings.dots}
          pathStyle={{
            stroke: 'blue',
            strokeWidth: 2,
            fill: 'none',
            strokeDasharray: '5, 4'
          }}
          showDots={false}
        />
        <Data 
          graphId={graphId}
          type='upperBound'
          data={upperDotsData}
          selectedIDs={selectedIDs}
          inInterpretationIDs={inInterpretationIDs}
          dotFillColor='blue'
          differentColors={true}
          settings={settings.dots}
          pathStyle={{
            stroke: 'blue',
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
