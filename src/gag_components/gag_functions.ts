
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

export function cordsToKey(coord: number[]) {
    var key = Math.random;
    return key;
}

export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
export function getRandomfloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function DekVgeo(x: number, y: number, z: number)
{
    var R = 1;
    var phi = Math.asin(z / R) * 180 / Math.PI;
    var lmbd = Math.atan(y / x) * 180 / Math.PI;
    return [phi, lmbd];
}

export function GeoVdek(r: number, phi: number, lmbd: number)
{
    phi = phi * Math.PI / 180;
    lmbd = lmbd * Math.PI / 180;
    var X = r * Math.cos(phi) * Math.cos(lmbd);
    var Y = r * Math.cos(phi) * Math.sin(lmbd);
    var Z = r * Math.sin(phi);
    var C = RotateAroundV([X, Y, Z], [1,0,0], 90);
    return C;
}

export function vector_length(v:number[]) { return Math.sqrt( v[0] * v[0] + v[1] * v[1] + v[2] * v[2] ); }

export function points_dist(p1:number[], p2:number[]) {
    return Math.sqrt( (p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]) + (p1[2] - p2[2]) * (p1[2] - p2[2]));
}

export function angle_between_v(v1: number[], v2: number[])
{
    var angle;
    angle = Math.acos( (v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]) / ( vector_length(v1) * vector_length(v2) ) );

    if (angle > 180) { angle -= 180; }
        return angle;
}



//-----------------------------------------------------------------------
// matrix mod functions
//-----------------------------------------------------------------------

export function MultiplyMatrix(A: number[][], B: number[])
{
    var C = [0, 0, 0];

    C[0] = A[0][0] * B[0] + A[0][1] * B[1] + A[0][2] * B[2];
    C[1] = A[1][0] * B[0] + A[1][1] * B[1] + A[1][2] * B[2];
    C[2] = A[2][0] * B[0] + A[2][1] * B[1] + A[2][2] * B[2];

    return C;
}

export function RotateAroundV(B: number[], V: number[], phi: number)
{
    phi = phi * Math.PI / 180;

    var x = V[0];
    var y = V[1];
    var z = V[2];

    let A = [
        [Math.cos(phi) + (1 - Math.cos(phi)) * x * x, (1 - Math.cos(phi)) * x * y - z * Math.sin(phi), (1 - Math.cos(phi)) * x * z + y * Math.sin(phi)],
        [(1 - Math.cos(phi)) * y * x + z * Math.sin(phi), Math.cos(phi) + (1 - Math.cos(phi)) * y * y, (1 - Math.cos(phi)) * y * z - x * Math.sin(phi)],
        [(1 - Math.cos(phi)) * z * x - y * Math.sin(phi), (1 - Math.cos(phi)) * z * y + x * Math.sin(phi), Math.cos(phi) + (1 - Math.cos(phi)) * z * z]
    ];


    var C = MultiplyMatrix(A, B)

    return C;
}

export function RotateAroundZ(B: number[], phi: number)
{
    phi = phi * Math.PI / 180;

    let A = [
                [ Math.cos(phi), -Math.sin(phi), 0 ],
                [ Math.sin(phi), Math.cos(phi), 0 ],
                [ 0, 0, 1 ],
            ];

    var C = MultiplyMatrix(A, B)

    return C;
}

export function RotateAroundY(B: number[], phi: number)
{
    phi = phi * Math.PI / 180;

    let A = [
                [ Math.cos(phi), 0, Math.sin(phi) ],
                [ 0, 1, 0 ],
                [ -Math.sin(phi), 0, Math.cos(phi) ],
            ];

    var C = MultiplyMatrix(A, B)

    return C;
}
export function RotateAroundX(B: number[], phi: number)
{
    phi = phi * Math.PI / 180;

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

export function PlotCircle(direction: number[], phi: number, circle_points_numb: number)
{
    direction = NormalizeV(direction);

    //-------------------------------------------------------------------
    //plot solid line
    //-------------------------------------------------------------------

    if ((direction[0] == -1 || direction[0] == 1) && direction[1] == 0 && direction[2] == 0){
        var xp = 0;
        var yp = 1;
        var zp = 1;
        var perp = NormalizeV([xp, yp, zp]);
    }
    else if (direction[0] == 0 && (direction[1] == -1 || direction[1] == 1) && direction[2] == 0){
        var xp = 1;
        var yp = 0;
        var zp = 1;
        var perp = NormalizeV([xp, yp, zp]);
    }
    else if (direction[0] == 0 && direction[1] == 0 && (direction[2] == 1 || direction[2] == -1)){
        var xp = 1;
        var yp = 1;
        var zp = 0;
        var perp = NormalizeV([xp, yp, zp]);
    }
    else {
        var xp = 0.0001;
        var yp = 0.0001;
        var zp = (-1) * (direction[0] * xp + direction[1] * yp) / direction[2];
        var perp = NormalizeV([xp, yp, zp]);
    }

    var my_point = direction;
    my_point = RotateAroundV(my_point, perp, phi);

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


export function centering(in_points: number[][], dir: number[]){

    var res = [];
    // var vertical_v = RotateAroundV([0, 1, 0], get_perp([0, 0, 1], dir), -angle_between_v([0, 0, 1], dir) * 180 / Math.PI);
    var points = in_points;
    for ( var i = 0; i < points.length; i ++ ) {


        points[i] = RotateAroundV(points[i], get_perp([0, 0, 1], dir), -angle_between_v([0, 0, 1], dir) * 180 / Math.PI);
        // points[i] = RotateAroundZ(points[i], -angle_between_v([0, 1, 0], [vertical_v[0], vertical_v[1], 0]) * 180 / Math.PI);


        if (points[i][2] >= 0) {
            res.push(points[i]);
       }
    }

    if (res.length < points.length){
        for ( var i = 0; i < points.length; i ++ ) {
            if (res[i] != points[i]){
                return res.slice(i,res.length).concat(res.slice(0, i));

            }
        }
    }
        return res;
}

export function make_coords(points: number[][]){

    var s = "";
    var res = [];

    for ( let j = 0; j < points.length; j ++ ) {
        if (points[j][2] >= 0) {
            res.push([points[j][0], points[j][1]]);
        }
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

    var x1 = v[0] * t1;
    var y1 = v[1] * t1;
    var z1 = v[2] * t1;

    var x2 = v[0] * t2;
    var y2 = v[1] * t2;
    var z2 = v[2] * t2;


    if (z1 > 0){
        return [x1, y1, z1];
    }
    else {
        return [x2, y2, z2];
    }
}


export function convertToLambert(v: number[], fish_dir: number[]) {

    var my_perp = get_perp([0, 0, 1], fish_dir);
    var r2_proj = RotateAroundV(v, my_perp, -angle_between_v([0, 0, 1], fish_dir) * 180 / Math.PI);

    return lineSphereIntersect(r2_proj);
}

export function lambertMass(points: number[][], fish_dir: number[]){

    var result = [];
    for (var i = 0; i < points.length; i++)
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
    var angle;
    angle = Math.acos( (v1[0] * v2[0] + v1[1] * v2[1]) / ( v_len_2d(v1) * v_len_2d(v2) ) );

    if (angle > 180) { angle -= 180; };

    return Math.abs(angle * 180 / Math.PI);

}

export function rot_V_2d(v: number[], alpha: number)
{

    alpha = alpha * Math.PI / 180;

    var x =  v[0] * Math.cos(alpha) - v[1] * Math.sin(alpha);
    var y = v[0] * Math.sin(alpha) + v[1] * Math.cos(alpha);
    return [x, y];
}



export function zone_square(points_number: number, all_points: number, ) { return points_number / all_points;};

export function poly_contour(points: number[][], center: number[])
{

    for (var i = 0; i < points.length; i++)
    {
        points[i] = [points[i][0] - center[0], points[i][1] - center[1]];
    }
    var sect_numb = 120;

    var alpha = 360 / sect_numb;
    var dir = [0, 1];
    var min_dist = 76548876;
    var near_p = [87,8568,87658];
    var near_plus = [ 200, 200];

    var result = [];


    for (var j = 0; j < sect_numb; j++)
    {
        for (var i = 0; i < points.length - 1; i++)
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
