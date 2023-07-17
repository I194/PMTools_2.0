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
    var zoom_dir_list = zoom_props.dir_list;
    var angle_list = zoom_props.angle_list;
    var zoom_grid_points = zoom_props.grid_points;
    var points_numb = zoom_props.points_numb;
    var zoom_sred_dir = zoom_props.sred_dir;
    var alpha95 = zoom_props.alpha95;



    //-----------------------------------------------------------------
    // making grid on left svg
    //-----------------------------------------------------------------
//     zoom_grid_points = centering(zoom_grid_points, zoom_sred_dir);
    var zgp1 = [];
        for (var i = 0; i < zoom_grid_points.length; i++)
        {
            zgp1.push(
                RotateAroundV(
                    zoom_grid_points[i],
                    get_perp([0, 0, 1], zoom_sred_dir),
                    -angle_between_v([0, 0, 1], zoom_sred_dir) * 180 / Math.PI)
                );
        }


    var grid = [];

    for ( let i = 0; i < zgp1.length; i ++ ) {
        grid.push(
            e('circle',
                {
                    r: 0.00055,
                    cx: String(zgp1[i][0]),
                    cy: String(zgp1[i][1]),
                    fill: '#16732f',
                }, ''
            )
        );
    }

    //-----------------------------------------------------------------
    // polygon of zone
    //-----------------------------------------------------------------


    var color_poly = [];
    var input: [number, number][] = [];

    for ( let i = 0; i < zgp1.length; i ++ )
    {
        input.push([zgp1[i][0], zgp1[i][1]]);
    }

    var cpoly = convexHull(input);
    var poly_points = [];
    console.log();

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
    // making center zone for drawing on left svg
    //-----------------------------------------------------------------

    var rot_center_zone = RotateAroundV(center_zone, get_perp([0, 0, 1], zoom_sred_dir), -angle_between_v([0, 0, 1], zoom_sred_dir) * 180 / Math.PI);

    var left_center_zone = e('circle',
                            {

                                r: 0.0018,
                                cx: String(rot_center_zone[0]),
                                cy: String(rot_center_zone[1]),
                                fill: '#4054E7',

                            }, ''
                        );


    //-----------------------------------------------------------------
    // add coords of circles around paleo dirs for left svg
    //-----------------------------------------------------------------

    var left_circles = [];

    for ( var i = 0; i < zoom_dir_list.length; i ++ ) {

        var dir_circle = centering(PlotCircle(zoom_dir_list[i], angle_list[i], 90), zoom_sred_dir);

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
    // making fisher stat
    //-----------------------------------------------------------------


    var fisher_dir = e('circle',
                            {

                                r: 0.0025,
                                cx: String(0),
                                cy: String(0),
                                fill: 'red',

                            }, ''
                        );



    //---------------------------------------------------------------------------------------
    // making alpha95 circle
    //---------------------------------------------------------------------------------------

    var fish_circle = [];
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

//        {color_poly}

  return (
    <div key={13}>
      <h5 className="my_text">left svg</h5>

      <svg className="svg" key={4} viewBox="-0.1 -0.1 0.2 0.2">
        {color_poly}
        {grid}
        {left_circles}
        {left_center_zone}
        {fisher_dir}
        {fish_circle}
      </svg>

    </div>
  );

//                     e('div', {key: 13, float: "left"}, [
//                         e('h5', {key: 1}, "left svg"),
//                         e('svg', {className: "svg", key: 2, viewBox: "-0.1 -0.1 0.2 0.2"}, [color_poly, left_circles, left_center_zone])
//                             ])
}