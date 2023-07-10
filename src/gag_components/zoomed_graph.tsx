import React, {createElement as e, useState} from 'react';
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
    zone_square
    } from "./gag_functions";



export function zoomed_graph(center_zone: number[], dir_list: number[][], angle_list: number[], grid_points: number[][], points_numb: number) {


    //---------------------------------------------------------------------------------------
    // making spheral grid for left svg
    //---------------------------------------------------------------------------------------

    grid_points = centering(grid_points, center_zone);

    var grid = [];

    for ( let i = 0; i < grid_points.length; i ++ ) {
        grid.push(
            e('circle',
                {
                    r: 0.00035,
                    cx: String(grid_points[i][0]),
                    cy: String(grid_points[i][1]),
                    fill: '#7B8289',
                }, ''
            )
        );
    }



    //-----------------------------------------------------------------
    // polygons of zone for left svg 2
    //-----------------------------------------------------------------
//
//     //     var color_poly = [];
//     var input: [number, number][] = [];
//
//     for ( let i = 0; i < grid_points.length; i ++ )
//     {
//         input.push([grid_points[i][0], grid_points[i][1]]);
//     }
//
//     var cpoly = convexHull(input);
//     var poly_points = [];
//
//     for ( let i = 0; i < cpoly.length; i ++ )
//     {
//         poly_points.push([cpoly[i][0], cpoly[i][1], 1]);
//     }
//
//
//     for ( var i = 0; i < poly_points.length; i ++ )
//         color_poly.push(
//             e('polygon',
//                 {
//                     points: make_coords(poly_points),
//                     fill: '#AAE1BF',
//                 }, ''
//             )
//         );
    //-----------------------------------------------------------------
    // add coords of circles around paleo dirs for left svg
    //-----------------------------------------------------------------

    var left_circles = [];

    for ( var i = 0; i < dir_list.length; i ++ ) {

        var dir_circle = centering(PlotCircle(dir_list[i], angle_list[i]), center_zone);

        left_circles.push(
                                e('polyline',
                                    {

                                        points: make_coords(dir_circle),
                                        stroke: "black",
                                        fill: 'none',
                                        strokeWidth: "0.001px",
                                        strokeDasharray: "0.01px, 0.003px",
//                                         stroke-dashoffset
                                    }, ''
                                )
                            );

    }
    //-----------------------------------------------------------------
    // polygons of zone for left svg 1
    //-----------------------------------------------------------------
    var color_poly = [];
    var input: [number, number][] = [];
    var circ_p = [];

    for ( var i = 0; i < dir_list.length; i ++ )
    {
        var b = centering(PlotCircle(dir_list[i], angle_list[i]), center_zone);;

        for (var j = 0; j < b.length; j++){
            circ_p.push(b[j]);
        }
    }

    for ( let i = 0; i < circ_p.length; i ++ )
    {
        input.push([circ_p[i][0], circ_p[i][1]]);
    }
    var rot_center_zone = RotateAroundV(center_zone, get_perp([0, 0, 1], center_zone), -angle_between_v([0, 0, 1], center_zone) * 180 / Math.PI);

    var poly_points2d = poly_contour(input, [rot_center_zone[0], rot_center_zone[1]], zone_square(grid_points.length, points_numb));
    var poly_points3d = [];

    for ( let i = 0; i < poly_points2d.length; i ++ )
    {
        poly_points3d.push([poly_points2d[i][0], poly_points2d[i][1], 1 ]);
    }

    color_poly.push(
        e('polygon',
            {
                points: make_coords(poly_points3d),
                fill: '#77D685',
            }, ''
        )
    );

    //-----------------------------------------------------------------
    // making center zone for drawing on left svg
    //-----------------------------------------------------------------

    var rot_center_zone = RotateAroundV(center_zone, get_perp([0, 0, 1], center_zone), -angle_between_v([0, 0, 1], center_zone) * 180 / Math.PI);

    var left_center_zone = e('circle',
                            {

                                r: 0.0018,
                                cx: String(rot_center_zone[0]),
                                cy: String(rot_center_zone[1]),
                                fill: '#4054E7',

                            }, ''
                        );




    return (
        <div>zoomed_graph</div>
    )

//                     e('div', {key: 13, float: "left"}, [
//                         e('h5', {key: 1}, "left svg"),
//                         e('svg', {className: "svg", key: 2, viewBox: "-0.1 -0.1 0.2 0.2"}, [color_poly, left_circles, left_center_zone])
//                             ])
}