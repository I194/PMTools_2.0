import React, { FC } from "react";
import { DotsData, GraphSettings, TooltipDot } from "../../../utils/graphs/types";
import { Axis, Data } from "../../Sub/Graphs";

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
    dotsData: DotsData;
    labels: Array<string>;
    tooltipData: Array<TooltipDot>;
    maxMAG: number;
    stepLabels: Array<string>;
    demagnetizationType: "thermal" | "alternating field" | undefined;
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
    dotsData, 
    stepLabels, 
    maxMAG,
    tooltipData,
    labels,
    demagnetizationType,
  } = dataConstants;

  const labelsX = stepLabels;
  const labelsY = [];
  
  for (let i = unitCountY; i >= 0; i--) labelsY.push((i / 10).toString());

  const axisNameX = demagnetizationType === 'thermal' ? `°C` : 'mT';

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
          namePosition={{x: width + 15, y: zeroY}}
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
          name='M/Mmax'
          namePosition={{x: zeroX + 10, y: -10}}
          mirrorName={`Mmax = ${maxMAG.toExponential(2).toUpperCase()} A/m`}
          mirrorNamePosition={{x: zeroX + width / 2, y: -10}} 
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
          type='all'
          labels={labels}
          data={dotsData}
          tooltipData={tooltipData}
          selectedIDs={selectedIDs}
          inInterpretationIDs={inInterpretationIDs}
          dotFillColor='black'
          differentColors={true}
          colorsType="stereo"
          settings={settings.dots}
        />
      </g>
    </g>
  )
}

export default AxesAndData
