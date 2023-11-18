import styles from "./degreeGrid.module.scss" 
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
    cutParEnd,
    cutMerEnd,

} from "../gag_functions";
import { Axis, Data, Dot } from "../../components/Common/Graphs";
import {PointsWithLabels} from "../pointsWithLabels/pointsWithLabels";


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
    
    // половина ширины черной рамки
    let width = -viewBoxSize.split(' ')[0] * 0.85 ;
    
                
    // расчет спроецированных координат рамки
    let lamberWidth =  width;       
   
    // width = lamberWidth * 0.98;


    let ram = String(lamberWidth) + ',' + String(lamberWidth) + ' ';
    ram += String(lamberWidth) + ',' + String(-lamberWidth) + ' ';
    ram += String(-lamberWidth) + ',' + String(-lamberWidth) + ' ';
    ram += String(-lamberWidth) + ',' + String(lamberWidth) + ' ';
    ram += String(lamberWidth) + ',' + String(lamberWidth) + ' ';

    //---------------------------------------------------------------------------------------
    // 
    //---------------------------------------------------------------------------------------
    
    //---------------------------------------------------------------------------------------
    // DEGREE GRID
    //---------------------------------------------------------------------------------------

    //---------------------------------------------------------------------------------------
    // MERIDIANS PLOT
    //---------------------------------------------------------------------------------------

    let meridiansInBox: number[][][] = [];

    let degreeMerLabels:number[][] = [];
    let endMerCords: number[][] = [];

    let degreeMerLabelsShift: number[] = [0, width / 8];
    
    let merTicks: number[][][] = [];

    let merTicksSift: number = width / 25;

    let point = [1, 0, 0];

    let centeredMeridian: number[][] = [];

    for (let i = 0; i < meridianCount / 2; i++) {


        point = RotateAroundV(point, [0, 1, 0], 360 / meridianCount );
        centeredMeridian = PlotArcInBox(to_center(point, meanDir), 90, width, 200);
       
        // слабое место. здесь происходит вылет, без ошибки если убрать это условие, не знаю почему
        if (centeredMeridian.length > 3){
            
            // разварачиваю массивы с точками меридианов, чтобы нулевая точка была внизу сетки
            if (centeredMeridian[0][1] > centeredMeridian[2][1]) {
                centeredMeridian.reverse();
            }

            // обрезаю концы параллелей и меридианов по краю рамки
            centeredMeridian = cutMerEnd(lambertMass(centeredMeridian, meanDir), width);
            meridiansInBox.push(centeredMeridian);
            
            // координата конца меридиана
            let merEnd: number[] = centeredMeridian[centeredMeridian.length - 1]

            // координаты делений и подписи к ним
            // только внизу сетки
            if (merEnd[1] == width) {
                degreeMerLabels.push(DekVgeo(centerToBack(merEnd, meanDir)));
                 
                merTicks.push(
                    [
                        merEnd, 
                        [
                            merEnd[0], 
                            merEnd[1] + merTicksSift, 
                            merEnd[2]
                        ]
                    ]
                );
                
                // задаю координаты подписи долготы и сдвиг для разного числа символов подписи
                let xMerLabelSift: number = 0;
                let lenOfLabel: number = String(degreeMerLabels[degreeMerLabels.length - 1][0].toFixed()).length
  
                if (lenOfLabel == 1) {
                    xMerLabelSift = width / 50;
                }
                else if (lenOfLabel == 2) {
                    xMerLabelSift = width / 22;
                }
                else if (lenOfLabel == 3) {
                    xMerLabelSift = width / 15;
                }
                else {
                    xMerLabelSift = width / 11;
                }
                endMerCords.push(
                    [
                        merEnd[0] - xMerLabelSift, 
                        merEnd[1], 
                        merEnd[2]
                    ]
                );
            }      
        }
    }



    //---------------------------------------------------------------------------------------
    // PARALELS PLOT
    //---------------------------------------------------------------------------------------
    
    let paralelsInBox:number[][][] = [];

    let degreeParLabels:number[][] = [];
    let endParCords: number[][] = [];

    let parTicks: number[][][] = [];

    let parTicksSift: number =  width / 25;
    let degreeParLabelsShift: number[] = [-width / 5.5, width / 35];

    for (let i = 2; i < parallelsCount / 2; i++) {

        let centeredParallel: number[][] = PlotArcInBox(to_center([0, 1, 0], meanDir), i * (360 / meridianCount), width, 300);

        if (centeredParallel.length > 5){

            if (centeredParallel[0][0] > centeredParallel[2][0]) {
                centeredParallel.reverse();
            }
            centeredParallel = cutParEnd(lambertMass(centeredParallel, meanDir), width);
            
            paralelsInBox.push(centeredParallel);

            if (centeredParallel[0][0] == -width){
                endParCords.push(centeredParallel[0]);

                degreeParLabels.push(DekVgeo(centerToBack(centeredParallel[0], meanDir)));

                parTicks.push(
                    [
                        centeredParallel[0], 
                        [
                            centeredParallel[0][0] - parTicksSift, 
                            centeredParallel[0][1], 
                            centeredParallel[0][2]
                        ]
                    ]
                );    
            }
        }
    }



    //---------------------------------------------------------------------------------------
    // RETURN
    //---------------------------------------------------------------------------------------

    return (
        <g>

            {/* ------------------------------------------- */}
            {/* ------------------MERIDIANS---------------- */}
            {/* ------------------------------------------- */}

            { meridiansInBox.map((circles) => (
                <polyline 
                    points={ make_coords(circles) } 
                    stroke={ "grey" }
                    fill={'none'}
                    strokeWidth={width / 230} 
                />
            ))}

            {/* MERIDIANS LABELS */}
            <PointsWithLabels
                points={endMerCords}
                radius={0}
                type={"lat"}
                labelsValues={degreeMerLabels}
                fontSize={width / 12}
                xShift={degreeMerLabelsShift[0]}
                yShift={degreeMerLabelsShift[1]}
            />

            {/* MERIDIANS TICKS */}
            { merTicks.map((tick) => (
                <polyline 
                    points={ make_coords(tick) } 
                    stroke={ "black" }
                    fill={'none'}
                    strokeWidth={width / 80} 
                />
            ))}

            {/* ------------------------------------------- */}
            {/* ------------------PARALLELS--------------- */}
            {/* ------------------------------------------- */}
            
            { paralelsInBox.map((circles) => (
                <polyline 
                    points={ make_coords(circles) } 
                    stroke={ "grey" }
                    fill={'none'}
                    strokeWidth={width / 230} 
                />
            ))}


            {/* debug */}
            {/* { paralelsInBox.map((circles) => (
                <>
                    {cutMerEnd(lambertMass(circles, meanDir), width).map((circle) => (
                        <circle 
                            cx={circle[0]} 
                            cy={circle[1]} 
                            r={width / 130} // радиус точки 
                            fill="purple" // цвет точки
                        />
                    ))}
                </>
            ))} */}

            {/* {endParCords.map((circles) => (
                <circle 
                    cx={circles[0]} 
                    cy={circles[1]} 
                    r={width / 27} 
                    fill="red" 
                />
            ))} */}


            {/* PARALELS LABELS */}
            <PointsWithLabels
                points={endParCords}
                radius={0}
                type={"lon"}
                labelsValues={degreeParLabels}
                fontSize={width / 12}
                xShift={degreeParLabelsShift[0]}
                yShift={degreeParLabelsShift[1]}
            />

            {/* PARALLELS TICKS */}
            { parTicks.map((tick) => (
                <polyline 
                    points={ make_coords(tick) } 
                    stroke={ "black" }
                    fill={'none'}
                    strokeWidth={width / 80} 
                />
            ))}

            {/* ------------------------------------------- */}
            {/* -------------------COMMON------------------ */}
            {/* ------------------------------------------- */}

            {/* ram */}
            <polyline 
                points={ ram } 
                stroke={ "black" }
                fill={'none'}
                strokeWidth={width / 100} 
            />

        </g>
    );
}



    



















