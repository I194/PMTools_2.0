import React, { FC, useMemo } from "react";
import { DotsData, GraphSettings, MeanDirection, TooltipDot, Reference } from "../../../utils/graphs/types";
import { graphSelectedDotColor } from "../../../utils/ThemeConstants";
import { Axis, Data, Dot } from "../../Common/Graphs";
import axesNamesByReference from "../../../utils/graphs/formatters/stereo/axesNamesByReference";
import { useAppSelector } from "../../../services/store/hooks";
import { IPmdData } from "../../../utils/GlobalTypes";
import { createStraightPath } from "../../../utils/graphs/createPath";
import { generateArc2DForPair, makePairKey } from "../../../utils/graphs/stereoGreatCircle";
import { getOrComputePairPolyline } from "../../../utils/graphs/greatCircleCache";

interface IAxesAndData {
  graphId: string;
  width: number;
  height: number;
  areaConstants: {
    graphAreaMargin: number;
    zeroX: number;
    zeroY: number;
    unit: number;
    unitCount: number;
  };
  dataConstants: {
    labels: Array<string>;
    dotsData: DotsData;
    directionalData: Array<[number, number]>;
    tooltipData: Array<TooltipDot>;
    meanDirection: MeanDirection;
  };
  rawData: IPmdData;
  selectedIDs: Array<number>;
  inInterpretationIDs: Array<number>;
  settings: GraphSettings;
};

const AxesAndData: FC<IAxesAndData> = ({ 
  graphId, width, height,
  areaConstants,
  dataConstants,
  rawData,
  selectedIDs,
  inInterpretationIDs,
  settings,
}) => {

  const {
    graphAreaMargin,
    unit,
    unitCount,
    zeroX,
    zeroY,
  } = areaConstants;

  const {
    directionalData,
    tooltipData,
    labels,
    dotsData,
    meanDirection,
  } = dataConstants;

  const { reference } = useAppSelector(state => state.pcaPageReducer);
  const axesNames = axesNamesByReference(reference);

  // Build GC polyline path (per current reference, but cache per all refs)
  const gcPathD = useMemo(() => {
    if (!settings.dots.connectByGC) return '';
    const graphSize = width / 2;
    const visibleIds = dataConstants.dotsData.map(d => d.id);
    if (visibleIds.length < 2) return '';

    const refs: Reference[] = ['specimen', 'geographic', 'stratigraphic'];

    let combined: Array<[number, number]> = [];
    for (let i = 1; i < visibleIds.length; i++) {
      const a = visibleIds[i - 1];
      const b = visibleIds[i];
      const key = makePairKey(a, b);

      // Precompute for all refs to ensure instant switching later
      refs.forEach((r) => {
        getOrComputePairPolyline(
          rawData,
          graphSize,
          r,
          key,
          () => generateArc2DForPair(rawData, r, graphSize, a, b),
        );
      });

      const seg = getOrComputePairPolyline(
        rawData,
        graphSize,
        reference,
        key,
        () => generateArc2DForPair(rawData, reference, graphSize, a, b),
      );

      if (seg.length === 0) continue;
      if (combined.length === 0) combined.push(...seg);
      else combined.push(...seg.slice(1));
    }

    if (combined.length === 0) return '';
    return createStraightPath(combined);
  }, [settings.dots.connectByGC, width, dataConstants.dotsData, rawData, reference]);

  return (
    <g 
      id={`${graphId}-axes-and-data`}
      transform={`translate(${graphAreaMargin}, ${graphAreaMargin})`}
    >
      <g id={`${graphId}-axes`}>
        <circle 
          id='stereo-circle-axis'
          cx={zeroX} 
          cy={zeroY} 
          r={width/2}
          fill="none"
          stroke="black"
          strokeWidth={1}
        />
        <Axis 
          graphId={graphId}
          type='x'
          name={axesNames.E}
          mirrorName={axesNames.W}
          zero={zeroY}
          length={width}
          unit={unit}
          unitCount={unitCount}
          hideLine={true}
          hideTicks={!settings.area.ticks}
          tickPosition="both"
        />
        <Axis 
          graphId={graphId}
          type='y'
          name={axesNames.N}
          mirrorName={axesNames.S}
          mirrorNamePosition={{x: zeroX, y: height + 15}}
          zero={zeroX}
          length={height}
          unit={unit}
          unitCount={unitCount}
          hideLine={true}
          hideTicks={!settings.area.ticks}
          tickPosition="both"
        />
      </g>
      {/* 
          Создавать маркеры черезе path нельзя, ибо тогда теряется почти весь их функционал
          Добавить слушатель можно только к конкретному элементу по типу <circle />
          Потому лучше отрисовывать отдельно каждый <circle /> через map() массива координат
          Однако hover всё равно работать не будет и потому лучше использовать onMouseOver
          Как раз при этом достигается условие zero-css (я его только что сам придумал, а может и раньше было оно)
      */}
      <g 
        id={`${graphId}-data`}
        transform={
          `
            translate(${width / 2}, ${width / 2})
          `
        }
      >
        {
          settings.dots.connectByGC && gcPathD && (
            <path 
              id={`${graphId}-gc-connections`}
              d={gcPathD}
              fill={'none'}
              stroke={'black'}
              strokeWidth={1}
            />
          )
        }
        <Data 
          graphId={graphId}
          type='all'
          labels={labels}
          data={dotsData}
          connectDots={!settings.dots.connectByGC}
          directionalData={directionalData}
          tooltipData={tooltipData}
          selectedIDs={selectedIDs}
          inInterpretationIDs={inInterpretationIDs}
          dotFillColor='black'
          differentColors={true}
          colorsType="light"
          settings={settings.dots}
        />
        {
          meanDirection &&
          <Dot 
            x={meanDirection.xyData[0]} 
            y={meanDirection.xyData[1]} 
            id={`${graphId}-mean-dot`} 
            type={'mean'}
            annotation={{id: '', label: '', comment: ''}}
            tooltip={meanDirection.tooltip}
            fillColor={meanDirection.dirData[1] > 0 ? graphSelectedDotColor('mean') : 'white'}
            strokeColor={meanDirection.confidenceCircle?.color || 'black'}
            confidenceCircle={meanDirection.confidenceCircle}
            greatCircle={meanDirection.greatCircle}
            settings={settings.dots}
          />
        }
      </g>
    </g>
  )
}

export default AxesAndData
