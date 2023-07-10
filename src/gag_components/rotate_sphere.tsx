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


export function rotate_sphere(center_zone: [], dir_list: number[][], angle_list: number[]) {

    //-----------------------------------------------------------------
    // making center zone for drawing on center svg
    //-----------------------------------------------------------------

    var rot_center_zone = RotateAroundV(center_zone, get_perp([0, 0, 1], center_zone), -angle_between_v([0, 0, 1], center_zone) * 180 / Math.PI)

    var center_center_zone = e('circle',
                            {

                                r: 0.018,
                                cx: String(rot_center_zone[0]),
                                cy: String(rot_center_zone[1]),
                                fill: 'red',

                            }, ''
                        );

    //-----------------------------------------------------------------
    // add coords of circles around paleo dirs for center svg
    //-----------------------------------------------------------------

    var center_circles = [];

    for ( var i = 0; i < dir_list.length; i ++ ) {

        var dir_circle = centering(PlotCircle(dir_list[i], angle_list[i]), center_zone);
        center_circles.push(
                                e('polyline',
                                    {

                                        points: make_coords(dir_circle),
                                        stroke: "black",
                                        fill: 'none',
                                        strokeWidth:"0.005px",
                                        strokeDasharray: 50,

                                    }, ''
                                )
                            );

    }


    //-----------------------------------------------------------------
    // making center degree grid to center svg
    //-----------------------------------------------------------------

    var coords = [];

    var point = [0, 0, 1];


    var mer_numb = 8;
    for ( var i = 0; i < mer_numb; i ++ ) {
        point = RotateAroundV(point, [0, 1, 0], 30 - 10 * mer_numb / 9);
        var meridian = centering(PlotCircle(point, 90), center_zone);
        coords.push(make_coords(meridian));
    }

    var par_numb = 8;
    for ( var i = 0; i < par_numb; i ++ ) {
        var paralel = centering(PlotCircle([0, 1, 0], i * (30 - 10 * mer_numb / 9)), center_zone);
        coords.push(make_coords(paralel));
    }

    paralel = PlotCircle([0, 0, 1], 90);
    coords.push(make_coords(paralel));

    var center_degree_grid = [];
    for ( let i = 0; i < coords.length; i ++ ) {
        center_degree_grid.push(
            e('polyline',
                {

                    points: coords[i],
                    stroke: "black",
                    fill: 'none',
                    strokeWidth:"0.007px"
                }, ''
            )
        );

    }






    return (
        <div>rotate_sphere</div>
    )

//                     e('div', {key: 13, float: "left"}, [
//                         e('h5', {key: 1}, "center svg"),
//                         e('svg', {className: "svg", key: 3, viewBox: "-1 -1 2 2"}, [color_poly, center_degree_grid, center_circles, center_center_zone])
//                             ])
}