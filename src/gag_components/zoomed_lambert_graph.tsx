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


export function zoomed_lambert_graph(center_zone: number[], dir_list: number[][], angle_list: number[], grid_points: number[][], points_numb: number) {


    //---------------------------------------------------------------------------------------
    // making spheral grid for lambert svg
    //---------------------------------------------------------------------------------------

    grid_points = centering(grid_points, center_zone);

    var grid_lambert = [];

    for ( let i = 0; i < grid_points.length; i ++ ) {
        grid_lambert.push(
            e('circle',
                {
                    r: 0.0005,
                    cx: String(grid_points[i][0]),
                    cy: String(grid_points[i][1]),
                    fill: '#199456',
                }, ''
            )
        );
    }

    //-----------------------------------------------------------------
    // making center zone for drawing on lambert svg
    //-----------------------------------------------------------------

    var rot_center_zone = RotateAroundV(center_zone, get_perp([0, 0, 1], center_zone), -angle_between_v([0, 0, 1], center_zone) * 180 / Math.PI)

    var lambert_center_zone = e('circle',
                            {

                                r: 0.0018,
                                cx: String(rot_center_zone[0]),
                                cy: String(rot_center_zone[1]),
                                fill: 'red',

                            }, ''
                        );


    //-----------------------------------------------------------------
    // add coords of circles around paleo dirs for lambert svg
    //-----------------------------------------------------------------

    var lambert_circles = [];

    for ( var i = 0; i < dir_list.length; i ++ ) {

        var dir_circle = centering(PlotCircle(dir_list[i], angle_list[i]), center_zone);
        lambert_circles.push(
                                e('polyline',
                                    {

                                        points: make_coords(dir_circle),
                                        stroke: "black",
                                        fill: 'none',
                                        strokeWidth:"0.001px",
                                        strokeDasharray: 50,

                                    }, ''
                                )
                            );

    }

    return (
        <div>zoomed_lambert_graph</div>
    )
//                     e('div', {key: 13, float: "left"}, [
//                         e('h5', {key: 1}, "Lambert"),
//                         e('svg', {className: "svg", key: 2, viewBox: "-0.1 -0.1 0.2 0.2"}, [color_poly, grid_lambert, lambert_circles, lambert_center_zone])
//                             ])


}