
//-----------------------------------------------------------------------
// projections func
//-----------------------------------------------------------------------



export function get_quantiles(d: number, apc: number, p: number) {

    var quantiles = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    if (d == 10) {
        if (apc == 0){
            if (p == 950){
                quantiles = [9.9, 8.1, 7.1, 6.4, 5.9, 5.5, 5.2, 4.9, 4.6, 4.4, 4.3, 4.1, 4.0, 3.8];
            }
            if (p == 975){
                quantiles = [11.0, 9.1, 7.9, 7.1, 6.6, 6.1, 5.8, 5.4, 5.2, 5.0, 4.8, 4.6, 4.4, 4.3];
            }
            if (p == 990){
                quantiles = [12.3, 10.1, 8.9, 8.0, 7.4, 6.8, 6.4, 6.1, 5.8, 5.5, 5.3, 5.1, 4.9, 4.8];
            }
            if (p == 995){
                quantiles = [8.6, 7.9, 7.4, 6.9, 6.5,6.2, 5.9];
            }
            if (p == 997){
                quantiles = [9.0, 8.3, 7.7, 7.2, 6.8, 6.5, 6.2];
            }
        }
        if (apc == 1){
            if (p == 950){
                quantiles = [8.4, 7.3, 6.6, 6.0, 5.6, 5.3, 5.0, 4.8, 4.5, 4.3, 4.2, 4.0, 3.9, 3.8];
            }
            if (p == 975){
                quantiles = [9.3, 8.1, 7.3, 6.7, 6.3, 5.9, 5.6, 5.3, 5.0, 4.8, 4.6, 4.5, 4.3, 4.2];
            }
            if (p == 990){
                quantiles = [10.4, 9.1, 8.2, 7.5, 7.0, 6.6, 6.2, 5.9, 5.6, 5.4, 5.2, 5.0, 4.8, 4.7];
            }
            if (p == 995){
                quantiles = [8.1, 7.5, 7.0, 6.6, 6.3, 6.0, 5.8];
            }
            if (p == 997){
                quantiles = [8.4, 7.9, 7.4, 7.0, 6.6, 6.3, 6.1];
            }
        }
    }
    else {
        if (apc == 0){
            if (p == 950){
                quantiles = [20.1, 16.4, 14.3, 12.9, 11.8, 11.0, 10.4, 9.8, 9.3, 8.9, 8.6, 8.2, 7.9, 7.7];
            }
            if (p == 975){
                quantiles = [22.1, 18.2, 15.9, 14.3, 13.1, 12.3, 11.5, 10.9, 10.4, 9.9, 9.5, 9.2, 8.8, 8.6];
            }
            if (p == 990){
                quantiles = [24.7, 20.4, 17.8, 16.0, 14.7, 13.7, 12.9, 12.2, 11.6, 11.1, 10.6, 10.2, 9.9, 9.6];
            }
            if (p == 995){
                quantiles = [17.3, 15.8, 14.8, 13.8, 13.1, 12.5, 11.9];
            }
            if (p == 997){
                quantiles = [18.1, 16.6, 15.5, 14.5, 13.7, 13.1, 12.5];
            }
        }
        if (apc == 1){
            if (p == 950){
                quantiles = [16.9, 14.7, 13.2, 12.1, 11.2, 10.5, 10.0, 9.5, 9.1, 8.7, 8.4, 8.1, 7.8, 7.5];
            }
            if (p == 975){
                quantiles = [18.6, 16.3, 14.7, 13.5, 12.5, 11.7, 11.1, 10.5, 10.1, 9.7, 9.3, 9.0, 8.7, 8.4];
            }
            if (p == 990){
                quantiles = [20.8, 18.2, 16.4, 15.0, 14.0, 13.1, 12.4, 11.8, 11.2, 10.8, 10.4, 10.0, 9.7, 9.4];
            }
            if (p == 995){
                quantiles = [16.2, 15.0, 14.1, 13.3, 12.7, 12.1, 11.6];
            }
            if (p == 997){
                quantiles = [17.0, 15.7, 14.8, 14.0, 13.3, 12.7, 12.2];
            }
        }
    }
    return quantiles;

}




export function fisherStat(dirs: number[][]) {

    var x_sum = 0;
    var y_sum = 0;
    var z_sum = 0;

    for (var i = 0; i < dirs.length; i++)
    {
        x_sum += dirs[i][0];
        y_sum += dirs[i][1];
        z_sum += dirs[i][2];
    }
    var r = [x_sum, y_sum, z_sum];

    var r_len = vector_length(r);
    var n = dirs.length;
    var k = (n - 1) / (n - r_len);
    var alpha95 = 140 / Math.sqrt(k * n);

    var result : [number[], number] = [NormalizeV(r), alpha95];
    return result;
}

export function getRandomInt(min: number, max: number) {
    var fmin = Math.ceil(min);
    var fmax = Math.floor(max);
    return Math.floor(Math.random() * (fmax - fmin) + fmin); // The maximum is exclusive and the minimum is inclusive
}

export function getRandomfloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
}



export function GridVdek(phiAngle: number, lmbdAngle: number)
{

    let r: number = 1;
    let phi: number = phiAngle * Math.PI / 180;
    let lmbd: number = lmbdAngle * Math.PI / 180;

    let X: number = r * Math.cos(phi) * Math.cos(lmbd);
    let Y: number = r * Math.cos(phi) * Math.sin(lmbd);
    let Z: number = r * Math.sin(phi);
    
    let C: number[] = RotateAroundV([X, Y, Z], [1,0,0], 90);

    return C;

}



export function DekVgeo(point: number[])
{
    
    // point = RotateAroundX(point, 90);
    // point = RotateAroundZ(point, 90);
    
    // let x = point[0];
    // let y = point[1];
    // let z = point[2];

    // let R = 1;
    // let phi = Math.asin(z / R) * 180 / Math.PI;
    // let lmbd = Math.atan(y / x) * 180 / Math.PI;

    // return [-phi, lmbd];


    let dir: number[] = NormalizeV(point);
    let phi: number = 0;
    let lmbd: number = 90;

    if (dir[0] > 0 && dir[1] > 0 && dir[2] > 0) {
        phi = angle_between_v([0, 0, 1], [dir[0], 0, dir[2]])  * 180 / Math.PI;
        lmbd = -angle_between_v([dir[0], dir[1], dir[2]], [dir[0], 0, dir[2]]) * 180 / Math.PI;
        return [phi, lmbd];
    }

    if (dir[0] > 0 && dir[1] > 0 && dir[2] < 0) {
        phi = angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI;
        lmbd = -angle_between_v([dir[0], dir[1], dir[2]], [dir[0], 0, dir[2]]) * 180 / Math.PI;
        return [phi, lmbd];
    }

    if (dir[0] > 0 && dir[1] < 0 && dir[2] > 0) {
        phi = angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI;
        lmbd = angle_between_v([dir[0], dir[1], dir[2]], [dir[0], 0, dir[2]]) * 180 / Math.PI;
        return [phi, lmbd];
    }

    if (dir[0] > 0 && dir[1] < 0 && dir[2] < 0) {
        phi =  angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI;
        lmbd = angle_between_v([dir[0], dir[1], dir[2]], [dir[0], 0, dir[2]]) * 180 / Math.PI;
        return [phi, lmbd];
    }

    if (dir[0] < 0 && dir[1] > 0 && dir[2] > 0) {
        phi =  -angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI;
        lmbd = -angle_between_v([dir[0], dir[1], dir[2]], [dir[0], 0, dir[2]]) * 180 / Math.PI;
        return [phi, lmbd];
    }

    if (dir[0] < 0 && dir[1] > 0 && dir[2] < 0) {
        phi = -angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI;
        lmbd = -angle_between_v([dir[0], dir[1], dir[2]], [dir[0], 0, dir[2]]) * 180 / Math.PI;
        return [phi, lmbd];
    }

    if (dir[0] < 0 && dir[1] < 0 && dir[2] > 0) {
        phi = -angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI;
        lmbd = angle_between_v([dir[0], dir[1], dir[2]], [dir[0], 0, dir[2]]) * 180 / Math.PI;
        return [phi, lmbd];
    }

    if (dir[0] < 0 && dir[1] < 0 && dir[2] < 0) {
        phi = -angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI;
        lmbd = angle_between_v([dir[0], dir[1], dir[2]], [dir[0], 0, dir[2]]) * 180 / Math.PI;
        return [phi, lmbd];
    }
    // TODO: if dir[0] = 0 || dir[1] == 0 ???!
    return [phi, lmbd];
}

export function getOcto(point: number[]){

    let dir: number[] = NormalizeV(point);


    if (dir[0] > 0 && dir[1] > 0 && dir[2] > 0) {
        return '+++';
    }

    if (dir[0] > 0 && dir[1] > 0 && dir[2] < 0) {
        return '++-';
    }

    if (dir[0] > 0 && dir[1] < 0 && dir[2] > 0) {
        return '+-+';
    }

    if (dir[0] > 0 && dir[1] < 0 && dir[2] < 0) {
        return '+--';
    }

    if (dir[0] < 0 && dir[1] > 0 && dir[2] > 0) {
        return '-++';
    }

    if (dir[0] < 0 && dir[1] > 0 && dir[2] < 0) {
        return '-+-';
    }

    if (dir[0] < 0 && dir[1] < 0 && dir[2] > 0) {
        return '--+';
    }

    if (dir[0] < 0 && dir[1] < 0 && dir[2] < 0) {
        return '---';
    }

    // TODO: if dir[0] = 0 || dir[1] == 0 ???!

    return 0;
}

export function GeoVdek(phiAngle: number, lmbdAngle: number)
{

    // let r: number = 1;
    // let phi: number = phiAngle * Math.PI / 180;
    // let lmbd: number = lmbdAngle * Math.PI / 180;

    // let X: number = r * Math.cos(phi) * Math.cos(lmbd);
    // let Y: number = r * Math.cos(phi) * Math.sin(lmbd);
    // let Z: number = r * Math.sin(phi);
    
    // let C: number[] = RotateAroundV([X, Y, Z], [1,0,0], 90);
    // return C;



    let point: number[] = [0, 0, 1];




    
    if (phiAngle > 0 && phiAngle < 90 && lmbdAngle > -90 && lmbdAngle < 0){
        point = RotateAroundY(point, phiAngle);
        point = RotateAroundV(point, get_perp(point, [0, 1, 0]), -lmbdAngle);
    }

    else if (phiAngle > 90 && phiAngle < 180 && lmbdAngle > -90 && lmbdAngle < 0){
        point = RotateAroundY(point, phiAngle);
        point = RotateAroundV(point, get_perp(point, [0, 1, 0]), -lmbdAngle);
    }

    else if (phiAngle > 0 && phiAngle < 90 && lmbdAngle > 0 && lmbdAngle < 90){
        point = RotateAroundY(point, phiAngle);
        point = RotateAroundV(point, get_perp(point, [0, -1, 0]), lmbdAngle);
    }

    else if (phiAngle > 90 && phiAngle < 180 && lmbdAngle > 0 && lmbdAngle < 90){
        point = RotateAroundY(point, phiAngle);
        point = RotateAroundV(point, get_perp(point, [0, -1, 0]), lmbdAngle);
    }

    else if (phiAngle > -90 && phiAngle < 0 && lmbdAngle > -90 && lmbdAngle < 0){
        point = RotateAroundY(point, phiAngle);
        point = RotateAroundV(point, get_perp(point, [0, 1, 0]), -lmbdAngle);
    }

    else if (phiAngle > -180 && phiAngle < -90 && lmbdAngle > -90 && lmbdAngle < 0){
        point = RotateAroundY(point, phiAngle);
        point = RotateAroundV(point, get_perp(point, [0, -1, 0]), lmbdAngle);
    }

    else if (phiAngle > -90 && phiAngle < 0 && lmbdAngle > 0 && lmbdAngle < 90){
        point = RotateAroundY(point, phiAngle);
        point = RotateAroundV(point, get_perp(point, [0, -1, 0]), lmbdAngle);
    }

    else if (phiAngle > -180 && phiAngle < -90 && lmbdAngle > 0 && lmbdAngle < 90){
        point = RotateAroundY(point, phiAngle);
        point = RotateAroundV(point, get_perp(point, [0, -1, 0]), lmbdAngle);
    }
    else {
        point = [1, 1, 1]
    }
    // TODO: if dir[0] = 0 || dir[1] == 0 ???!
    // point = RotateAroundX(point, 90);

    // if (phiAngle < 0){
    //     phiAngle += 360;
    //     let g = DekVgeo([point[0], point[1], point[2]]);
    //     point = 
    // }

    return point;
}


export function vector_length(v:number[]) { return Math.sqrt( v[0] * v[0] + v[1] * v[1] + v[2] * v[2] ); }

export function points_dist(p1:number[], p2:number[]) {
    return Math.sqrt( 
            (p1[0] - p2[0]) * (p1[0] - p2[0]) + 
            (p1[1] - p2[1]) * (p1[1] - p2[1]) + 
            (p1[2] - p2[2]) * (p1[2] - p2[2])
        );
}

export function angle_between_v(v1: number[], v2: number[])
{
    let angle;
    angle = Math.acos( (v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]) / ( vector_length(v1) * vector_length(v2) ) );

    if (angle > 180) { angle -= 180; }
        return angle;
}



//-----------------------------------------------------------------------
// matrix mod functions
//-----------------------------------------------------------------------

export function MultiplyMatrix(A: number[][], B: number[])
{
    let C = [0, 0, 0];

    C[0] = A[0][0] * B[0] + A[0][1] * B[1] + A[0][2] * B[2];
    C[1] = A[1][0] * B[0] + A[1][1] * B[1] + A[1][2] * B[2];
    C[2] = A[2][0] * B[0] + A[2][1] * B[1] + A[2][2] * B[2];

    return C;
}

export function RotateAroundV(B: number[], V: number[], angle: number)
{
    let phi = angle * Math.PI / 180;

    var x = V[0];
    var y = V[1];
    var z = V[2];

    let A = [
        [Math.cos(phi) + (1 - Math.cos(phi)) * x * x, (1 - Math.cos(phi)) * x * y - z * Math.sin(phi), (1 - Math.cos(phi)) * x * z + y * Math.sin(phi)],
        [(1 - Math.cos(phi)) * y * x + z * Math.sin(phi), Math.cos(phi) + (1 - Math.cos(phi)) * y * y, (1 - Math.cos(phi)) * y * z - x * Math.sin(phi)],
        [(1 - Math.cos(phi)) * z * x - y * Math.sin(phi), (1 - Math.cos(phi)) * z * y + x * Math.sin(phi), Math.cos(phi) + (1 - Math.cos(phi)) * z * z]
    ];


    let C = MultiplyMatrix(A, B)

    return C;
}

export function RotateAroundZ(B: number[], angle: number)
{
    let phi = angle * Math.PI / 180;

    let A = [
                [ Math.cos(phi), -Math.sin(phi), 0 ],
                [ Math.sin(phi), Math.cos(phi), 0 ],
                [ 0, 0, 1 ],
            ];

    var C = MultiplyMatrix(A, B)

    return C;
}

export function RotateAroundY(B: number[], angle: number)
{
    let phi = angle * Math.PI / 180;

    let A = [
                [ Math.cos(phi), 0, Math.sin(phi) ],
                [ 0, 1, 0 ],
                [ -Math.sin(phi), 0, Math.cos(phi) ],
            ];

    var C = MultiplyMatrix(A, B)

    return C;
}
export function RotateAroundX(B: number[], angle: number)
{
    let phi = angle * Math.PI / 180;

    let A = [
                [ 1, 0, 0 ],
                [ 0, Math.cos(phi), -Math.sin(phi) ],
                [ 0, Math.sin(phi), Math.cos(phi) ],
            ];

    var C = MultiplyMatrix(A, B)

    return C;
}

export function NormalizeV(V: number[])
{
    var x = V[0];
    var y = V[1];
    var z = V[2];

    var L = Math.sqrt(x * x + y * y + z * z);

    var C = [x / L, y / L, z / L];

    return C;
}

export function vectV2(V: number[])
{
    var x = V[0];
    var y = V[1];
    var z = V[2];

    var L = Math.sqrt(x * x + y * y + z * z);

    var C = [2 * x / L, 2 * y / L, 2 * z / L];

    return C;
}

export function get_perp(v1: number[],v2: number[])
{
    var x1 = v1[0];
    var y1 = v1[1];
    var z1 = v1[2];

    var x2 = v2[0];
    var y2 = v2[1];
    var z2 = v2[2];

    var i = y1 * z2 - z1 * y2;
    var j = z1 * x2 - x1 * z2;
    var k = x1 * y2 - y1 * x2;

    return NormalizeV([i,j,k]);
}

//-----------------------------------------------------------------------
// circle plot func
//-----------------------------------------------------------------------

export function PlotCircle(dir: number[], phi: number, circle_points_numb: number)
{
    let direction = NormalizeV(dir);

    //-------------------------------------------------------------------
    //plot solid line
    //-------------------------------------------------------------------
    let my_point = getOneCirclePoint(direction, phi);

    var points4 = [];

    points4.push( [my_point[0], my_point[1], my_point[2]] );



    for ( let i = 0; i < circle_points_numb; i ++ ) {
        my_point = RotateAroundV(my_point, direction, 360 / circle_points_numb);
        points4.push( [my_point[0], my_point[1], my_point[2]] ) ;
    }

    return points4;
}

//-----------------------------------------------------------------------
// begin
//-----------------------------------------------------------------------
export function to_center(p: number[], dir: number[]){
    let point = p;
    
    if (dir[0] >= 0 && dir[1] >= 0 && dir[2] >= 0) {
        var yrot = RotateAroundY(point, -angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI);
        var diryrot = RotateAroundY(dir, -angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI);
        yrot = RotateAroundX(yrot, angle_between_v(diryrot, [0, 0, 1]) * 180 / Math.PI);
        point = yrot;
    }

    if (dir[0] >= 0 && dir[1] >= 0 && dir[2] <= 0) {
        var diryrot = RotateAroundY(dir, -( 90 + angle_between_v([1, 0, 0], [dir[0], 0, dir[2]]) * 180 / Math.PI));
        var yrot = RotateAroundY(point, -( 90 + angle_between_v([1, 0, 0], [dir[0], 0, dir[2]]) * 180 / Math.PI));
        yrot = RotateAroundX(yrot, angle_between_v(diryrot, [0, 0, 1]) * 180 / Math.PI);
        point = yrot;
    }

    if (dir[0] >= 0 && dir[1] <= 0 && dir[2] <= 0) {
        var diryrot = RotateAroundY(dir, -(90 + angle_between_v([1, 0, 0], [dir[0], 0, dir[2]]) * 180 / Math.PI));
        var yrot = RotateAroundY(point, -(90 + angle_between_v([1, 0, 0], [dir[0], 0, dir[2]]) * 180 / Math.PI));
        yrot = RotateAroundX(yrot, -angle_between_v(diryrot, [0, 0, 1]) * 180 / Math.PI);
        point = yrot;
    }

    if (dir[0] >= 0 && dir[1] <= 0 && dir[2] >= 0) {
        var diryrot = RotateAroundY(dir, -angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI);
        var yrot = RotateAroundY(point, -angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI);
        yrot = RotateAroundX(yrot, -angle_between_v(diryrot, [0, 0, 1]) * 180 / Math.PI);
        point = yrot;
    }

    if (dir[0] <= 0 && dir[1] >= 0 && dir[2] >= 0) {
        var diryrot = RotateAroundY(dir, angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI);
        var yrot = RotateAroundY(point, angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI);
        yrot = RotateAroundX(yrot, angle_between_v(diryrot, [0, 0, 1]) * 180 / Math.PI);
        point = yrot;
    }
    if (dir[0] <= 0 && dir[1] <= 0 && dir[2] >= 0) {
        var diryrot = RotateAroundY(dir, angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI);
        var yrot = RotateAroundY(point, angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI);
        yrot = RotateAroundX(yrot, -angle_between_v(diryrot, [0, 0, 1]) * 180 / Math.PI);
        point = yrot;
    }
    if (dir[0] <= 0 && dir[1] >= 0 && dir[2] <= 0) {
        var diryrot =RotateAroundY(dir, 90 + angle_between_v([-1, 0, 0], [dir[0], 0, dir[2]]) * 180 / Math.PI);
        var yrot = RotateAroundY(point, 90 + angle_between_v([-1, 0, 0], [dir[0], 0, dir[2]]) * 180 / Math.PI);
        yrot = RotateAroundX(yrot, angle_between_v(diryrot, [0, 0, 1]) * 180 / Math.PI);
        point = yrot;
    }
    if (dir[0] <= 0 && dir[1] <= 0 && dir[2] <= 0) {
        var diryrot = RotateAroundY(dir, 90 + angle_between_v([-1, 0, 0], [dir[0], 0, dir[2]]) * 180 / Math.PI);
        var yrot = RotateAroundY(point, 90 + angle_between_v([-1, 0, 0], [dir[0], 0, dir[2]]) * 180 / Math.PI);
        yrot = RotateAroundX(yrot, -angle_between_v(diryrot, [0, 0, 1]) * 180 / Math.PI);
        point = yrot;
    }

    return point;
}

export function centering(in_points: number[][], dir: number[]){

    const res = [];
    const allCenteredPoints = [];
    
    for (let i = 0; i < in_points.length; i++) {
        const centeredPoint = to_center(in_points[i], dir);
        allCenteredPoints.push(centeredPoint);

        if (centeredPoint[2] >= 0) {
            res.push(centeredPoint);
        }
    }

    //  Для меридианов и параллелей
    if (res.length < allCenteredPoints.length) {
        for (let i = 0; i < allCenteredPoints.length; i++) {
            if (res[i] != allCenteredPoints[i]) {
                return res.slice(i, res.length).concat(res.slice(0, i));
            }
        }
    }

    return res;
}

export function make_coords(points: number[][]){

    var s = "";
    var res = [];

    for ( let j = 0; j < points.length; j ++ ) {
        res.push([points[j][0], points[j][1]]);
    }
    for ( let j = 0; j < res.length; j ++ ) {
        s += String(res[j][0]);
        s += "," + String(res[j][1]) + " ";
    }
    return s;
}


export function lineSphereIntersect(v: number[]) {

    var a1 = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    var b1 = 2 * v[2]
    var c1 = 1 - 4;

    var d = b1 * b1 - 4 * a1 * c1;
    var t1 = (-b1 - Math.sqrt(d)) / (2 * a1);
    var t2 = (-b1 + Math.sqrt(d)) / (2 * a1);

    let x1 = v[0] * t1;
    let y1 = v[1] * t1;
    let z1 = v[2] * t1;

    let x2 = v[0] * t2;
    let y2 = v[1] * t2;
    let z2 = v[2] * t2;


    if (z1 > 0){
        return [x1, y1, z1];
    }
    else {
        return [x2, y2, z2];
    }
}


export function convertToLambert(v: number[], fish_dir: number[]) {
    // let my_perp = get_perp([0, 0, 1], fish_dir);
    return lineSphereIntersect(v);
    // return v;
}

export function lambertMass(points: number[][], fish_dir: number[]){

    let result = [];
    for (let i = 0; i < points.length; i++)
    {
        result.push(convertToLambert(points[i], fish_dir));
    }

    return result;
}


export function orientation(p: [number, number], q: [number, number], r: [number, number]): number {
  const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);

  if (val === 0) {
    return 0; // Точки p, q и r коллинеарны
  }

  return (val > 0) ? 1 : 2; // 1 - По часовой стрелке, 2 - Поворот против часовой стрелки
}

export function convexHull(points: [number, number][]): [number, number][] {
  const n = points.length;

  // Если количество точек меньше 3, то выпуклая оболочка не может быть образована
  if (n < 3) {
    return [];
  }

  const hull: [number, number][] = [];

  let l = 0;
  for (let i = 1; i < n; i++) {
    if (points[i][0] < points[l][0]) {
      l = i;
    }
  }

  let p = l;
  let q: number;
  do {
    hull.push(points[p]);
    q = (p + 1) % n;

    for (let i = 0; i < n; i++) {
      if (orientation(points[p], points[i], points[q]) === 2) {
        q = i;
      }
    }

    p = q;
  } while (p !== l);

  return hull;
}

export function points_dist_2d(v1: number[], v2: number[]) { return Math.sqrt( (v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]) ); }

export function v_len_2d(v: number[]) { return Math.sqrt( v[0] * v[0] + v[1] * v[1] ); }

export function v_angle_2d(v1: number[], v2: number[])
{
    let angle;
    angle = Math.acos( (v1[0] * v2[0] + v1[1] * v2[1]) / ( v_len_2d(v1) * v_len_2d(v2) ) );

    if (angle > 180) { angle -= 180; };

    return Math.abs(angle * 180 / Math.PI);

}

export function rot_V_2d(v: number[], angle: number)
{
    let alpha = angle * Math.PI / 180;
    let x =  v[0] * Math.cos(alpha) - v[1] * Math.sin(alpha);
    let y = v[0] * Math.sin(alpha) + v[1] * Math.cos(alpha);
    return [x, y];
}



export function zone_square(points_number: number, all_points: number, ) { return points_number / all_points;};

export function poly_contour(points_mass: number[][], center: number[])
{
    let points = points_mass;
    for (let i = 0; i < points.length; i++)
    {
        points[i] = [points[i][0] - center[0], points[i][1] - center[1]];
    }
    let sect_numb = 120;

    let alpha = 360 / sect_numb;
    let dir = [0, 1];
    let min_dist = 76548876;
    let near_p = [87,8568,87658];
    let near_plus = [ 200, 200];

    var result = [];


    for (let j = 0; j < sect_numb; j++)
    {
        for (let i = 0; i < points.length - 1; i++)
        {
            if (v_angle_2d(points[i], dir) < alpha / 2)
            {
                if (v_len_2d(points[i]) < min_dist)
                {
                    near_p = points[i];
                    near_plus = points[i + 1];
                    min_dist = v_len_2d(points[i]);
                }
            }
        }
        if (min_dist < 1.2 * v_len_2d(near_plus))
        {
            result.push([near_p[0] + center[0], near_p[1] + center[1]]);
        }
        dir = rot_V_2d(dir, alpha);

        min_dist = 76548876;
    }


    return result;
}

export function getViewBoxSize(dirMass: number[][], anglesMass: number[], lambertCenter: number[], padding:number)
{
    let xMax: number;
    let xMin: number;
    let yMax: number;
    let yMin: number;

    let max: number = 0;

    for (let i = 0; i < dirMass.length; i ++){
        
        xMax = RotateAroundY(dirMass[i], anglesMass[i])[0];
        xMin = RotateAroundY(dirMass[i], -anglesMass[i])[0];
        yMax = RotateAroundX(dirMass[i], anglesMass[i])[1];
        yMin = RotateAroundX(dirMass[i], -anglesMass[i])[1];

        
        // xMax = convertToLambert(RotateAroundY(dirMass[i], anglesMass[i]), lambertCenter)[0];
        // xMin = convertToLambert(RotateAroundY(dirMass[i], -anglesMass[i]), lambertCenter)[0];
        // yMax = convertToLambert(RotateAroundX(dirMass[i], anglesMass[i]), lambertCenter)[1];
        // yMin = convertToLambert(RotateAroundX(dirMass[i], -anglesMass[i]), lambertCenter)[1];

        
        if (Math.abs(xMax) > max) {
          max = Math.abs(xMax);
        }
        if (Math.abs(xMin) > max) {
          max = Math.abs(xMin);
        }
        if (Math.abs(yMax) > max) {
          max = Math.abs(yMax);
        }
        if (Math.abs(yMin) > max) {
          max = Math.abs(yMin);
        }
    }



    let viewBoxSize: string = String(-max - padding) + ' ';
    viewBoxSize += String(-max - padding) + ' ';
    viewBoxSize += String(2 * (max + padding)) + ' ';
    viewBoxSize += String(2 * (max + padding));

    return viewBoxSize;
}

export function getPointSize(viewBoxSize: string){
    let boxHeight =  parseFloat(viewBoxSize.split(' ')[3]) / 350;
    return boxHeight;
}


export function getOnePointInCenteredBox(dir: number[], phi:number, window: number){

    let calcPointsNumb = 180;
    dir = NormalizeV(dir);

    let my_point = getOneCirclePoint(dir, phi);

    let leftLimit: number = -window;
    let rightLimit: number = window;
    let topLimit: number = window;
    let bottomLimit: number = -window;

    let onePoint: number[] = [];

    // find one point in window using big step
    for ( let i = 0; i < calcPointsNumb; i ++ ) {
        my_point = RotateAroundV(my_point, dir, 360 / calcPointsNumb);
        
        if (my_point[1] < topLimit && 
            my_point[1] > bottomLimit && 
            my_point[0] < rightLimit && 
            my_point[0] > leftLimit && 
            my_point[2] > 0) {
                
            onePoint = my_point;
            break;
        }
        
    }
    return onePoint;
}



export function PlotArcInBox(dir: number[], phi:number, window: number, circlePointsNumb: number)
{
  
    let points = [];
    dir = NormalizeV(dir);


    let leftLimit: number = -window;
    let rightLimit: number = window;
    let topLimit: number = window;
    let bottomLimit: number = -window;

    let onePoint: number[] = getOnePointInCenteredBox(dir, phi, window);

    // rotate one point in + with little step
    let rotPoint: number[] = onePoint;

    for ( let i = 0; i < circlePointsNumb; i ++ ) {
        if (
            rotPoint[1] < topLimit && 
            rotPoint[1] > bottomLimit && 
            rotPoint[0] < rightLimit && 
            rotPoint[0] > leftLimit 
        ) {
            rotPoint = RotateAroundV(rotPoint, dir, -360 / circlePointsNumb);
            points.push( rotPoint );
        }
    }

    points.reverse();

    // rotate one point in - with little step
    rotPoint = onePoint;


    for ( let i = 0; i < circlePointsNumb; i ++ ) {

        if (
            rotPoint[1] < topLimit && 
            rotPoint[1] > bottomLimit && 
            rotPoint[0] < rightLimit && 
            rotPoint[0] > leftLimit 
        ) {
            rotPoint = RotateAroundV(rotPoint, dir, 360 / circlePointsNumb);              
            points.push( rotPoint );
        }
    }
    return points;
}





export function getOneCirclePoint(dir: number[], phi:number){

    let direction = NormalizeV(dir);

    let xp: number;
    let yp: number;
    let zp: number;
    let perp: number[];

    if ((direction[0] == -1 || direction[0] == 1) && direction[1] == 0 && direction[2] == 0){
        xp = 0;
        yp = 1;
        zp = 1;
        perp = NormalizeV([xp, yp, zp]);
    }
    else if (direction[0] == 0 && (direction[1] == -1 || direction[1] == 1) && direction[2] == 0){
        xp = 1;
        yp = 0;
        zp = 1;
        perp = NormalizeV([xp, yp, zp]);
    }
    else if (direction[0] == 0 && direction[1] == 0 && (direction[2] == 1 || direction[2] == -1)){
        xp = 1;
        yp = 1;
        zp = 0;
        perp = NormalizeV([xp, yp, zp]);
    }
    else {
        xp = 0.0001;
        yp = 0.0001;
        zp = (-1) * (direction[0] * xp + direction[1] * yp) / direction[2];
        perp = NormalizeV([xp, yp, zp]);
    }


    return RotateAroundV(direction, perp, phi);
}



export function centerToBack(input: number[], dir: number[]){
    let point = input;
    dir = NormalizeV(dir);

    if (dir[0] >= 0 && dir[1] >= 0 && dir[2] >= 0) {

        let diryrot = RotateAroundY(dir, -angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI);
        let xrot = RotateAroundX(point, -angle_between_v(diryrot, [0, 0, 1]) * 180 / Math.PI);
        let yrot = RotateAroundY(xrot, angle_between_v([0, 0, 1], [dir[0], 0,dir[2]]) * 180 / Math.PI);
        point = yrot;
    }

    if (dir[0] >= 0 && dir[1] >= 0 && dir[2] <= 0) {

        let diryrot = RotateAroundY(dir, -(0 + angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI));
        let xrot = RotateAroundX(point, -angle_between_v(diryrot, [0, 0, 1]) * 180 / Math.PI);
        let yrot = RotateAroundY(xrot, (0 + angle_between_v([0, 0, 1], [dir[0], 0,dir[2]]) * 180 / Math.PI));
        point = yrot;

    }

    if (dir[0] >= 0 && dir[1] <= 0 && dir[2] <= 0) {
        let diryrot = RotateAroundY(dir, -(0 + angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI));
        let xrot = RotateAroundX(point, angle_between_v(diryrot, [0, 0, 1]) * 180 / Math.PI);
        let yrot = RotateAroundY(xrot, (0 + angle_between_v([0, 0, 1], [dir[0], 0,dir[2]]) * 180 / Math.PI));
        point = yrot;
    }

    if (dir[0] >= 0 && dir[1] <= 0 && dir[2] >= 0) {
        let diryrot = RotateAroundY(dir, -angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI);
        let xrot = RotateAroundX(point, angle_between_v(diryrot, [0, 0, 1]) * 180 / Math.PI);
        let yrot = RotateAroundY(xrot, angle_between_v([0, 0, 1], [dir[0], 0,dir[2]]) * 180 / Math.PI);
        point = yrot;
    }

    if (dir[0] <= 0 && dir[1] >= 0 && dir[2] >= 0) {
        let diryrot = RotateAroundY(dir, angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI);
        let xrot = RotateAroundX(point, -angle_between_v(diryrot, [0, 0, 1]) * 180 / Math.PI);
        let yrot = RotateAroundY(xrot, -angle_between_v([0, 0, 1], [dir[0], 0,dir[2]]) * 180 / Math.PI);
        point = yrot;
    }
    if (dir[0] <= 0 && dir[1] <= 0 && dir[2] >= 0) {
        let diryrot = RotateAroundY(dir, angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI);
        let xrot = RotateAroundX(point, angle_between_v(diryrot, [0, 0, 1]) * 180 / Math.PI);
        let yrot = RotateAroundY(xrot, -angle_between_v([0, 0, 1], [dir[0], 0,dir[2]]) * 180 / Math.PI);
        point = yrot;
    }
    if (dir[0] <= 0 && dir[1] >= 0 && dir[2] <= 0) {
        let diryrot = RotateAroundY(dir, (0 + angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI));
        let xrot = RotateAroundX(point, -angle_between_v(diryrot, [0, 0, 1]) * 180 / Math.PI);
        let yrot = RotateAroundY(xrot, -(0 + angle_between_v([0, 0, 1], [dir[0], 0,dir[2]]) * 180 / Math.PI));
        point = yrot;
    }
    if (dir[0] <= 0 && dir[1] <= 0 && dir[2] <= 0) {
        let diryrot = RotateAroundY(dir, (0 + angle_between_v([0, 0, 1], [dir[0], 0, dir[2]]) * 180 / Math.PI));
        let xrot = RotateAroundX(point, angle_between_v(diryrot, [0, 0, 1]) * 180 / Math.PI);
        let yrot = RotateAroundY(xrot, -(0 + angle_between_v([0, 0, 1], [dir[0], 0,dir[2]]) * 180 / Math.PI));
        point = yrot;
    }

    return point;
}



// эта функция рисует меридиан по парпендикуляру к плоскости меридиана. точки совпадают с градусной сеткой
export function plotMeridianCircle(dir: number[], pointsCount: number){

    dir = NormalizeV(dir);
    let point = [0, 0, 1];
    let res: number[][] = [point];
    
    for (let i = 0; i < pointsCount; i++){
        point = RotateAroundX(point, 360 / pointsCount)
        res.push(point);
    }

    for (let i = 0; i < pointsCount; i++){
        res[i] = RotateAroundY(res[i], angle_between_v(dir, [0, 0, 1]) * 180 / Math.PI)
        res.push(point);
    }
    return res;
}

// эта функция рисует паралель по точке, принадлежащейе паралали. точки совпадают с градусной сеткой
export function plotParalellCircle(dir: number[], pointsCount: number){
    dir = NormalizeV(dir);
    
    let point = RotateAroundX([0, 0, 1], angle_between_v([dir[0], 0, dir[2]], [dir[0], dir[1], dir[2]]) * 180 / Math.PI);
    let res: number[][] = [point];
    
    for (let i = 0; i < pointsCount; i++){
        point = RotateAroundY(point, 360 / pointsCount)
        res.push(point);
    }
    return res;
}

// эта функция обрезает концы паралелей, выходящие за рамку. концы могут пересекать 
// рамку через две из 4 сторон рамки. тут рассматриваются все варианты пересечения
export function cutParEnd(line: number[][], window: number){
    if (line.length == 0){
        return [];
    }
    let leftLimit: number = -window;
    let rightLimit: number = window;
    let topLimit: number = window;
    let bottomLimit: number = -window;

    let res: number[][] = line;
    let endPoint: number[] = line[line.length - 1];
    let startPoint: number[] = line[0];

    if (startPoint[0] < leftLimit) {

        let k:number = (startPoint[1] - res[1][1]) / (startPoint[0] - res[1][0]);
        let b: number = startPoint[1] - k * startPoint[0];
        startPoint = [-window, -window * k + b, startPoint[2]];

        for (let i: number = 0; i < res.length - 1; i++){
            if (res[i][0] < leftLimit){
                res[i] = startPoint;
            }
            else{
                break;
            }
        }


    }
    
    if (endPoint[0] > rightLimit) {

        let k:number = (endPoint[1] - res[res.length - 2][1]) / (endPoint[0] - res[res.length - 2][0]);
        let b: number = endPoint[1] - k * endPoint[0];
        endPoint = [window, window * k + b, endPoint[2]];

        let i: number = res.length - 1;
        for (let i: number = res.length - 1; i > 1; i--){
            if (res[i][0] > rightLimit){
                res[i] = endPoint;
            }
            else{
                break;
            }
        }


    }

    if (endPoint[1] < bottomLimit) {
        let i: number = line.length - 1;
        for (let i: number = line.length - 1; i > 1; i--){
            if (line[i][1] > -topLimit){
                res.splice(i + 1, res.length - i + 1);
                break;
            }
        }
        let k:number = (endPoint[1] - line[line.length - 2][1]) / (endPoint[0] - line[line.length - 2][0]);
        let b: number = endPoint[1] - k * endPoint[0];
        endPoint = [(-window - b) / k, -window, endPoint[2]];
    }


    if (startPoint[1] < bottomLimit) {
        for (let i: number = 0; i < res.length - 1; i++){
            if (line[i][1] > -topLimit){
                res = res.slice(i - 1);
                break;
            }
        }
        let k:number = (startPoint[1] - line[1][1]) / (startPoint[0] - line[1][0]);
        let b: number = startPoint[1] - k * startPoint[0];
        startPoint = [(-window - b) / k, -window, startPoint[2]];
    }


    // res[line.length - 1] = endPoint;
    // res[0] = startPoint;
    for (let i: number = 0; i < res.length; i++){
        if (line[i][1] > topLimit){
            line[i][1] = topLimit;
        }
    }


    return res;

}








// // эта функция обрезает концы меридианов, выходящие за рамку. концы могут пересекать 
// // рамку через две из 4 сторон рамки. тут рассматриваются все варианты пересечения
// // если конец пересекает одну из 4 сторон, то функция меняет его координаты так,
// // чтобы конец лег на рамку

// for meridians
export function cutMerEnd(line: number[][], window: number){
    
    if (line.length == 0){
            return [];
    }
    let leftLimit: number = -window;
    let rightLimit: number = window;
    let topLimit: number = window;
    let bottomLimit: number = -window;

    let res: number[][] = cutParEnd(line, window);
    // let res: number[][] = line;

    let endPoint: number[] = res[res.length - 1];
    let startPoint: number[] = res[0];


    if (res[res.length - 1][1] == topLimit){
        let k: number = (res[res.length - 4][1] - res[res.length - 3][1]) / (res[res.length - 4][0] - res[res.length - 3][0]);
        let b: number = res[res.length - 4][1] - k * res[res.length - 4][0];
        
        res[res.length - 1][0] = (topLimit - b) / k;
        
        let i: number = res.length - 1;
        for (let i: number = res.length - 1; i > 1; i--){
            if (res[i][1] == topLimit){
                res[i][0] = res[res.length - 1][0];
            }
            else{
                break;
            }
        }
    
    }

    if (startPoint[0] > rightLimit) {

        let k:number = (startPoint[1] - res[res.length - 2][1]) / (startPoint[0] - res[res.length - 2][0]);
        let b: number = startPoint[1] - k * startPoint[0];
        startPoint = [window, window * k + b, startPoint[2]];


        for (let i: number = 0; i < res.length - 1; i++){
            if (res[i][0] > rightLimit){
                res[i] = startPoint;
            }
            else{
                break;
            }
        }
    }
    res[0] = startPoint;

    if (endPoint[0] < leftLimit) {

        let k:number = (endPoint[1] - res[res.length - 2][1]) / (endPoint[0] - res[res.length - 2][0]);
        let b: number = endPoint[1] - k * endPoint[0];
        endPoint = [-window, -window * k + b, endPoint[2]];

        let i: number = res.length - 1;
        for (let i: number = res.length - 1; i > 1; i--){
            if (res[i][0] < leftLimit){
                res[i] = endPoint;
            }
            else{
                break;
            }
        }
    }



    
    if (res[0][1] < -topLimit) {
        let k:number = (res[1][1] - res[2][1]) / (res[1][0] - res[2][0]);
        let b: number = res[1][1] - k * res[1][0];
        res[0] = [(-window - b) / k, -window, res[0][2]];


        for (let i: number = 0; i < res.length - 1; i++){
            if (res[i][1] < -topLimit){
                res[i] = res[0];
            }
            else{
                break;
            }
        }

    }


    
    if (res[res.length - 1][1] > -bottomLimit) {
        let k:number = (res[res.length - 1][1] - res[res.length - 2][1]) / (res[res.length - 1][0] - res[res.length - 2][0]);
        let b: number = res[res.length - 1][1] - k * res[res.length - 1][0];
        res[res.length - 1] = [(window - b) / k, window, res[res.length - 1][2]];


        for (let i: number = res.length - 1; i > 1; i--){
            if (res[res.length - 1][1] > -bottomLimit){
                res[i] = res[res.length - 1];
            }
            else{
                break;
            }
        }

    }

    return res;

}







