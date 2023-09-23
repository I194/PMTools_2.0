
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
import { Axis, Data, Dot } from "../components/Common/Graphs";
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
    
    let width = -viewBoxSize.split(' ')[0] * 0.4 ;

    let ram = String(width) + ',' + String(width) + ' ';
    ram += String(width) + ',' + String(-width) + ' ';
    ram += String(-width) + ',' + String(-width) + ' ';
    ram += String(-width) + ',' + String(width) + ' ';
    ram += String(width) + ',' + String(width) + ' ';

    //---------------------------------------------------------------------------------------
    // 
    //---------------------------------------------------------------------------------------
    
 
    //---------------------------------------------------------------------------------------
    // DEGREE GRID
    //---------------------------------------------------------------------------------------






    //---------------------------------------------------------------------------------------
    // MERIDIANS PLOT
    //---------------------------------------------------------------------------------------
    


    let meridiansInBox = [];
    let meridians: string[] = [];

    let degreeMerLabels:number[][] = [];
    let endMerCords: number[][] = [];

    let degreeMerLabelsShift: number[] = [0, 0];
    
    let merTicks: number[][][] = [];

    let merPoint: number[];
    let merTicksSift: number;

    let point = [1, 0, 0];

    for (let i = 0; i < meridianCount / 2; i++) {

        point = RotateAroundV(point, [0, 1, 0], 360/ meridianCount );
        let centeredMeridian = PlotArcInBox(to_center(point, meanDir), 90, width, 3000);
       
        if (centeredMeridian.length > 5){
            
            if (centeredMeridian[0][1] > centeredMeridian[2][1]) {
                centeredMeridian.reverse();
            }

            meridiansInBox.push(make_coords(centeredMeridian ));

            if (meanDir[1] < 0) {
                merPoint = centeredMeridian[centeredMeridian.length - 1];
                degreeMerLabelsShift = [-width/ 15, width/ 8];
                merTicksSift = width / 25;
            }
            else{
                merPoint = centeredMeridian[0];
                degreeMerLabelsShift = [-width/ 15, -width/ 20];
                merTicksSift = -width / 30;
            }

            endMerCords.push(merPoint);
            
            if (merPoint[0] < -width * 0.95 || merPoint[0] > width * 0.95){

                merPoint = centerToBack(merPoint, meanDir);
                degreeMerLabels.push([1000, 1000]);
            }
            else {
                merTicks.push(
                    [
                        merPoint, 
                        [
                            merPoint[0], 
                            merPoint[1] + merTicksSift, 
                            merPoint[2]
                        ]
                    ]
                );
                merPoint = centerToBack(merPoint, meanDir);
                degreeMerLabels.push(DekVgeo(merPoint));
            }
        }
    }


    //---------------------------------------------------------------------------------------
    // PARALELS PLOT
    //---------------------------------------------------------------------------------------
    
        
    let degreeGrid: string[] = [];

    
    
    // for (let i = 0; i < parallelsCount; i++) {
    //     const parallel = PlotCircle([0, 1, 0], i * (360 / meridianCount), 90);
    //     degreeGrid.push(make_coords(parallel));
    // }

    // let paralel = PlotCircle([0, 0, 1], 90, 90);
    // degreeGrid.push(make_coords(paralel));


    let paralelsInBox = [];
    let paralels: string[] = [];

    let degreeParLabels:number[][] = [];
    let endParCords: number[][] = [];

    let degreeParLabelsShift: number[] = [0, 0];

    let brownLabels:number[][] = [];
    let brownPoints: number[][] = [];
    
    let parTicks: number[][][] = [];

    let parPoint: number[];
    let parTicksSift: number;

    point = [1, 0, 0];

    // for (let i = 0; i < parallelsCount / 2; i++) {
    //     point = RotateAroundV(point, [0, 1, 0], 360 / parallelsCount );
    //     let centeredMeridian = PlotArcInBox(to_center(point, meanDir), 90, width, 3000);
       
    //     if (centeredMeridian.length > 5){
            
    //         if (centeredMeridian[0][1] > centeredMeridian[2][1]) {
    //             centeredMeridian.reverse();
    //         }
            
    //         paralelsInBox.push(make_coords(centeredMeridian ));


    //         if (meanDir[1] < 0) {
    //             parPoint = centeredMeridian[centeredMeridian.length - 1];
    //             degreeParLabelsShift = [-width/ 15, width/ 8];
    //             parTicksSift = width / 25;
    //         }
    //         else{
    //             parPoint = centeredMeridian[0];
    //             degreeParLabelsShift = [-width/ 15, -width/ 20];
    //             parTicksSift = -width / 30;
    //         }
    //         endParCords.push(parPoint);
            
            

    //         if (parPoint[0] < -width * 0.95 || parPoint[0] > width * 0.95){

    //             parPoint = centerToBack(parPoint, meanDir);

    //             brownLabels.push(DekVgeo(parPoint));
    //             degreeParLabels.push([1000, 1000]);
    //         }
    //         else {

    //             parTicks.push(
    //                 [
    //                     parPoint, 
    //                     [
    //                         parPoint[0], 
    //                         parPoint[1] + parTicksSift, 
    //                         parPoint[2]
    //                     ]
    //                 ]
    //             );

    //             parPoint = centerToBack(parPoint, meanDir);

    //             brownLabels.push(DekVgeo(parPoint));
    //             degreeParLabels.push(DekVgeo(parPoint));
    //         }

    //         brownPoints.push(parPoint);


    //         // не отцетрированное окно
    //         let meridian = [];
    //         for (let j = 0; j < centeredMeridian .length; j ++){
    //             meridian.push(centerToBack(centeredMeridian [j], meanDir));
    //         }
    //         paralels.push(make_coords(meridian));

    //     }

    // }

    //---------------------------------------------------------------------------------------
    // RETURN
    //---------------------------------------------------------------------------------------

    return (
        <g>
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

            <Dot 
                x={meanDir[0]} 
                y={meanDir[1]} 
                r={width / 40}
                id={'1'} 
                type={'mean'}
                annotation={{id: '', label: '45, 45'}}
                fillColor={'red'}
                strokeColor={'purple'}
                strokeWidth={0}
            />

            {/* ------------------------------------------- */}
            {/* ------------------MERIDIANS---------------- */}
            {/* ------------------------------------------- */}

            { meridiansInBox.map((circles) => (
                <polyline 
                    points={ circles } 
                    stroke={ "grey" }
                    fill={'none'}
                    strokeWidth={width / 230} 
                />
            ))}

            {/* MERIDIANS LABELS */}
            <PointsWithLabels
                points={endMerCords}
                radius={0}
                type={"lon"}
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
            {/* ------------------PARALLELS---------------- */}
            {/* ------------------------------------------- */}
            
            { meridiansInBox.map((circles) => (
                <polyline 
                    points={ circles } 
                    stroke={ "grey" }
                    fill={'none'}
                    strokeWidth={width / 230} 
                />
            ))}

            {/* PARALELS LABELS */}
            <PointsWithLabels
                points={endParCords}
                radius={0}
                type={"lon"}
                labelsValues={degreeMerLabels}
                fontSize={width / 12}
                xShift={degreeMerLabelsShift[0]}
                yShift={degreeMerLabelsShift[1]}
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
            {/* ------------------PARALLELS2--------------- */}
            {/* ------------------------------------------- */}

            {/* не повернутые точки на паралелях в внутри окна */}
            <PointsWithLabels
                points={brownPoints}
                radius={width / 20}
                color={"brown"}
                labelsValues={brownLabels}
                type={'lon'}
                fontSize={width / 12}
                xShift={width / 20}
                yShift={width / 20}
            />
            
            {/* Паралели */}
            { degreeGrid.map((circles) => (
                <polyline 
                    points={ circles } 
                    stroke={ "grey" }
                    fill={'none'}
                    strokeWidth={width / 230} 
                />
            ))}

            { paralels.map((circles) => (
                <polyline 
                    points={ circles } 
                    stroke={ "green" }
                    fill={'none'}
                    strokeWidth={width / 20} 
                />
            ))}

        </g>
    );
}



    



















