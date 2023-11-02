
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
    
    let width = -viewBoxSize.split(' ')[0] * 0.8 ;

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
    let p: number[][] = [];


    let meridiansInBox = [];

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

                p.push(merPoint);

  
            }
        }
    }


    //---------------------------------------------------------------------------------------
    // PARALELS PLOT
    //---------------------------------------------------------------------------------------
    
        


    let paralelsInBox = [];
    let paralels: string[] = [];

    let degreeParLabels:number[][] = [];
    let endParCords: number[][] = [];

    let degreeParLabelsShift: number[] = [0, 0];
    
    let parTicks: number[][][] = [];

    let parPoint: number[];
    let parTicksSift: number;


    for (let i = 2; i < parallelsCount / 2; i++) {

        let centeredParallel: number[][] = PlotArcInBox(to_center([0, 1, 0], meanDir), i * (360 / meridianCount), width, 3000);

       
        if (centeredParallel.length > 5){
            
            if (centeredParallel[0][0] > centeredParallel[2][0]) {
                centeredParallel.reverse();
            }
            
            paralelsInBox.push(make_coords(centeredParallel ));

            parPoint = centeredParallel[0];
            degreeParLabelsShift = [-width/ 4, width/ 35];
            parTicksSift = width / 25;


            endParCords.push(parPoint);

            if (parPoint[1] < -width * 0.95 || parPoint[1] > width * 0.95){

                parPoint = centerToBack(parPoint, meanDir);
                degreeParLabels.push([1000, 1000]);
            }
            else {
                parTicks.push(
                    [
                        parPoint, 
                        [
                            parPoint[0] - parTicksSift, 
                            parPoint[1], 
                            parPoint[2]
                        ]
                    ]
                );


                parPoint = centerToBack(parPoint, meanDir);
                degreeParLabels.push(DekVgeo(parPoint));

                p.push(parPoint);

  
            }

        }

    }

    //---------------------------------------------------------------------------------------
    // RETURN
    //---------------------------------------------------------------------------------------

    return (
        <g>

            {/* debug */}
            {/* { p.map((t) => (
            <Dot 
                x={t[0]} 
                y={t[1]} 
                r={0.01}
                id={'1'} 
                type={'mean'}
                annotation={{id: '', label: ''}}
                fillColor={'purple'}
                strokeColor={'purple'}
                strokeWidth={0.0002}
            />
            ))}

            <PointsWithLabels
                points={p}
                radius={0}
                type={"lon"}
                labelsValues={degreeMerLabels}
                fontSize={width / 12}
                xShift={degreeMerLabelsShift[0]}
                yShift={degreeMerLabelsShift[1]}
            />

 */}



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



    



















