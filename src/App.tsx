import React, {createElement as e, useState} from 'react';
import "./style.css";
import {My_interface} from "./gag_components/my_input";
import {zoomed_graph} from "./gag_components/zoomed_graph";
import {zoomed_lambert_graph} from "./gag_components/zoomed_lambert_graph";
import {rotate_sphere} from "./gag_components/rotate_sphere";
import {default_sphere} from "./gag_components/default_sphere";

// / <reference path="./gag_components/gag_functions.ts"/>


import {GeoVdek, getRandomfloat} from "./gag_components/gag_functions.ts";

function App() {


    //-----------------------------------------------------------
    // input data generating
    //-----------------------------------------------------------


    var cmadlist = [7.69, 3.9, 3.18, 2.88,
                    2.71, 2.63, 2.57, 2.54,
                    2.51, 2.48, 2.46, 2.44,
                    2.43, 2.43];
    var camadlist = [6.0, 5.0, 4.63, 4.43,
                    4.31, 4.24, 4.18, 4.14,
                    4.12, 4.11, 4.08, 4.08,
                    4.06, 4.05];


    var max_lon = 95;
    var min_lon = 91;
    var max_lat = 5;
    var min_lat = 1;


    var paleo_data_list = [
        GeoVdek( 1, getRandomfloat(min_lat, max_lat), getRandomfloat(min_lon, max_lon) ),
        GeoVdek( 1, getRandomfloat(min_lat, max_lat), getRandomfloat(min_lon, max_lon) ),
        GeoVdek( 1, getRandomfloat(min_lat, max_lat), getRandomfloat(min_lon, max_lon) ),
        GeoVdek( 1, getRandomfloat(min_lat, max_lat), getRandomfloat(min_lon, max_lon) ),
        GeoVdek( 1, getRandomfloat(min_lat, max_lat), getRandomfloat(min_lon, max_lon) ),
        GeoVdek( 1, getRandomfloat(min_lat, max_lat), getRandomfloat(min_lon, max_lon) ),
        GeoVdek( 1, getRandomfloat(min_lat, max_lat), getRandomfloat(min_lon, max_lon) )
        ];

//
//
//     var dir_list = [];
//     var angle_list = [];
//     var random_dir = NormalizeV( [ getRandomfloat(0, 1), getRandomfloat(0, 1), getRandomfloat(0, 1) ] );
//     var random_angle = getRandomfloat(0, 180);
// //     var random_dir = NormalizeV( [12.25332872287876, 0.62710598184995592, 0.7081437582222506] );
// //     var random_angle = -38.37150716636394;
//
//     for ( var i = 0; i < 6; i ++ ) {
//
//         paleo_data_list[i] = RotateAroundV(paleo_data_list[i], random_dir, random_angle);
//
//         // this lists will use later
//         dir_list.push(NormalizeV(paleo_data_list[i]));
//         angle_list.push(cmadlist[8]);
//     }
//
//
//     //-----------------------------------------------------------------------
//     // making grid dots
//     //-----------------------------------------------------------------------
//
//     var x;
//     var y;
//     var m;
//     var grid_points = [];
//
//     var print_point = 0;
//     var print_point = 0;
//
//     var phi = 0.013;
//     var points_numb = 1000000;
//
//
//     for (var i = 0; i < points_numb; i++)
//     {
//         x = (i * phi - Math.round(i * phi)) * 360;
//         y = (i / points_numb - Math.round(i / points_numb)) * 360;
//
//         m = GeoVdek(1, x, y);
//
//         for (var j = 0; j < dir_list.length; j++ )
//         {
//             if (angle_between_v(dir_list[j], m) < angle_list[j] * Math.PI / 180)
//             {
//                 print_point = 1;
//             }
//             else { print_point = 0; break; }
//         }
//
//         if (print_point == 1)
//         {
//             grid_points.push(m);
//
//         }
//         print_point = 0;
//     }
//
//
//
//     //---------------------------------------------------------------------------------------
//     // center zone calc
//     //---------------------------------------------------------------------------------------
//
//     var center_zone = [0,0,0];
//
//     for (var i = 0; i < grid_points.length; i++)
//     {
//         center_zone[0] += grid_points[i][0];
//         center_zone[1] += grid_points[i][1];
//         center_zone[2] += grid_points[i][2];
//     }
//     center_zone = NormalizeV(center_zone);
//
//     //---------------------------------------------------------------------------------------
//     // making spheral grid for left svg
//     //---------------------------------------------------------------------------------------
//
//     grid_points = centering(grid_points, center_zone);
//
//     var grid = [];
//
//     for ( let i = 0; i < grid_points.length; i ++ ) {
//         grid.push(
//             e('circle',
//                 {
//                     r: 0.00035,
//                     cx: String(grid_points[i][0]),
//                     cy: String(grid_points[i][1]),
//                     fill: '#7B8289',
//                 }, ''
//             )
//         );
//     }
//
//
//
//     //-----------------------------------------------------------------
//     // polygons of zone for left svg 2
//     //-----------------------------------------------------------------
// //
// //     //     var color_poly = [];
// //     var input: [number, number][] = [];
// //
// //     for ( let i = 0; i < grid_points.length; i ++ )
// //     {
// //         input.push([grid_points[i][0], grid_points[i][1]]);
// //     }
// //
// //     var cpoly = convexHull(input);
// //     var poly_points = [];
// //
// //     for ( let i = 0; i < cpoly.length; i ++ )
// //     {
// //         poly_points.push([cpoly[i][0], cpoly[i][1], 1]);
// //     }
// //
// //
// //     for ( var i = 0; i < poly_points.length; i ++ )
// //         color_poly.push(
// //             e('polygon',
// //                 {
// //                     points: make_coords(poly_points),
// //                     fill: '#AAE1BF',
// //                 }, ''
// //             )
// //         );
//     //-----------------------------------------------------------------
//     // add coords of circles around paleo dirs for left svg
//     //-----------------------------------------------------------------
//
//     var left_circles = [];
//     var my_key = 547787;
//     for ( var i = 0; i < dir_list.length; i ++ ) {
//
//         var dir_circle = centering(PlotCircle(dir_list[i], angle_list[i]), center_zone);
//
//         left_circles.push(
//                                 e('polyline',
//                                     {
//                                         key: my_key,
//                                         points: make_coords(dir_circle),
//                                         stroke: "black",
//                                         fill: 'none',
//                                         strokeWidth: "0.001px",
//                                         strokeDasharray: "0.01px, 0.003px",
// //                                         stroke-dashoffset
//                                     }, ''
//                                 )
//                             );
//         my_key++;
//     }
//     //-----------------------------------------------------------------
//     // polygons of zone for left svg 1
//     //-----------------------------------------------------------------
//     var color_poly = [];
//     var input: [number, number][] = [];
//     var circ_p = [];
//
//     for ( var i = 0; i < dir_list.length; i ++ )
//     {
//         var b = centering(PlotCircle(dir_list[i], angle_list[i]), center_zone);;
//
//         for (var j = 0; j < b.length; j++){
//             circ_p.push(b[j]);
//         }
//     }
//
//     for ( let i = 0; i < circ_p.length; i ++ )
//     {
//         input.push([circ_p[i][0], circ_p[i][1]]);
//     }
//     var rot_center_zone = RotateAroundV(center_zone, get_perp([0, 0, 1], center_zone), -angle_between_v([0, 0, 1], center_zone) * 180 / Math.PI);
//
//     var poly_points2d = poly_contour(input, [rot_center_zone[0], rot_center_zone[1]], zone_square(grid_points.length, points_numb));
//     var poly_points3d = [];
//
//     for ( let i = 0; i < poly_points2d.length; i ++ )
//     {
//         poly_points3d.push([poly_points2d[i][0], poly_points2d[i][1], 1 ]);
//     }
//
//     color_poly.push(
//         e('polygon',
//             {
//                 points: make_coords(poly_points3d),
//                 fill: '#77D685',
//             }, ''
//         )
//     );
//
//     //-----------------------------------------------------------------
//     // making center zone for drawing on left svg
//     //-----------------------------------------------------------------
//
//     var rot_center_zone = RotateAroundV(center_zone, get_perp([0, 0, 1], center_zone), -angle_between_v([0, 0, 1], center_zone) * 180 / Math.PI);
//
//     var left_center_zone = e('circle',
//                             {
//                                 key: my_key,
//                                 r: 0.0018,
//                                 cx: String(rot_center_zone[0]),
//                                 cy: String(rot_center_zone[1]),
//                                 fill: '#4054E7',
//
//                             }, ''
//                         );
//     my_key++;
//     //---------------------------------------------------------------------------------------
//     // making spheral grid for lambert svg
//     //---------------------------------------------------------------------------------------
//
//     grid_points = centering(grid_points, center_zone);
//
//     var grid_lambert = [];
//
//     for ( let i = 0; i < grid_points.length; i ++ ) {
//         grid_lambert.push(
//             e('circle',
//                 {
//                     r: 0.0005,
//                     cx: String(grid_points[i][0]),
//                     cy: String(grid_points[i][1]),
//                     fill: '#199456',
//                 }, ''
//             )
//         );
//     }
//
//     //-----------------------------------------------------------------
//     // making center zone for drawing on lambert svg
//     //-----------------------------------------------------------------
//
//     var rot_center_zone = RotateAroundV(center_zone, get_perp([0, 0, 1], center_zone), -angle_between_v([0, 0, 1], center_zone) * 180 / Math.PI)
//
//     var lambert_center_zone = e('circle',
//                             {
//                                 key: my_key,
//                                 r: 0.0018,
//                                 cx: String(rot_center_zone[0]),
//                                 cy: String(rot_center_zone[1]),
//                                 fill: 'red',
//
//                             }, ''
//                         );
//     my_key++;
//
//     //-----------------------------------------------------------------
//     // add coords of circles around paleo dirs for lambert svg
//     //-----------------------------------------------------------------
//
//     var lambert_circles = [];
//     var my_key = 547787;
//     for ( var i = 0; i < dir_list.length; i ++ ) {
//
//         var dir_circle = centering(PlotCircle(dir_list[i], angle_list[i]), center_zone);
//         lambert_circles.push(
//                                 e('polyline',
//                                     {
//                                         key: my_key,
//                                         points: make_coords(dir_circle),
//                                         stroke: "black",
//                                         fill: 'none',
//                                         strokeWidth:"0.001px",
//                                         strokeDasharray: 50,
//
//                                     }, ''
//                                 )
//                             );
//         my_key++;
//     }
//
//
//     //-----------------------------------------------------------------
//     // making center zone for drawing on center svg
//     //-----------------------------------------------------------------
//
//     var rot_center_zone = RotateAroundV(center_zone, get_perp([0, 0, 1], center_zone), -angle_between_v([0, 0, 1], center_zone) * 180 / Math.PI)
//
//     var center_center_zone = e('circle',
//                             {
//                                 key: my_key,
//                                 r: 0.018,
//                                 cx: String(rot_center_zone[0]),
//                                 cy: String(rot_center_zone[1]),
//                                 fill: 'red',
//
//                             }, ''
//                         );
//     my_key++;
//     //-----------------------------------------------------------------
//     // add coords of circles around paleo dirs for center svg
//     //-----------------------------------------------------------------
//
//     var center_circles = [];
//
//     for ( var i = 0; i < dir_list.length; i ++ ) {
//
//         var dir_circle = centering(PlotCircle(dir_list[i], angle_list[i]), center_zone);
//         center_circles.push(
//                                 e('polyline',
//                                     {
//                                         key: my_key,
//                                         points: make_coords(dir_circle),
//                                         stroke: "black",
//                                         fill: 'none',
//                                         strokeWidth:"0.005px",
//                                         strokeDasharray: 50,
//
//                                     }, ''
//                                 )
//                             );
//         my_key++;
//     }
//
//
//     //-----------------------------------------------------------------
//     // making center degree grid to center svg
//     //-----------------------------------------------------------------
//
//     var coords = [];
//
//     var point = [0, 0, 1];
//
//
//     var mer_numb = 8;
//     for ( var i = 0; i < mer_numb; i ++ ) {
//         point = RotateAroundV(point, [0, 1, 0], 30 - 10 * mer_numb / 9);
//         var meridian = centering(PlotCircle(point, 90), center_zone);
//         coords.push(make_coords(meridian));
//     }
//
//     var par_numb = 8;
//     for ( var i = 0; i < par_numb; i ++ ) {
//         var paralel = centering(PlotCircle([0, 1, 0], i * (30 - 10 * mer_numb / 9)), center_zone);
//         coords.push(make_coords(paralel));
//     }
//
//     paralel = PlotCircle([0, 0, 1], 90);
//     coords.push(make_coords(paralel));
//
//     var center_degree_grid = [];
//     for ( let i = 0; i < coords.length; i ++ ) {
//         center_degree_grid.push(
//             e('polyline',
//                 {
//                     key: my_key,
//                     points: coords[i],
//                     stroke: "black",
//                     fill: 'none',
//                     strokeWidth:"0.007px"
//                 }, ''
//             )
//         );
//         my_key++;
//     }
//
//     //-----------------------------------------------------------------
//     // add coords of circles around paleo dirs for right svg
//     //-----------------------------------------------------------------
//
//     var right_circles = [];
//
//     for ( var i = 0; i < dir_list.length; i ++ ) {
//
//         var dir_circle = PlotCircle(dir_list[i], angle_list[i]);
//         right_circles.push(
//                                 e('polyline',
//                                     {
//                                         key: my_key,
//                                         points: make_coords(dir_circle),
//                                         stroke: "black",
//                                         fill: 'none',
//                                         strokeWidth:"0.005px",
//                                         strokeDasharray: 50,
//
//                                     }, ''
//                                 )
//                             );
//         my_key++;
//     }
//
//     //-----------------------------------------------------------------
//     // making right degree grid for right svg
//     //-----------------------------------------------------------------
//
//     var coords1 = [];
//
//     var point = [0, 0, 1];
//
//     var mer_numb = 8;
//     for ( var i = 0; i < mer_numb; i ++ ) {
//         point = RotateAroundV(point, [0, 1, 0], 30 - 10 * mer_numb / 9);
//         var meridian = PlotCircle(point, 90);
//         coords1.push(make_coords(meridian));
//     }
//
//     var par_numb = 8;
//     for ( var i = 0; i < par_numb; i ++ ) {
//         var paralel = PlotCircle([0, 1, 0], i * (30 - 10 * mer_numb / 9));
//         coords1.push(make_coords(paralel));
//     }
//     paralel = PlotCircle([0, 0, 1], 90);
//     coords1.push(make_coords(paralel));
//
//
//
//     var p = 150;
//
//     var right_degree_grid = [];
//     for ( let i = 0; i < coords1.length; i ++ ) {
//         right_degree_grid.push(
//             e('polyline',
//                 {
//                     key: my_key,
//                     points: coords1[i],
//                     stroke: "black",
//                     fill: 'none',
//                     strokeWidth:"0.01px",
//                     strokeDasharray: "2000px"
//                 }
//             )
//         );
//         my_key++;
//     }
//
//     //-----------------------------------------------------------------
//     // right center zone. making point for drawing on right svg
//     //-----------------------------------------------------------------
//     var right_center_zone = e('circle',
//                         {
//                             key: my_key,
//                             r: 0.028,
//                             cx: String(center_zone[0]),
//                             cy: String(center_zone[1]),
//                             fill: 'red',
//
//                         }, ''
//                     );
//     my_key++;
//
//     //-----------------------------------------------------------------
//     // interface
//     //-----------------------------------------------------------------
// //     const Engine = () => {
// //       const [inputOne, setInputOne] = useState('');
// //       const [inputTwo, setInputTwo] = useState('');
// //
// //       function addFood() {
// //         let newFood = {
// //           nameFood: inputOne,
// //           calories: inputTwo
// //         };
// //         state.Food.push(newFood);
// //       }
// //     }
//
//     const my_output = ({ firstName, lastName }: { firstName: string, lastName: string }) => <div>Hey you! {firstName} {lastName}!</div>;
//     const [count, setCount] = useState(0);
//     //-----------------------------------------------------------------
//     // return
//     //-----------------------------------------------------------------
//


    return (
    <div>
        <My_interface />
    </div>
    );
//     return e('div', {className: 'container', display: "flex"},
//                 [
//                     e('h1', {className: 'font-hold', key: 1}, `Test jsx ${count}`),
//
//
//
//                     e('div', {key: 13, float: "left"}, [
//                         e('h5', {key: 1}, "Lambert"),
//                         e('svg', {className: "svg", key: 2, viewBox: "-0.1 -0.1 0.2 0.2"}, [color_poly, grid_lambert, lambert_circles, lambert_center_zone])
//                             ]),
//
//                     e('div', {key: 13, float: "left"}, [
//                         e('h5', {key: 1}, "left svg"),
//                         e('svg', {className: "svg", key: 2, viewBox: "-0.1 -0.1 0.2 0.2"}, [color_poly, left_circles, left_center_zone])
//                             ]),
//
//                     e('div', {key: 13, float: "left"}, [
//                         e('h5', {key: 1}, "center svg"),
//                         e('svg', {className: "svg", key: 3, viewBox: "-1 -1 2 2"}, [color_poly, center_degree_grid, center_circles, center_center_zone])
//                             ]),
//
//                     e('div', {key: 13, float: "left"}, [
//                         e('h5', {key: 1}, "right svg"),
//                         e('svg', {className: "svg", key: 4, viewBox: "-1 -1 2 2"}, [right_degree_grid, right_circles, right_center_zone])
//                            ]),
//
//
//                     e('button', {className: 'btn', key: 4443245, onClick: () => setCount(count + 1), display: "inline-block"}, 'reload'),
//                     e('my_output', {key: 576767777666, firstName: 'ggg', lastname: 'gfdgffg'}, 'enter your data ...'),
//
//
//
//
//
//                 ]
//             );


}
export default App;

