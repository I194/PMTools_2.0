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
    zone_square,
    convexHull
    } from "./gag_functions";



export function Zoomed_graph(zoom_props:{   center_zone: number[],
                                            dir_list: number[][],
                                            angle_list: number[],
                                            grid_points: number[][],
                                            points_numb: number,
                                            sred_dir: number[],
                                            alpha95: number
                                        }) {

    var center_zone = zoom_props.center_zone;
    var dir_list = zoom_props.dir_list;
    var angle_list = zoom_props.angle_list;
    var zoom_grid_points = zoom_props.grid_points;
    var points_numb = zoom_props.points_numb;
    var sred_dir = zoom_props.sred_dir;
    var alpha95 = zoom_props.alpha95;


    //-----------------------------------------------------------------
    // making center zone for drawing on left svg
    //-----------------------------------------------------------------

    var rot_center_zone = RotateAroundV(center_zone, get_perp([0, 0, 1], sred_dir), -angle_between_v([0, 0, 1], sred_dir) * 180 / Math.PI);

    var left_center_zone = e('circle',
                            {

                                r: 0.0018,
                                cx: String(rot_center_zone[0]),
                                cy: String(rot_center_zone[1]),
                                fill: '#4054E7',

                            }, ''
                        );


    //-----------------------------------------------------------------
    // making center zone for drawing on left svg
    //-----------------------------------------------------------------
//     zoom_grid_points = centering(zoom_grid_points, center_zone);

    var grid = [];

    for ( let i = 0; i < zoom_grid_points.length; i ++ ) {
        grid.push(
            e('circle',
                {
                    r: 0.00055,
                    cx: String(zoom_grid_points[i][0]),
                    cy: String(zoom_grid_points[i][1]),
                    fill: '#16732f',
                }, ''
            )
        );
    }
    //-----------------------------------------------------------------
    // add coords of circles around paleo dirs for left svg
    //-----------------------------------------------------------------

    var left_circles = [];

    for ( var i = 0; i < dir_list.length; i ++ ) {

        var dir_circle = centering(PlotCircle(dir_list[i], angle_list[i], 90), sred_dir);

        left_circles.push(
                                e('polyline',
                                    {

                                        points: make_coords(dir_circle),
                                        stroke: "black",
                                        fill: 'none',
                                        strokeWidth: "0.001px",
                                        strokeDasharray: "0.01px, 0.003px",
                                    }, ''
                                )
                            );

    }
    //-----------------------------------------------------------------
    // polygon of zone
    //-----------------------------------------------------------------

    var color_poly = [];
    var input: [number, number][] = [];

    for ( let i = 0; i < zoom_grid_points.length; i ++ )
    {
        input.push([zoom_grid_points[i][0], zoom_grid_points[i][1]]);
    }

    var cpoly = convexHull(input);
    var poly_points = [];

    for ( let i = 0; i < cpoly.length; i ++ )
    {
        poly_points.push([cpoly[i][0], cpoly[i][1], 1]);
    }

    for ( var i = 0; i < poly_points.length; i ++ )
    color_poly.push(
        e('polygon',
            {
                points: make_coords(poly_points),
                fill: '#AAE1BF',
            }, ''
        )
    );



    //-----------------------------------------------------------------
    // making fisher stat
    //-----------------------------------------------------------------

    var rot_sred_dir = RotateAroundV(sred_dir, get_perp([0, 0, 1], sred_dir), -angle_between_v([0, 0, 1], sred_dir) * 180 / Math.PI);
    var fisher_dir = e('circle',
                            {

                                r: 0.0025,
                                cx: String(rot_sred_dir[0]),
                                cy: String(rot_sred_dir[1]),
                                fill: 'red',

                            }, ''
                        );



    //---------------------------------------------------------------------------------------
    // making alpha95 circle
    //---------------------------------------------------------------------------------------

    var fish_circle = [];

    console.log('alpha95');
    console.log(alpha95.toFixed(2));
    console.log('rot_sred_dir');
    console.log([rot_sred_dir[0].toFixed(2), rot_sred_dir[1].toFixed(2), rot_sred_dir[2].toFixed(2)]);

    fish_circle.push(
                            e('polyline',
                                {

                                    points: make_coords(PlotCircle([0, 0, 1], alpha95, 90)),
                                    stroke: "red",
                                    fill: 'none',
                                    strokeWidth: "0.001px",
                                    strokeDasharray: "0.01px, 0.003px",
                                }, ''
                            )
                        );


    //---------------------------------------------------------------------------------------
    // return
    //---------------------------------------------------------------------------------------



  return (
    <div key={13}>
      <h5 className="my_text">left svg</h5>

      <svg className="svg" key={4} viewBox="-0.1 -0.1 0.2 0.2">

        {color_poly}

        {grid}{left_circles}{left_center_zone}{fisher_dir}{fish_circle}
      </svg>

    </div>
  );

//                     e('div', {key: 13, float: "left"}, [
//                         e('h5', {key: 1}, "left svg"),
//                         e('svg', {className: "svg", key: 2, viewBox: "-0.1 -0.1 0.2 0.2"}, [color_poly, left_circles, left_center_zone])
//                             ])
}