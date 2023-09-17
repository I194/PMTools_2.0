import React, {} from 'react';

import { useTheme } from '@mui/material/styles';
import { Cutoff } from "../utils/GlobalTypes";
import { DotsData, GraphSettings, MeanDirection, TooltipDot } from "../utils/graphs/types";
import { graphSelectedDotColor } from "../utils/ThemeConstants";
import { Axis, Data, Dot } from "../components/Sub/Graphs";


import {
    RotateAroundV,
    PlotCircle,
    make_coords,
    centering,
    poly_contour,
    convertToLambert,
    lambertMass,
    to_center,
    points_dist_2d,
    lambertPoints
} from "./gag_functions";


import AxesAndData from "../components/AppGraphs/StereoGraphDIR/AxesAndData"


interface HGGraph {
    centerZone: number[],
    dirList: number[][],
    angleList: number[],
    gridPoints: number[][],
    meanDir: number[],
    alpha95: number,
    gridColor: string,
    polygonColor: string,
    showGrid: boolean,
    showDegreeGrid: boolean,
    showRumbs: boolean,
    showPolygon: boolean,
}


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
      selectedIDs: Array<number>;
      inInterpretationIDs: Array<number>;
      cutoff?: Cutoff;
      settings: GraphSettings;
    }



export function ZoomedLambertGraph({
    centerZone,
    dirList,
    angleList,
    gridPoints,
    meanDir,
    alpha95,
    gridColor,
    polygonColor,
    showGrid,
    showDegreeGrid,
    showRumbs,
    showPolygon
}: HGGraph) {


    const centerZoneColor = '#2b3bb3';
    let plotPointsCount = 150; 
    let circlesRadius = 0.001;
    let gridRadius = 0.0015;
    let centerZoneRadius = 0.0045;
    let viewBoxSize = '-0.25 -0.25 0.5 0.5'
    // viewBoxSize = '-1 -1 2 2';

    if (angleList[0] == 0) {
      return (
        <div>
          <svg className="svg interface" key={6534324} viewBox={"-1 -1 2 2"} />
        </div>
      );
    }

    //---------------------------------------------------------------------------------------
    // CENTER ZONE
    //---------------------------------------------------------------------------------------
    
    const rotationCenterZone = convertToLambert(to_center(centerZone, meanDir), meanDir);

    //---------------------------------------------------------------------------------------
    // SMALL CIRCLES
    //---------------------------------------------------------------------------------------

    let smallCircles: string[][] = [];
    let circle: string[][] = [];


    for (let i = 0; i < dirList.length; i++) {
        
        circle = lambertPoints(
                        PlotCircle(
                            to_center(dirList[i], meanDir), 
                            angleList[i], 
                            plotPointsCount
                        ), 
                        meanDir
                    );

        smallCircles = smallCircles.concat(circle);
    }
        
    //---------------------------------------------------------------------------------------
    // SPGERAL GRID
    //---------------------------------------------------------------------------------------
    
    let gridPointsCentered = lambertPoints(centering(gridPoints, meanDir), meanDir);

    //---------------------------------------------------------------------------------------
    // POLYGON ZONE
    //---------------------------------------------------------------------------------------
    
    const circlePointsToCalculateCount = 720 * 8;
    let input: [number, number][] = [];
    let circlePoints = [];
    let circlePoint = [];

    for (let i = 0; i < dirList.length; i++) {
          circlePoint = lambertMass(PlotCircle(to_center(dirList[i], meanDir), angleList[i], circlePointsToCalculateCount), meanDir);

        for (let j = 0; j < circlePoint.length; j++){
            circlePoints.push(circlePoint[j]);
        }
    }

    for (let i = 0; i < circlePoints.length; i++) {
        input.push([circlePoints[i][0], circlePoints[i][1]]);
    }

    let polygonPoints2d = poly_contour(input, [rotationCenterZone[0], rotationCenterZone[1]]);
    let polygonPoints3d = [];

    for (let i = 0; i < polygonPoints2d.length; i++) {
        polygonPoints3d.push([polygonPoints2d[i][0], polygonPoints2d[i][1], 1 ]);
    }

    let polygonPoints = make_coords(polygonPoints3d);

    let maxRad = -1;
    for (let i = 0; i < input.length; i++) {
        if (points_dist_2d(rotationCenterZone, input[i]) > maxRad) {
            maxRad = points_dist_2d(rotationCenterZone, input[i]);
        }
    }

    //---------------------------------------------------------------------------------------
    // DEGREE GRID
    //---------------------------------------------------------------------------------------
    
    let degreeGrid = [];

    let point = [1, 0, 0];

    let meridianCount = 18;
    for (let i = 0; i < meridianCount; i++) {
        point = RotateAroundV(point, [0, 1, 0], 360/ meridianCount );
        const meridian = lambertMass(centering(PlotCircle(point, 90, 90), meanDir), meanDir);
        degreeGrid.push(make_coords(meridian));
    }

    let parallelsCount = 18;
    for (let i = 0; i < parallelsCount; i++) {
        const parallel = lambertMass(centering(PlotCircle([0, 1, 0], i * (360 / meridianCount), 90), meanDir), meanDir);
        degreeGrid.push(make_coords(parallel));
    }

    let paralel = lambertMass(PlotCircle([0, 0, 1], 90, 90), meanDir);
    degreeGrid.push(make_coords(paralel));

    //---------------------------------------------------------------------------------------
    // RUMBS
    //---------------------------------------------------------------------------------------
    
    // ToDo: Вообще все тут удалить (что связано с румбами). Происходят какие то непонятные преобразования, хотя стоит лишь
    // взять компонент Axis и настроить его под себя. В качестве примера смотри на 
    // components/AppGraphs/StereoGraphDIR/AxesAndData.tsx

    //---------------------------------------------------------------------------------------
    // making fisher stat
    //---------------------------------------------------------------------------------------

    // ToDo: перейти на использование уже подгтовленных компонентов для графиков, в частности тут надо использовать Dot
    // в этой директории ищи: components/Sub/Graphs/
    // Использование компонента Dot сразу даст тебе и тултип, и круг доверия (он опциональный), и в целом единый стиль со всем приложением

    //---------------------------------------------------------------------------------------
    // making alpha95 circle
    //---------------------------------------------------------------------------------------
    
    // ToDo: убрать, как только заменишь на Dot (см. выше)

    //---------------------------------------------------------------------------------------
    // RETURN
    //---------------------------------------------------------------------------------------
    
    return (
        <svg className="graph_interface" viewBox={ viewBoxSize }>

            {/* Градусная сетка */}
            { showDegreeGrid && degreeGrid.map((circles) => (
                <polyline 
                    points={ circles } 
                    stroke={ "grey" }
                    fill={'none'}
                    strokeWidth={"0.0005px"} 
                />
            ))}

            {/* Закраска зоны пересечения кругов */}
            { showPolygon && 
                <polygon 
                    points={ polygonPoints } 
                    fill={ polygonColor } 
                />
            }

            {/* Спиральный грид в зоне пересечения */}
            { showGrid && gridPointsCentered.map((gridPoints) => (
                <circle
                    r={ gridRadius }
                    cx={ gridPoints[0] }
                    cy={ gridPoints[1] }
                    fill={ gridColor }
                />
            ))}

            {/* Круги вокруг палеонаправлений */}
            { smallCircles.map((circles) => (
                <circle 
                    r={ circlesRadius } 
                    cx={ circles[0] } 
                    cy={ circles[1] } 
                    fill={"black"}

                />
            ))}    
     
            {/* Истинное направление по фишеру (удалю когда сравню результаты) */}
            <circle
                r={0.0035}
                cx={ to_center(meanDir, meanDir)[0] }
                cy={ to_center(meanDir, meanDir)[1] }
                fill={'red'}
            />

            {/* Круг альфа 95 */}
            <polyline 
                points={ make_coords(PlotCircle([0, 0, 1], alpha95, 90)) } 
                stroke={ "red" }
                fill={'none'}
                strokeWidth={"0.0016px"} 
                strokeDasharray={"0.01px, 0.003px"}
            />

            {/* Истинное направление по Хохлову */}
            <circle 
                r={ centerZoneRadius } 
                cx={ rotationCenterZone[0] }
                cy={ rotationCenterZone[1] }
                fill={ centerZoneColor }
            />


            {/* <AxesAndData 
              graphId={'54325432543'}
              width={0.5}
              height={0.5}
              areaConstants={}
              dataConstants={}
              selectedIDs={}
              inInterpretationIDs={}
              cutoff={}
              settings={}
            /> */}

        </svg>
    );
}



    




















