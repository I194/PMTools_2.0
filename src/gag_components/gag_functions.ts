
//-----------------------------------------------------------------------
// projections func
//-----------------------------------------------------------------------
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

export function PlotCircle(direction: number[], phi: number)
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

    var circle_points_numb = 2 * 720;

    for ( let i = 0; i < circle_points_numb; i ++ ) {
        my_point = RotateAroundV(my_point, direction, 360 / circle_points_numb);
        points4.push( [my_point[0], my_point[1], my_point[2]] ) ;
    }

    return points4;
}

//-----------------------------------------------------------------------
// begin
//-----------------------------------------------------------------------


export function centering(points: number[][], dir: number[]){

    var res = [];
    // var vertical_v = RotateAroundV([0, 1, 0], get_perp([0, 0, 1], dir), -angle_between_v([0, 0, 1], dir) * 180 / Math.PI);

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



export function my_reload(){

//     if (confirm('Вы действительно хотите обновить страницу?'))
//     {
//         window.location.reload();
//     }
}

export function convertToLambert(v: number[], center_zone: number[]) {
  // Декартовы координаты точки
  var dx = v[0];
  var dy = v[1];
  var dz = v[2];

  // Радиус сферы
  var r = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Расчет широты и долготы точки в радианах
  var lat = Math.acos(dz / r);
  var lon = Math.atan2(dy, dx);

  // Параметры проекции Ламберта
  var phi0 = Math.PI / 2; // широта центрального меридиана
  var lam0 = 0; // долгота центрального меридиана
  var phi0 = DekVgeo(center_zone[0], center_zone[1], center_zone[2])[0] * Math.PI / 180; // широта центрального меридиана
  var lam0 = DekVgeo(center_zone[0], center_zone[1], center_zone[2])[1] * Math.PI / 180; // долгота центрального меридиана

  // Параметры зоны проекции Ламберта
  var k = 1; // масштабный коэффициент
  var n = 0.5; // коэффициент сжатия
  var theta = Math.asin(n); // угол между осью x и осью, на которой масштабное изменение задано

  // Расчет координат в проекции Ламберта
  var phi = lat;
  var lam = lon - lam0;
  var xLambert = k * r * Math.sin(phi) * Math.sin(lam);
  var yLambert = k * r * (Math.sin(theta) * Math.cos(phi) - Math.cos(theta) * Math.sin(phi) * Math.cos(lam));

  // Возвращаем результат в виде объекта
  return {
    x: xLambert,
    y: yLambert
  };
}

export function lambert_conic(points: number[][], center_zone: number[]){

    var result = [];
    var lambert;

    for (var i = 0; i < points.length; i++)
    {
        lambert = convertToLambert(points[i], center_zone);
        result.push([lambert.x, lambert.y]);
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



export function zone_square(points_number: number, all_points: number, ) { return 4 * Math.PI * 1 * points_number / all_points;};

export function poly_contour(points: number[][], center: number[], s: number)
{
    console.log('s');
    console.log(s);
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
    if (s > 0.00008) { return result; }
    else { return [[0,0], [0,0]]}
//     if (s > 0.00015) {return result;}
//     else
//     {
//         var sred = 0;
//
//         for (var i = 0; i < result.length; i++)
//         {
//             sred += v_len_2d(result[i]);
//         }
//
//         sred = sred / result.length;
//
//         var result1 = [result[0]];
//
//         for (var i = 0; i < result.length; i++)
//         {
//             if (v_len_2d(result[i]) < sred) {
//                 result1.push(result[i]);
//             }
//         }
//
//         return result1;
//     }
}

// function IncDecF = NED2IDF(NEDVector)
// %NED2IDF  Transform NED-data to IDF-data (in grad and microteslas).
// %Usage: IncDecF = NED2IDF(NEDVector)
//
//        TO_GRAD=180.0/pi;
//        IncDecF=0.0*NEDVector;
//
//        IncDecF(3)=norm(NEDVector);
//        if IncDecF(3) <= 0.0
//             return;
//        end
//
//        IncDecF(1)=asin(NEDVector(3)/IncDecF(3));
//        IncDecF(2) = acos(NEDVector(1)/(IncDecF(3)*cos(IncDecF(1))))*TO_GRAD;
//        if NEDVector(2) < 0.0
//            IncDecF(2) = -IncDecF(2);
//        end
//        IncDecF(1) = IncDecF(1)*TO_GRAD;
//
//        return


