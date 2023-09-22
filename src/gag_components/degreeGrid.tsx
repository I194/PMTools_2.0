
import {
    RotateAroundV,
    RotateAroundX,
    RotateAroundY,
    PlotCircle,
    make_coords,
    centering,
    poly_contour,
    convertToLambert,
    lambertMass,
    to_center,
    points_dist_2d,
    getViewBoxSize,
    getPointSize,
    PlotArcInBox,
    getOnePointInCenteredBox,
    // getOnePointInBox,
    DekVgeo,
    NormalizeV,
    angle_between_v,
    getOneCirclePoint,
    centerToBack,
    plotParalellCircle,
    plotMeridianCircle,
    GeoVdek,

} from "./gag_functions";

import {PointsWithLabels} from "./pointsWithLabels";


interface degreeGraticules {
    viewBoxSize: string,
    meridianCount: number,
    parallelsCount: number,
    meanDir: number[]
}

export function DegreeGrid({
                                viewBoxSize,
                                meridianCount,
                                parallelsCount,
                                meanDir
                            }: degreeGraticules) {
   
   
    //---------------------------------------------------------------------------------------
    // RAM
    //---------------------------------------------------------------------------------------

    let width = -viewBoxSize.split(' ')[0];

    // let ram = String(width) + ',' + String(width) + ' ';
    // ram += String(width) + ',' + String(-width) + ' ';
    // ram += String(-width) + ',' + String(-width) + ' ';
    // ram += String(-width) + ',' + String(width) + ' ';
    // ram += String(width) + ',' + String(width) + ' ';

    //---------------------------------------------------------------------------------------
    // ваня! короче это зеленая сетка, в которой точки в узлах градусной сетки
    //---------------------------------------------------------------------------------------
    
    let greenPoints:number[][] = [];

    let mainCircle: number[][] = plotParalellCircle([0, 0, 1], 36);


    for (let i = 0; i < meridianCount; i++) {
        
        let vertCircle = plotMeridianCircle(mainCircle[i], 36);
        
        for (let k = 0; k < vertCircle.length; k++ ){
            if (vertCircle[k][2] > 0){
                greenPoints.push(vertCircle[k]);
            }
        }

    }

    //---------------------------------------------------------------------------------------
    // ваня! это нулеаой меридиан. точки коричневого цвета 
    //---------------------------------------------------------------------------------------
    
    let brownPoints:number[][] = [];
    let brownLabels: number[][] = [];

    
    let brownCircle = plotMeridianCircle([1, 0, 0], 36);
    
    for (let k = 0; k < brownCircle.length; k++){
                brownPoints.push(brownCircle[k])
                brownLabels.push(DekVgeo(brownCircle[k]));
    }
    


    //---------------------------------------------------------------------------------------
    // ваня ! это нулевая паралель фиолетового цвета
    //---------------------------------------------------------------------------------------

    let purplePoints:number[][] = [];
    let purpleLabels: number[][] = [];
    let purpleCircle: number[][] = plotParalellCircle([0, 0, 1], 36);

    for (let k = 0; k < purpleCircle.length; k ++){
        if (purpleCircle[k][2] > 0){
            purplePoints.push(purpleCircle[k]);
            purpleLabels.push(DekVgeo(purpleCircle[k]));
        } 
    }
    

    //---------------------------------------------------------------------------------------
    // ваня! это меридиан 50 градусов западной долготы оранжевый
    // у него есть подписи и долготы и широты, все точки лежат в узлах градусной сетки
    // проблема в том, что ни его широты ни его долготы не совпадают 
    // c тем, что очевидно должно тут быть
    //---------------------------------------------------------------------------------------

    let orangePoints:number[][] = [];
    let orangeLabels: number[][] = [];

    
    let orangeCircle = plotMeridianCircle(GeoVdek(0, -50), 36);
    
    for (let k = 0; k < orangeCircle.length; k++){
        if (orangeCircle[k][2] > 0){
            orangePoints.push(orangeCircle[k])
            orangeLabels.push(DekVgeo(orangeCircle[k]));
        }
    }
    
    
    //---------------------------------------------------------------------------------------
    // RETURN
    //---------------------------------------------------------------------------------------

    return (
        <g>

            {/* зеленая не повернутая градусная сетка */}
            <PointsWithLabels
                points={greenPoints}
                radius={width / 160}
                color={"green"}
            />

            
            {/* DEGREE GRID WITH LABELS */}
            <PointsWithLabels
                points={brownPoints}
                radius={width / 60}
                color={"brown"}
                labelsValues={brownLabels}
                type={'lon'}
                fontSize={width / 25}
                xShift={-width / 30}
                yShift={width / 15}
            />

            <PointsWithLabels
                points={purplePoints}
                radius={width / 60}
                color={"purple"}
                labelsValues={purpleLabels}
                type={'lat'}
                fontSize={width / 25}
                xShift={-width / 30}
                yShift={width / 15}
            />

            <PointsWithLabels
                points={orangePoints}
                radius={width / 60}
                color={"orange"}
                labelsValues={orangeLabels}
                type={'lat & lon'}
                fontSize={width / 25}
                xShift={-width / 30}
                yShift={width / 15}
            />



            {/* Градусная сетка */}
            {/* {degreeGridLines.map((circles) => (
                <polyline 
                    points={ circles } 
                    stroke={ "grey" }
                    fill={'none'}
                    strokeWidth={String(width / 400) + 'px'} 
                />
            ))} */}

            {/* подписи к делениям градусной сетки */}
            {/* <PointsWithLabels
                points={endCordsList}
                radius={0}
                type={"lat & lon"}
                labelsValues={degreeMerLabels}
                fontSize={width / 12}
                xShift={width / 22}
                yShift={width / 20}
            /> */}

            {/* ram */}
            {/* <polyline 
                points={ ram } 
                stroke={ "black" }
                fill={'none'}
                strokeWidth={"0.002px"} 
            /> */}

            {/* не повернутые точки на меридианах в внутри окна */}
            {/* <PointsWithLabels
                points={purplePoints}
                radius={width / 20}
                color={"purple"}
                labelsValues={degreeMerLabels}
                type={'lat'}
                fontSize={width / 12}
                xShift={width / 20}
                yShift={width / 20}
            /> */}
            
            
            {/* повернутые точки на меридианах внутри повернутого окна */}
            {/* <PointsWithLabels
                points={orangePoints}
                radius={width / 20}
                color={"orange"}
            /> */}


            {/* не повернутое направление по фишеру */}
            {/* <circle 
                cx={meanDir[0]} 
                cy={meanDir[1]} 
                r={width / 30}
                fill={"red"}
            /> */}

                        {/* <PointsWithLabels
                points={}
                radius={}
                color={}
                labelsValues={}
                type={}
                fontSize={}
                xShift={}
                yShift={}
            /> */}

        </g>
    );
}



    




















