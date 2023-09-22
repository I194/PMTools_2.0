import React, {} from 'react';

import { useTheme } from '@mui/material/styles';
import { Cutoff } from "../utils/GlobalTypes";
import { DotsData, GraphSettings, MeanDirection, TooltipDot } from "../utils/graphs/types";
import { graphSelectedDotColor } from "../utils/ThemeConstants";
import { Axis, Data, Dot } from "../components/Common/Graphs";
import { DegreeGrid } from "../gag_components/degreeGrid";


// import Graphs from '../pages/DIRPage/Graphs';
// import { Rumbs } from "./rumbs";


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
    getViewBoxSize,
    getPointSize
} from "./gag_functions";





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

    let ram: number = 0.5;
    dirList = centering(dirList, meanDir);

    let viewBoxSize = getViewBoxSize(dirList, angleList, meanDir, -ram / 2);
    

    let circlesRadius = getPointSize(viewBoxSize);
    let gridRadius = circlesRadius;
    let centerZoneRadius = 3 * circlesRadius;
    let fisherRadius = 0.02;
    let alphaCircleWidth = 1.5 * circlesRadius;



    // to see all sphere
    let fullViewBoxSize = "-1.2 -1.2 2.4 2.4"

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

    let smallCircles: number[][] = [];
    let circle: number[][] = [];

    for (let i = 0; i < dirList.length; i++) {
        
        circle = lambertMass(
                        PlotCircle(
                            dirList[i], 
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
    
    let gridPointsCentered = lambertMass(centering(gridPoints, meanDir), meanDir);

    //---------------------------------------------------------------------------------------
    // POLYGON ZONE
    //---------------------------------------------------------------------------------------
    
    const circlePointsToCalculateCount = 720 * 8;
    let input: [number, number][] = [];
    let circlePoints = [];
    let circlePoint = [];

    for (let i = 0; i < dirList.length; i++) {
          circlePoint = lambertMass(
                            PlotCircle(
                                dirList[i], 
                                angleList[i], 
                                circlePointsToCalculateCount
                            ), 
                            meanDir
                        );

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
    // RUMBS
    //---------------------------------------------------------------------------------------
    
    // ToDo: Вообще все тут удалить (что связано с румбами). Происходят 
    // какие то непонятные преобразования, хотя стоит лишь
    // взять компонент Axis и настроить его под себя. В качестве 
    // примера смотри на 
    // components/AppGraphs/StereoGraphDIR/AxesAndData.tsx

    //---------------------------------------------------------------------------------------
    // making fisher stat
    //---------------------------------------------------------------------------------------

    // ToDo: перейти на использование уже подгтовленных компонентов для графиков, 
    // в частности тут надо использовать Dot
    // в этой директории ищи: components/Sub/Graphs/
    // Использование компонента Dot сразу даст тебе и тултип, и 
    // круг доверия (он опциональный), и в целом единый стиль со всем приложением


    //---------------------------------------------------------------------------------------
    // RETURN
    //---------------------------------------------------------------------------------------
    
    return (
        <svg className="graph_interface" viewBox={ fullViewBoxSize }>

            {/* Градусная сетка */}
            { showDegreeGrid && 
                <DegreeGrid
                    viewBoxSize={fullViewBoxSize}
                    meridianCount={18}
                    parallelsCount={18}
                    meanDir={meanDir}
                />
            }
                         
            {/* Закраска зоны пересечения кругов */}
            {/* { showPolygon && 
                <polygon 
                    points={ polygonPoints } 
                    fill={ polygonColor } 
                />
            } */}

            {/* Спиральный грид в зоне пересечения */}
            {/* { showGrid && gridPointsCentered.map((gridPoints) => (
                <Dot 
                    x={gridPoints[0]} 
                    y={gridPoints[1]} 
                    r={gridRadius}
                    id={'1'} 
                    type={'mean'}
                    annotation={{id: '', label: ''}}
                    fillColor={gridColor}
                    strokeColor={'purple'}
                    strokeWidth={0}
                />
            ))} */}



            {/* Круги вокруг палеонаправлений */}
            {/* { smallCircles.map((circles) => (
                <Dot 
                    x={circles[0]} 
                    y={circles[1]} 
                    r={circlesRadius}
                    id={'1'} 
                    type={'mean'}
                    annotation={{id: '', label: ''}}
                    fillColor={"black"}
                    strokeColor={'purple'}
                    strokeWidth={0}
                />
            ))}     */}
     
            {/* Истинное направление по фишеру (удалю когда сравню результаты) */}
            <Dot 
                x={to_center(meanDir, meanDir)[0]} 
                y={to_center(meanDir, meanDir)[1]} 
                r={fisherRadius}
                id={'1'} 
                type={'mean'}
                annotation={{id: '', label: ''}}
                fillColor={'red'}
                strokeColor={'purple'}
                strokeWidth={0}
            />


            {/* Круг альфа 95 */}
            {/* <polyline 
                points={ make_coords(PlotCircle([0, 0, 1], alpha95, 90)) } 
                stroke={ "red" }
                fill={'none'}
                strokeWidth={alphaCircleWidth} 
                strokeDasharray={"0.01px, 0.003px"}
            /> */}

            {/* Истинное направление по Хохлову */}
            {/* <Dot 
                x={rotationCenterZone[0]} 
                y={rotationCenterZone[1]} 
                r={centerZoneRadius}
                id={'1'} 
                type={'mean'}
                annotation={{id: '', label: ''}}
                fillColor={centerZoneColor}
                strokeColor={'purple'}
                strokeWidth={0}
            /> */}

        </svg>
    );
}



    




















