import React, {createElement as e, useState} from 'react';
// import {GeoVdek, getRandomfloat} from "./gag_components/gag_functions.js";
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
    lambertMass,
    zone_square
    } from "./gag_functions";


export function Default_sphere(props:{
                                            center_zone: number[],
                                            dir_list: number[][],
                                            angle_list: number[],
                                            grid_points: number[][],
                                            sred_dir: number[],
                                        }) {


    //-----------------------------------------------------------------
    //
    //-----------------------------------------------------------------



    var dir_list = props.dir_list;
    var center_zone = props.center_zone;
    var angle_list = props.angle_list;
    var def_grid_points = props.grid_points;
    var def_sred_dir = props.sred_dir;


    //-----------------------------------------------------------------
    // add coords of circles around paleo dirs for right svg
    //-----------------------------------------------------------------


    var right_circles = [];

    for ( var i = 0; i < dir_list.length; i ++ ) {

        right_circles.push(
                                e('polyline',
                                    {

                                        points: make_coords(PlotCircle(dir_list[i], angle_list[i], 90)),
                                        stroke: "black",
                                        fill: 'none',
                                        strokeWidth:"0.005px",
                                        strokeDasharray: 50,

                                    }, ''
                                )
                            );

    }

    //-----------------------------------------------------------------
    // making right degree grid for right svg
    //-----------------------------------------------------------------

    var coords1 = [];

    var point = [0, 0, 1];

    var mer_numb = 8;
    for ( var i = 0; i < mer_numb; i ++ ) {
        point = RotateAroundV(point, [0, 1, 0], 30 - 10 * mer_numb / 9);
        var meridian = PlotCircle(point, 90, 90);
        coords1.push(make_coords(meridian));
    }

    var par_numb = 8;
    for ( var i = 0; i < par_numb; i ++ ) {
        var paralel = PlotCircle([0, 1, 0], i * (30 - 10 * mer_numb / 9), 90);
        coords1.push(make_coords(paralel));
    }
    paralel = PlotCircle([0, 0, 1], 90, 90);
    coords1.push(make_coords(paralel));



    var p = 150;

    var right_degree_grid = [];
    for ( let i = 0; i < coords1.length; i ++ ) {
        right_degree_grid.push(
            e('polyline',
                {

                    points: coords1[i],
                    stroke: "black",
                    fill: 'none',
                    strokeWidth:"0.01px",
                    strokeDasharray: "2000px"
                }
            )
        );

    }

    //-----------------------------------------------------------------
    // right center zone. making point for drawing on right svg
    //-----------------------------------------------------------------
    var right_center_zone = e('circle',
                        {

                            r: 0.01,
                            cx: String(center_zone[0]),
                            cy: String(center_zone[1]),
                            fill: 'red',

                        }, ''
                    );



  return (
    <div key={13}>
      <h5 className="my_text">right svg</h5>
      <svg className="svg" key={4} viewBox="-1 -1 2 2">
        {right_degree_grid}
        {right_circles}
        {right_center_zone}

      </svg>
    </div>
  );

//     return e('div', {key: 13, float: "left"}, [
//                         e('h5', {key: 1}, "right svg"),
//                         e('svg', {className: "svg", key: 4, viewBox: "-1 -1 2 2"}, [right_degree_grid, right_circles, right_center_zone])
//                            ]
//             );
}