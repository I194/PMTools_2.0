import React, { FC } from "react";
import { useAppSelector } from "../../../services/store/hooks";
import projectionByReference from "../../../utils/graphs/formatters/zijd/projectionByReference";
import { DotsData, GraphSettings, PCALines, TooltipDot } from "../../../utils/graphs/types";
import { Axis, Data } from "../../Sub/Graphs";
import { useTheme } from '@mui/material/styles';
import { warningColor } from "../../../utils/ThemeConstants";

interface IAxesAndData {
  graphId: string;
  width: number;
  height: number;
  pan: {left: number, top: number};
  areaConstants: {
    graphAreaMargin: number;
    zeroX: number;
    zeroY: number;
    unit: number;
    unitCount: number;
  };
  dataConstants: {
    labels: Array<string>;
    horizontalProjectionData: DotsData;
    verticalProjectionData: DotsData;
    directionalData: Array<[number, number]>;
    tooltipData: Array<TooltipDot>;
    pcaLines: PCALines;
  };
  inInterpretationIDs: Array<number>;
  selectedIDs: Array<number>;
  settings: GraphSettings;
}

const AxesAndData: FC<IAxesAndData> = ({ 
  graphId, width, height, pan,
  areaConstants, 
  dataConstants,
  selectedIDs,
  inInterpretationIDs,
  settings,
}) => {

  const theme = useTheme();
  
  const {
    graphAreaMargin,
    unit,
    unitCount,
    zeroX,
    zeroY,
  } = areaConstants;

  const { reference, projection } = useAppSelector(state => state.pcaPageReducer);
  const axesLabels = projectionByReference(projection, reference);

  const {
    horizontalProjectionData,
    verticalProjectionData,
    directionalData,
    tooltipData,
    labels,
    pcaLines,
  } = dataConstants;

  return (
    <g 
      id={`${graphId}-axes-and-data`}
      transform={`translate(${graphAreaMargin}, ${graphAreaMargin})`}
      // viewBox={`0 0 ${width} ${height}`}
      // width={width + graphAreaMargin * 2}
      // height={height + graphAreaMargin * 2}
    >
      <g id={`${graphId}-axes`}>
        <Axis 
          graphId={graphId}
          type='x'
          name={axesLabels.x}
          namePosition={{x: width + 20, y: zeroY}}
          zero={zeroY}
          length={width}
          unit={unit}
          unitCount={unitCount}
          tickPosition="both"
          hideTicks={!settings.area.ticks}
        />
        <Axis 
          graphId={graphId}
          type='y'
          name={axesLabels.y}
          zero={zeroX}
          length={height}
          unit={unit}
          unitCount={unitCount}
          tickPosition="both"
          hideTicks={!settings.area.ticks}
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
        transform={`translate(${pan.left}, ${pan.top})`}
      >
        <Data 
          graphId={graphId}
          type='h'
          labels={labels}
          data={horizontalProjectionData}
          directionalData={directionalData}
          tooltipData={tooltipData}
          selectedIDs={selectedIDs}
          inInterpretationIDs={inInterpretationIDs}
          dotHighlightedColor={warningColor(theme.palette.mode)}
          dotFillColor='black'
          settings={settings.dots}
        />
        <Data 
          graphId={graphId}
          type='v'
          labels={labels}
          data={verticalProjectionData}
          directionalData={directionalData}
          tooltipData={tooltipData}
          selectedIDs={selectedIDs}
          inInterpretationIDs={inInterpretationIDs}
          dotHighlightedColor={warningColor(theme.palette.mode)}
          dotFillColor='white'
          settings={settings.dots}
        />
        {
          pcaLines &&
          <g id={`${graphId}-pcaLines`}>
            <line 
              id={`${graphId}-pcaLine-h`} 
              x1={pcaLines.horX[0]} 
              y1={pcaLines.horY[0]} 
              x2={pcaLines.horX[1]} 
              y2={pcaLines.horY[1]} 
              stroke="#9933ff" 
              strokeWidth="1" 
            />
            <line 
              id={`${graphId}-pcaLine-v`} 
              x1={pcaLines.verX[0]} 
              y1={pcaLines.verY[0]} 
              x2={pcaLines.verX[1]} 
              y2={pcaLines.verY[1]} 
              stroke="#119dff" 
              strokeWidth="1" 
            />
          </g>
        }
      </g>
    </g>
  )
}

export default AxesAndData
