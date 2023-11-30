
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

    GeoVdek,

} from "../gag_functions";

interface PointsWithLabels {
    points: number[][],
    radius: number,
    color?: string,
    labelsValues?: number[][],
    type? : 'lat' | 'lon' | 'lat & lon',
    fontSize?: number,
    xShift?: number,
    yShift?:number,
    width: number,
    meanDir: number[]
}

export function PointsWithLabels({
                                points,
                                radius,
                                color,
                                labelsValues,
                                type,
                                fontSize,
                                xShift,
                                yShift,
                                width,
                                meanDir
                            }: PointsWithLabels) {
   
    //---------------------------------------------------------------------------------------
    // 
    //---------------------------------------------------------------------------------------
    let labels: string[] = [];

    if (labelsValues && type && type == 'lat'){
        for ( let i = 0; i < labelsValues.length; i ++){
            labels.push(labelsValues[i][0].toFixed(0));
        }
    }

    else if (labelsValues && type && type == 'lon'){
        for ( let i = 0; i < labelsValues.length; i ++){
            labels.push(labelsValues[i][1].toFixed(0));
        }
    }

    else if (labelsValues && type && (type == 'lat & lon' || !type)){
        let label: string;
        for ( let i = 0; i < labelsValues.length; i ++){
            label = labelsValues[i][0].toFixed(0);
            label += " ";
            label += labelsValues[i][1].toFixed(0);
            labels.push(label);
        }
    }



    // делаю подписи через одну рядос с северным полюсом
    if (meanDir[1] > 0.95){
        for ( let i = 0; i < points.length; i ++){
            if ((i + 1) % 3 != 0) {
                if(points[i][0] > -width){
                    labels[i] = '';
                }
            }
        }
    }







    return (
        <g>

            {/* POINTS */}
            {points.map((point) => (
                <circle 
                    cx={point[0]} 
                    cy={point[1]} 
                    r={radius}
                    fill={color? color : "black"}
                />
            ))}

            {/* LABELS */}
            {labels && points.map((point, index) => (
                    <text 
                        x={ xShift? point[0] + xShift : point[0] } 
                        y={ yShift? point[1] + yShift : point[1] }  
                        font-size={fontSize? fontSize : radius * 10}
                    > 
                        {labels[index]} 
                    </text>
            ))}


        </g>

    );
}



    




















