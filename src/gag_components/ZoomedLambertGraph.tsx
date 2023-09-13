import React, {createElement, useState} from 'react';
import {
    GeoVdek,
    getRandomfloat,
    NormalizeV,
    RotateAroundV,
    angle_between_v,
    PlotCircle,
    make_coords,
    get_perp,
    centering,
    poly_contour,
    zone_square,
    convexHull,
    convertToLambert,
    lambertMass,
    to_center,
    points_dist_2d,
    to_new_basis,
    to_new_basis_mass
} from "./gag_functions";

interface HGGraph {
    centerZone: number[],
    dirList: number[][],
    angleList: number[],
    gridPoints: number[][],
    pointsCount: number,
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
    pointsCount,
    meanDir,
    alpha95,
    gridColor,
    polygonColor,
    showGrid,
    showDegreeGrid,
    showRumbs,
    showPolygon
}: HGGraph) {
    const centerZoneColor = '#4054E7';
    // ToDo: понять, зачем передается проп pointsCount, если есть внутренняя переменная plotPointsCount. 
    // От чего то одного надо отказаться
    let plotPointsCount = 170; 
    let circlesRadius = 0.0025;
    let gridRadius = 0.0015;
    let centerZoneRadius = 0.003;


    if (angleList[0] == 0) {
      return (
        <div>
          <svg className="svg interface" key={6534324} viewBox={"-1 -1 2 2"} />
        </div>
      );
    }

    //-----------------------------------------------------------------
    // making center zone for drawing on lambert svg
    //-----------------------------------------------------------------
    
    const rotationCenterZone = convertToLambert(to_center(centerZone, meanDir), meanDir);

    //-----------------------------------------------------------------
    // add coords of circles around paleo dirs for lambert svg
    //-----------------------------------------------------------------

    // ToDo: либо переименовать, либо дать короткую документацию к этим переменным. После чтения кода всего этого компонента 
    // общего понимания зачем эти переменные и причем тут именно такие числа так и не пришло. 
    let yMax = 1000000;
    let yMin = 1000000;
    let xMax = 1000000;
    let xMin = 1000000;



    for (let i = 0; i < dirList.length; i++) {
        const dirCircle = PlotCircle(to_center(dirList[i], meanDir), angleList[i], plotPointsCount);

        for (let j = 0; j < dirCircle.length; j++) {
            if (xMax != 1000000 && xMin != 1000000 && yMax != 1000000 && yMin != 1000000) {
                if (dirCircle[j][0] > xMax) {
                    xMax = dirCircle[j][0];
                }
                if (dirCircle[j][0] < xMin) {
                    xMin = dirCircle[j][0];
                }
                if (dirCircle[j][1] > yMax) {
                    yMax = dirCircle[j][1];
                }
                if (dirCircle[j][1] < yMin) {
                    yMin = dirCircle[j][1];
                }
            } else {
                xMin = dirCircle[j][0];
                xMax = dirCircle[j][0];
                yMin = dirCircle[j][1];
                yMax = dirCircle[j][1];
            }
        }
    }

    // Собственно, и эта махинация непонятна. Вероятно как раз потому, что непонятны переменные xMax, yMax, ...
    circlesRadius = (yMax - yMin) / 400;
    gridRadius = (yMax - yMin) / 400;


    //-----------------------------------------------------------------
    // add coords of circles around paleo dirs for lambert svg
    //-----------------------------------------------------------------
    let smallCircles: string[] = [];
    for (let i = 0; i < dirList.length; i++) {
        smallCircles.push(
            make_coords(
                lambertMass(
                    PlotCircle(
                        to_center(dirList[i], meanDir), 
                        angleList[i], 
                        plotPointsCount
                    ), 
                    meanDir
                )
            )
        );
    }

    //-----------------------------------------------------------------
    // making grid on left svg
    //-----------------------------------------------------------------
    
    let gridPointsCentered = lambertMass(centering(gridPoints, meanDir), meanDir);
    const grid = [];

    for (let i = 0; i < gridPointsCentered.length; i++) {
        grid.push(
            createElement(
                'circle',
                {


                    r: gridRadius,
                    cx: String(gridPointsCentered[i][0]),
                    cy: String(gridPointsCentered[i][1]),
                    fill: gridColor,
                }, ''
            )
        );

    }



    //-----------------------------------------------------------------
    // making fisher stat
    //-----------------------------------------------------------------

    // ToDo: перейти на использование уже подгтовленных компонентов для графиков, в частности тут надо использовать Dot
    // в этой директории ищи: components/Sub/Graphs/
    // Использование компонента Dot сразу даст тебе и тултип, и круг доверия (он опциональный), и в целом единый стиль со всем приложением
    const fisherDir = createElement(
        'circle',
        {

            r: 0.0035,
            cx: String(0),
            cy: String(0),
            fill: 'red',

        }, ''
    );



    //---------------------------------------------------------------------------------------
    // making alpha95 circle
    //---------------------------------------------------------------------------------------
    
    // ToDo: убрать, как только заменишь на Dot (см. выше)
    const fisherCircle = [];

    fisherCircle.push(
        createElement(
            'polyline',
            {

                points: make_coords(PlotCircle([0, 0, 1], alpha95, 90)),
                stroke: "red",
                fill: 'none',
                strokeWidth: "0.0016px",
                strokeDasharray: "0.01px, 0.003px",
            }, ''
        )
    );



    //---------------------------------------------------------------------------------------
    // rumbs
    //---------------------------------------------------------------------------------------

    // ToDo: Вообще все тут удалить (что связано с румбами). Происходят какие то непонятные преобразования, хотя стоит лишь
    // взять компонент Axis и настроить его под себя. В качестве примера смотри на 
    // components/AppGraphs/StereoGraphDIR/AxesAndData.tsx

    if (xMax < -1 * xMin) xMax = -xMin;
    if (yMax < -1 * yMin) yMax = -yMin;

    // ToDo: Дать нормальные названия – никаких "my" и тп
    let myViewBox: string;
    let rumbFontSize: number;
    let myMax: number;

    if (xMax > yMax) {
        rumbFontSize = xMax / 10;
        myMax = xMax;

        myViewBox = String(-xMax - 2 * rumbFontSize) + " ";
        myViewBox += String(-xMax - 2 * rumbFontSize) + " ";
        myViewBox += String(xMax * 2 + 4 * rumbFontSize) + " ";
        myViewBox += String(xMax * 2 + 4 * rumbFontSize);
    } else {
        rumbFontSize = yMax / 10;
        myMax = yMax;
        
        myViewBox = String(-yMax - 2 * rumbFontSize) + " ";
        myViewBox += String(-yMax - 2 * rumbFontSize) + " ";
        myViewBox += String(yMax * 2 + 4 * rumbFontSize) + " ";
        myViewBox += String(yMax * 2 + 4 * rumbFontSize);
    }



    //---------------------------------------------------------------------------------------
    // POLYGON ZONE
    //---------------------------------------------------------------------------------------
    
    const circlePointsToCalculateCount = 720 * 8;
    let input: [number, number][] = [];
    const circlePoints = [];

    for (let i = 0; i < dirList.length; i++) {
        // ToDo: ужасное наименование, никаких односимвольных имен кроме случаев с итераторами допускать нельзя, это нечитаемый код
        const b = lambertMass(PlotCircle(to_center(dirList[i], meanDir), angleList[i], circlePointsToCalculateCount), meanDir);

        for (let j = 0; j < b.length; j++){
            circlePoints.push(b[j]);
        }
    }

    for (let i = 0; i < circlePoints.length; i++) {
        input.push([circlePoints[i][0], circlePoints[i][1]]);
    }

    const polygonPoints2d = poly_contour(input, [rotationCenterZone[0], rotationCenterZone[1]]);
    const polygonPoints3d = [];

    for (let i = 0; i < polygonPoints2d.length; i++) {
        polygonPoints3d.push([polygonPoints2d[i][0], polygonPoints2d[i][1], 1 ]);
    }

    const polygonPoints = make_coords(polygonPoints3d);

    let maxRad = -1;
    for (let i = 0; i < input.length; i++) {
        if (points_dist_2d(rotationCenterZone, input[i]) > maxRad) {
            maxRad = points_dist_2d(rotationCenterZone, input[i]);
        }
    }


    //---------------------------------------------------------------------------------------
    // DEGREE GRID
    //---------------------------------------------------------------------------------------
    
    const coords = [];

    let point = [1, 0, 0];

    const meridianCount = 18;
    for (let i = 0; i < meridianCount; i++) {
        point = RotateAroundV(point, [0, 1, 0], 360/ meridianCount );
        const meridian = lambertMass(centering(PlotCircle(point, 90, 90), meanDir), meanDir);
        coords.push(make_coords(meridian));
    }

    var parallelsCount = 18;
    for (let i = 0; i < parallelsCount; i++) {
        const parallel = lambertMass(centering(PlotCircle([0, 1, 0], i * (360 / meridianCount), 90), meanDir), meanDir);
        coords.push(make_coords(parallel));
    }

    let paralel = PlotCircle([0, 0, 1], 90, 90);
    coords.push(make_coords(paralel));


    return (
        <svg className="svg graph_interface" viewBox={myViewBox}>

            {showDegreeGrid && coords.map((circles) => (
                <polyline 
                    points={ circles } 
                    stroke={"grey"}
                    fill={'none'}
                    strokeWidth={"0.0005px"} 
                />
            ))}


            {showPolygon && <polygon points={polygonPoints} fill={polygonColor} />}
            {showGrid && grid}

            {smallCircles.map((circles) => (
                <circle 
                    r={ circlesRadius } 
                    cx={ circles } 
                    cy={ circles } 
                    fill={"black"}

                />
            ))}    



            {fisherDir}
            {fisherCircle}


            <circle 
                r={ centerZoneRadius } 
                cx={ rotationCenterZone[0] }
                cy={ rotationCenterZone[1] }
                fill={ centerZoneColor }
            />


            {showRumbs && 
                <>
                    <text x={myMax + rumbFontSize} y={0} textAnchor="middle" fontSize={String(rumbFontSize)} fill="black">
                        {"E"}
                    </text>
                    <text x={-myMax - rumbFontSize} y={0} textAnchor="middle" fontSize={String(rumbFontSize)} fill="black">
                        {"W"}
                    </text>
                    <text x={0} y={myMax + rumbFontSize} textAnchor="middle" fontSize={String(rumbFontSize)} fill="black">
                        {"S"}
                    </text>
                    <text x={0} y={-myMax - rumbFontSize} textAnchor="middle" fontSize={String(rumbFontSize)} fill="black">
                        {"N"}
                    </text>
                </>
            }
        </svg>
    );
}






    




















